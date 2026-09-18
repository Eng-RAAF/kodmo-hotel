import { mutation } from './_generated/server'
import { v } from 'convex/values'
import {
  HOTEL_MANAGER_ADMIN,
  SUPER_ADMIN,
  fail,
  hashPassword,
  isHotelManagerAdmin,
  isSuperAdmin,
  nid,
  publicUser,
  requireAccess,
  requireUser,
} from './lib'

export const create = mutation({
  args: {
    token: v.optional(v.string()),
    name: v.string(),
    email: v.string(),
    password: v.string(),
    role: v.optional(v.string()),
    hotelId: v.optional(v.string()),
    phone: v.optional(v.string()),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const actor = await requireUser(ctx, args.token)
    requireAccess(actor, 'settings')

    const email = args.email.trim().toLowerCase()
    const name = args.name.trim()
    if (!name) fail(400, 'Name is required.')
    if (!email) fail(400, 'Email is required.')
    if (!args.password || args.password.length < 6) fail(400, 'Password must be at least 6 characters.')

    let role = args.role || HOTEL_MANAGER_ADMIN
    let hotelId = args.hotelId || undefined

    if (isHotelManagerAdmin(actor)) {
      role = HOTEL_MANAGER_ADMIN
      hotelId = actor.hotelId
    } else if (!isSuperAdmin(actor)) {
      fail(403, 'Only Super Admin or Hotel Manager Admin can create admins.')
    }

    if (role !== SUPER_ADMIN && role !== HOTEL_MANAGER_ADMIN) {
      fail(400, 'Login accounts must be Super Admin or Hotel Manager Admin.')
    }
    if (role === SUPER_ADMIN) {
      if (!isSuperAdmin(actor)) fail(403, 'Only a Super Admin can create another Super Admin.')
      hotelId = undefined
    } else {
      if (!hotelId) fail(400, 'Hotel Manager Admin must be assigned to a hotel.')
      const hotel = await ctx.db
        .query('hotels')
        .withIndex('by_id_field', (q) => q.eq('id', hotelId))
        .unique()
      if (!hotel) fail(400, 'Hotel not found.')
    }

    const existing = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', email))
      .unique()
    if (existing) fail(400, 'An account with this email already exists.')

    const account = {
      id: nid('u'),
      name,
      email,
      passwordHash: await hashPassword(args.password),
      role,
      phone: args.phone || '',
      title: args.title || (role === SUPER_ADMIN ? 'Super Admin' : 'Hotel Manager Admin'),
    }
    if (hotelId) account.hotelId = hotelId
    await ctx.db.insert('users', account)
    return publicUser(account)
  },
})

async function superAdminCount(ctx) {
  const users = await ctx.db.query('users').collect()
  return users.filter((account) => isSuperAdmin(account)).length
}

export const update = mutation({
  args: {
    token: v.optional(v.string()),
    userId: v.string(),
    patch: v.any(),
  },
  handler: async (ctx, args) => {
    const actor = await requireUser(ctx, args.token)
    requireAccess(actor, 'settings')
    if (!isSuperAdmin(actor)) fail(403, 'Only a Super Admin can manage admin roles.')

    const account = await ctx.db
      .query('users')
      .withIndex('by_id_field', (q) => q.eq('id', args.userId))
      .unique()
    if (!account) fail(404, 'Admin not found.')

    let role = args.patch?.role || account.role
    let hotelId = args.patch?.hotelId === undefined ? account.hotelId : args.patch.hotelId
    if (role !== SUPER_ADMIN && role !== HOTEL_MANAGER_ADMIN) {
      fail(400, 'Login accounts must be Super Admin or Hotel Manager Admin.')
    }
    if (isSuperAdmin(account) && role !== SUPER_ADMIN && (await superAdminCount(ctx)) <= 1) {
      fail(400, 'Keep at least one Super Admin.')
    }
    if (role === SUPER_ADMIN) {
      hotelId = undefined
    } else {
      if (!hotelId) fail(400, 'Hotel Manager Admin must be assigned to a hotel.')
      const hotel = await ctx.db
        .query('hotels')
        .withIndex('by_id_field', (q) => q.eq('id', hotelId))
        .unique()
      if (!hotel) fail(400, 'Hotel not found.')
    }

    const next = {
      id: account.id,
      name: args.patch?.name != null ? String(args.patch.name).trim() : account.name,
      email: account.email,
      passwordHash: account.passwordHash,
      role,
      phone: args.patch?.phone != null ? args.patch.phone : account.phone || '',
      title:
        args.patch?.title != null
          ? args.patch.title
          : role === SUPER_ADMIN
            ? 'Super Admin'
            : 'Hotel Manager Admin',
    }
    if (!next.name) fail(400, 'Name is required.')
    if (hotelId) next.hotelId = hotelId
    await ctx.db.replace(account._id, next)
    return publicUser(next)
  },
})

export const remove = mutation({
  args: {
    token: v.optional(v.string()),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const actor = await requireUser(ctx, args.token)
    requireAccess(actor, 'settings')
    if (!isSuperAdmin(actor)) fail(403, 'Only a Super Admin can remove admin accounts.')
    if (actor.id === args.userId) fail(400, 'You cannot delete your own account.')
    const account = await ctx.db
      .query('users')
      .withIndex('by_id_field', (q) => q.eq('id', args.userId))
      .unique()
    if (!account) fail(404, 'Admin not found.')
    if (isSuperAdmin(account) && (await superAdminCount(ctx)) <= 1) {
      fail(400, 'Keep at least one Super Admin.')
    }
    const sessions = await ctx.db.query('sessions').collect()
    for (const session of sessions) {
      if (session.userId === account.id) await ctx.db.delete(session._id)
    }
    await ctx.db.delete(account._id)
    return { id: account.id }
  },
})
