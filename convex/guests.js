import { mutation } from './_generated/server'
import { v } from 'convex/values'
import { fail, nid, requireAccess, requireUser, serializeGuest } from './lib'

const tokenArg = { token: v.optional(v.string()) }

export const create = mutation({
  args: {
    ...tokenArg,
    firstName: v.string(),
    lastName: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    nationality: v.optional(v.string()),
    vip: v.optional(v.boolean()),
    idType: v.optional(v.string()),
    idNumber: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.token)
    requireAccess(user, 'guests')
    const guest = {
      id: nid('g'),
      firstName: args.firstName,
      lastName: args.lastName,
      email: args.email || '',
      phone: args.phone || '',
      nationality: args.nationality || 'Somalia',
      vip: Boolean(args.vip),
      idType: args.idType || 'National ID',
      idNumber: args.idNumber || '',
      notes: args.notes || '',
    }
    await ctx.db.insert('guests', guest)
    return serializeGuest(guest)
  },
})

export const update = mutation({
  args: {
    ...tokenArg,
    guestId: v.string(),
    patch: v.any(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.token)
    requireAccess(user, 'guests')
    const guest = await ctx.db
      .query('guests')
      .withIndex('by_id_field', (q) => q.eq('id', args.guestId))
      .unique()
    if (!guest) fail(404, 'Guest not found.')
    const allowed = ['firstName', 'lastName', 'email', 'phone', 'nationality', 'vip', 'idType', 'idNumber', 'notes']
    const next = {}
    for (const key of allowed) {
      if (args.patch?.[key] != null) next[key] = args.patch[key]
    }
    await ctx.db.patch(guest._id, next)
    return serializeGuest({ ...guest, ...next })
  },
})
