import { mutation } from './_generated/server'
import { v } from 'convex/values'
import { fail, requireUser, serializeNotification } from './lib'

export const markRead = mutation({
  args: { token: v.optional(v.string()), notificationId: v.string() },
  handler: async (ctx, args) => {
    await requireUser(ctx, args.token)
    const item = await ctx.db
      .query('notifications')
      .withIndex('by_id_field', (q) => q.eq('id', args.notificationId))
      .unique()
    if (!item) fail(404, 'Notification not found.')
    await ctx.db.patch(item._id, { read: true })
    return serializeNotification({ ...item, read: true })
  },
})

export const markAllRead = mutation({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireUser(ctx, args.token)
    const rows = await ctx.db.query('notifications').collect()
    for (const item of rows) {
      if (!item.read) await ctx.db.patch(item._id, { read: true })
    }
    return rows.map((item) => serializeNotification({ ...item, read: true }))
  },
})
