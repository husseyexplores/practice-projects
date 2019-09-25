const handleize = str =>
  str
    .toLowerCase()
    .replace(/[^\w\u00C0-\u024f]+/g, '-')
    .replace(/^-+|-+$/g, '')

const Mutations = {
  async createItem(parent, args, ctx, info) {
    // TODO: Check if the user is authenticated

    const data = { ...args.data, handle: handleize(args.data.title) }
    const item = await ctx.db.mutation.createItem({ data }, info)

    return item
  },
}

module.exports = Mutations
