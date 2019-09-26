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
    const item = await ctx.db.query.item({ where }, `{ id title }`)

    // TODO 2. Check if they have permission to delete it

    // 3. Delete the item & return the response
    return ctx.db.mutation.deleteItem({ where }, info)
    // 4. Delete the image from the cloudinary?
  },
}

module.exports = Mutations
