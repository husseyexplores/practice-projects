const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const {
  deleteCloudinaryImage,
  getCloudinaryPublicIdFromUrl,
} = require('../cloudinary')

const handleize = str =>
  str
    .toLowerCase()
    .replace(/[^\w\u00C0-\u024f]+/g, '-')
    .replace(/^-+|-+$/g, '')

const Mutations = {
  async createItem(parent, args, ctx, info) {
    // TODO: Check if the user is authenticated
    // TODO: Check for the duplicate handle and increment as necessary

    const data = { ...args.data, handle: handleize(args.data.title) }
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

  async signup(parent, args, ctx, info) {
    // Normalize email
    args.email = args.email.toLowerCase()

    // Hash the password
    const password = await bcrypt.hash(args.password, 12)

    // Create the user in the db
    const user = await ctx.db.mutation.createUser(
      {
        data: {
          ...args,
          password,
          permissions: {
            set: ['USER'],
          },
        },
      },
      info
    )

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
}

module.exports = Mutations
