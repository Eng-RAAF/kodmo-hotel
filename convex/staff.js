import { mutation } from './_generated/server'
import { v } from 'convex/values'
import { fail, nid, requireAccess, requireUser, serializeStaff, assertHotelAccess } from './lib'

const tokenArg = { token: v.optional(v.string()) }

export const create = mutation({
  args: {
    ...tokenArg,
    name: v.string(),
    email: v.string(),
    role: v.string(),
    hotelId: v.string(),
    department: v.string(),
    shift: v.optional(v.string()),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.token)
    requireAccess(user, 'staff')
    assertHotelAccess(user, args.hotelId)
    const member = {
      id: nid('s'),
      name: args.name,
      email: args.email,
      role: args.role,
      hotelId: args.hotelId,
      department: args.department,
      shift: args.shift || 'Day',
      phone: args.phone || '',
      status: 'active',
    }
    await ctx.db.insert('staff', member)
    return serializeStaff(member)
  },
})

export const update = mutation({
  args: {
    ...tokenArg,
    staffId: v.string(),
    patch: v.any(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.token)
    requireAccess(user, 'staff')
    const member = await ctx.db
      .query('staff')
      .withIndex('by_id_field', (q) => q.eq('id', args.staffId))
      .unique()
    if (!member) fail(404, 'Staff member not found.')
    assertHotelAccess(user, member.hotelId)
    const allowed = ['name', 'email', 'role', 'hotelId', 'department', 'shift', 'phone', 'status']
    const next = {}
    for (const key of allowed) {
      if (args.patch?.[key] != null) next[key] = args.patch[key]
    }
    await ctx.db.patch(member._id, next)
    return serializeStaff({ ...member, ...next })
  },
})
