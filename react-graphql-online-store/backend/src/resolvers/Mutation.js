const { forwardTo } = require('prisma-binding')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const { promisify } = require('util')

const stripe = require('../stripe')
const {
  deleteCloudinaryImage,
  getCloudinaryPublicIdFromUrl,
} = require('../cloudinary')
const { mailer, hasPermission, isAuthorized } = require('../utils')

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
    const { user } = ctx.request
    const { where } = args

    // 1. Find the item
    const item = await ctx.db.query.item(
      { where },
      `{ id title image user { id } }`
    )

    // 2. Check if they have permission to delete it
    const ownsItem = item.user.id === user.id
    const hasPermissions = user.permissions.some(
      p => p === 'ADMIN' || p === 'ITEMDELETE'
    )

    if (!ownsItem && !hasPermissions) {
      throw new Error('Insufficient permissions.')
    }

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

  async updateUser(parent, args, ctx, info) {
    // 1. Check if they are logged in
    const { userId, user } = ctx.request

    if (!userId) {
      throw new Error('You must be logged in to perform this operation.')
    }

    const userToBeUpdated = await ctx.db.query.user(
      { where: args.where },
      `{ id permissions email }`
    )

    let isAdmin = false
    let canUpdatePermissions = false
    try {
      isAdmin = hasPermission(user, ['ADMIN'])
      canUpdatePermissions = hasPermission(user, ['PERMISSIONUPDATE'])
    } catch (err) {
      isAdmin = false
    }

    // 2. If they are only updating permissions, make sure they have sufficient permissions (They can update ANY user's permissions (except Admin's) )
    const onlyUpdatingPermissions =
      Object.keys(args.data).length === 1 && !!args.data.permissions
    if (onlyUpdatingPermissions) {
      // Make sure they are not updating the admin IF they are also not admin
      if (userToBeUpdated.permissions.includes('ADMIN')) {
        // Update the permissions
        if (isAdmin) {
          return forwardTo('db')(parent, args, ctx, info)
        }
      } else {
        // They user they are updting is not ADMIN & they also have permissions to update the user, then let them do so
        return forwardTo('db')(parent, args, ctx, info)
      }
    }

    // 3. They are updating not only permissions but also other data
    // Make sure they only update their own profile UNLESS they are ADMIN
    // (Admins can update all the users)
    const uniqueId = args.where.email || args.where.id
    const isUpdatingSelf = uniqueId === user.id || uniqueId === user.email
    if (!isUpdatingSelf && !isAdmin) {
      // Provide vague error for security concerns
      throw new Error('You are not authorized to perform this operation.')
    }

    // 3. If updating permissions, check if they actually have permissions to update the permission
    if (args.data.permissions && (!isAdmin || !canUpdatePermissions)) {
      // this will throw the error if the permission are not sufficient
      throw new Error('Insufficient permissions.')
    }

    // 4. Update the user in the database
    return forwardTo('db')(parent, args, ctx, info)
  },

  addToCart: isAuthorized(async (parent, args, ctx) => {
    const quantity = args.quantity || 1
    // 0. Basic sanity checks
    if (quantity && quantity < 1) {
      throw new Error('Quantity must be a positive integer.')
    }

    // 1. Query the user's current cart
    const { userId } = ctx.request

    // 2. Check if the item is already in the cart
    const [existingCartItem] = await ctx.db.query.cartItems({
      where: { user: { id: userId }, item: { id: args.id } },
    })

    // 3. If the item is in the cart, increment the quantity.
    if (existingCartItem) {
      const updatedQty = existingCartItem.quantity + quantity
      return ctx.db.mutation.updateCartItem({
        where: { id: existingCartItem.id },
        data: { quantity: updatedQty },
      })
    }

    // otherwise add it to cart with the given quantity (default quantity: 1)
    return ctx.db.mutation.createCartItem({
      data: {
        quantity,
        user: { connect: { id: userId } },
        item: { connect: { id: args.id } },
      },
    })
  }),

  removeFromCart: isAuthorized(async (parent, args, ctx, info) => {
    // 1. Find the cart item
    const { userId } = ctx.request
    const cartItem = await ctx.db.query.cartItem(
      {
        where: { id: args.id },
      },
      `{ id, user { id } }`
    )

    // 2. Make sure that item exists and they own that cart item
    if (!cartItem || userId !== cartItem.user.id) {
      throw new Error(`No item found with id ${args.id}.`)
    }

    // 3. Delete the item and return the deleted item
    return ctx.db.mutation.deleteCartItem(
      {
        where: { id: args.id },
      },
      info
    )
  }),

  updateCartItemQuantity: isAuthorized(async (parent, args, ctx, info) => {
    // 0. Basic sanity checks
    if (args.quantity < 0) {
      // Quantity zero is allowed (zero means delete the item from cart)
      throw new Error('Quantity must be zero or a positive integer.')
    }

    // 1. Find the cart item
    const { userId } = ctx.request
    const cartItem = await ctx.db.query.cartItem(
      {
        where: { id: args.id },
      },
      `{ id, user { id } }`
    )

    // 2. Make sure that the item exists and they own that cart item
    if (!cartItem || userId !== cartItem.user.id) {
      throw new Error(`No item found with id ${args.id}`)
    }

    // 3. Update the quantity or delete the item and return the item
    if (args.quantity === 0) {
      // If the quantity is zero, delete the item from the cart
      const deletedItem = await ctx.db.mutation.deleteCartItem(
        {
          where: { id: args.id },
        },
        info
      )
      // Update the quantity manually before sending the response.
      // (Otherwise, the item would contain the original quantity)
      if (deletedItem.quantity) {
        deletedItem.quantity = 0
      }
      return deletedItem
    }

    // Otherwise, update the quantity
    return ctx.db.mutation.updateCartItem(
      {
        where: { id: args.id },
        data: { quantity: args.quantity },
      },
      info
    )
  }),

  createOrder: isAuthorized(async (parent, args, ctx, info) => {
    const { userId } = ctx.request

    // 1. Recalculate the total for the price
    const user = await ctx.db.query.user(
      { where: { id: userId } },
      `{
        id
        name
        email
        cart {
          id
          quantity
          item {
            id
            title
            price
            description
            image
            largeImage
          }
        }
      }`
    )
    const totalOrderPrice = user.cart.reduce((sum, cartItem) => {
      if (!cartItem || !cartItem.item) return sum
      return sum + cartItem.item.price * cartItem.quantity
    }, 0)

    // 2. Create the stripe charge
    const charge = await stripe.charges.create({
      amount: totalOrderPrice,
      currency: 'USD',
      source: args.token,
    })

    // 3. Convert the CartItems to OrderItems
    const orderItems = user.cart
      .filter(cartItem => Boolean(cartItem.item))
      .map(({ item, quantity }) => ({
        quantity,
        title: item.title,
        price: item.price,
        description: item.description,
        image: item.image,
        largeImage: item.largeImage,
        user: {
          connect: { id: userId },
        },
      }))

    // 4. Create the order
    const order = await ctx.db.mutation.createOrder({
      data: {
        total: charge.amount,
        charge: charge.id,
        items: { create: orderItems },
        user: { connect: { id: userId } },
      },
    })

    // 6. Clean up - Clear the users cart & delete the cart items
    const cartItemIds = user.cart.map(({ id }) => id)
    await ctx.db.mutation.deleteManyCartItems({ where: { id_in: cartItemIds } })

    // 7. Return the order
    return order
  }),
}

module.exports = Mutations
