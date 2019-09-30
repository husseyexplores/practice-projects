const { forwardTo } = require('prisma-binding')
const { hasPermission } = require('../utils')

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
  users: async (parent, args, ctx, info) => {
    // 1. Check if they are logged in
    const { userId, user } = ctx.request

    if (!userId) {
      throw new Error('You must be logged in to perform this operation.')
    }

    // 2. Check if the user has the permission to query all the users
    // Ithis will throw the error if the permission are not sufficient
    hasPermission(user, ['ADMIN', 'PERMISSIONUPDATE'])

    return ctx.db.query.users({}, info)
  },
}

module.exports = Query
