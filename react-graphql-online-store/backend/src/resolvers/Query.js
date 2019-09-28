const { forwardTo } = require('prisma-binding')

const Query = {
  items: forwardTo('db'),
  item: forwardTo('db'),
  itemsConnection: forwardTo('db'),
  me: async (parent, args, ctx, info) => {
    const { userId } = ctx.request
    if (!userId) return null

    const user = await ctx.db.query.user({ where: { id: userId } }, info)
    return user
  },
}

module.exports = Query
