const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const { promisify } = require('util')
const {
  deleteCloudinaryImage,
  getCloudinaryPublicIdFromUrl,
} = require('../cloudinary')
const { mailer } = require('../utils')

const randomBytes = promisify(crypto.randomBytes)
const handleize = str =>
  str
    .toLowerCase()
    .replace(/[^\w\u00C0-\u024f]+/g, '-')
    .replace(/^-+|-+$/g, '')

const Mutations = {
  async createItem(parent, args, ctx, info) {
    // Check if the user is authenticated
    const notLoggedIn = !ctx.request.userId
    if (notLoggedIn) {
      throw new Error('You must be logged in to perform this operation.')
    }

    // TODO: Check for the duplicate handle and increment as necessary

    const data = {
      ...args.data,
      handle: handleize(args.data.title),
      // Create relationship between item & user in prisma backend
      user: {
        connect: { id: ctx.request.userId },
      },
    }
    const item = await ctx.db.mutation.createItem({ data }, info)

    return item
  },

  async updateItem(parent, args, ctx, info) {
    // TODO: Check for the duplicate handle and increment as necessary

    // first take a copy of the updates
    const updates = { ...args }

    // If title is changed, update the handle
    if (args.title) {
      updates.handle = handleize(args.title)
    }

    // remove the id from the updates
    delete updates.id
    // run the update method
    const updatedItem = await ctx.db.mutation.updateItem(
      {
        data: updates,
        where: { id: args.id },
      },
      info
    )

    return updatedItem
  },

  async deleteItem(parent, args, ctx, info) {
    const { where } = args

    // 1. Find the item
    const item = await ctx.db.query.item({ where }, `{ id title image }`)

    // TODO 2. Check if they have permission to delete it

    // 4. Delete the image from the cloudinary - don't wait for the response.
    const isCloudinaryImg = item.image.toLowerCase().includes('cloudinary')
    if (item && item.image && isCloudinaryImg) {
      const publicId = getCloudinaryPublicIdFromUrl(item.image)
      deleteCloudinaryImage(`sickfits/${publicId}`)
    }

    // 3. Delete the item & return the response
    return ctx.db.mutation.deleteItem({ where }, info)
  },

  async signup(parent, args, ctx) {
    // Normalize email
    args.email = args.email.toLowerCase()

    // Hash the password
    const password = await bcrypt.hash(args.password, 12)

    // Create the user in the db
    const user = await ctx.db.mutation.createUser({
      data: {
        ...args,
        password,
        permissions: {
          set: ['USER'],
        },
      },
    })

    // Create the JWT token to log the user in
    const token = jwt.sign(
      {
        userId: user.id,
      },
      process.env.APP_SECRET
    )

    // Set the token as cookie on the response
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year cookie
    })

    // Finally, return the response
    return user
  },

  async signin(parent, args, ctx) {
    // Normalize email
    args.email = args.email.toLowerCase()

    // 1. Check if the user exists with the given email
    // Manually requesting each field because there is some issue
    // with `permissions`. It does not come back from the database
    // unless explicitly specified here.
    // (Maybe due to prisma @scalarList(strategy: RELATION))
    const user = await ctx.db.query.user(
      { where: { email: args.email } },
      `{ id email password name permissions resetToken resetTokenExpiry }`
    )

    if (!user) {
      throw new Error('User does not exist')
    }

    // 2. Check if the password is correct
    const isValidPw = await bcrypt.compare(args.password, user.password)

    if (!isValidPw) {
      throw new Error('Invalid password')
    }

    // 3. Generate the JWT token to log the user in
    const token = jwt.sign(
      {
        userId: user.id,
      },
      process.env.APP_SECRET
    )

    // 4. Set the token as cookie on the response
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year cookie
    })

    // 5. Finally, return the response
    return user
  },

  async signout(parent, args, ctx) {
    ctx.response.clearCookie('token')

    // gql SuccessMessage type
    return { message: 'Goodbye!' }
  },

  async requestReset(parent, args, ctx) {
    args.email = args.email.toLowerCase()

    // 1. Check if the user exists
    const user = await ctx.db.query.user(
      { where: { email: args.email } },
      `{ id email password name permissions resetToken resetTokenExpiry }`
    )

    if (!user) {
      throw new Error('User does not exist')
    }

    // 2. Set a reset token & expiry on that user
    const resetToken = (await randomBytes(20)).toString('hex')
    const resetTokenExpiry = Date.now() + 3600000 // 1 hour from now
    await ctx.db.mutation.updateUser({
      where: { email: args.email },
      data: { resetToken, resetTokenExpiry },
    })

    // 3. Email them that reset token
    mailer.sendMail({
      to: args.email,
      from: 'husseyexplores.com',
      subject: 'Password reset - SickFits',
      html: `
      <div>
        <p>You requested a password reset</p>
        <p><a href="${
          process.env.FRONTEND_URL
        }/reset-password?resetToken=${resetToken}&email=${
        args.email
      }">Click here to set a new password</a></p>
      </div>
      `,
    })

    // gql SuccessMessage type
    return { message: 'Please check your email' }
  },

  async resetPassword(parent, args, ctx) {
    let { email, password, confirmPassword, resetToken } = args

    // 1. Check if the user exists
    const user = await ctx.db.query.user({ where: { email } })

    if (!user) {
      throw new Error('Token is either invalid or expired')
    }

    // 2. Check if the resetToken is valid & not expired
    const tokenNotValid = resetToken !== user.resetToken
    const tokenExpired =
      user.resetTokenExpiry && user.resetTokenExpiry < Date.now() - 3600000
    if (tokenNotValid || tokenExpired) {
      throw new Error('Token is either invalid or expired')
    }

    // 3. Check if the passwords match
    if (password !== confirmPassword) {
      throw new Error('Passwords do not match')
    }

    // 4. Hash their new password
    password = await bcrypt.hash(args.password, 12)

    // 5. Save the new password to the user and remove old restToken & expiry
    const updatedUser = await ctx.db.mutation.updateUser({
      where: { email },
      data: {
        password,
        resetToken: null,
        resetTokenExpiry: null,
      },
    })

    // 6. Generate JWT (Log them in)
    const jwtToken = jwt.sign(
      {
        userId: user.id,
      },
      process.env.APP_SECRET
    )

    // 7. Set the JWT cookie on the response
    ctx.response.cookie('token', jwtToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year cookie
    })

    // 8. return the new user
    return updatedUser
  },
}

module.exports = Mutations
