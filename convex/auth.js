import { mutation, query } from './_generated/server'
import { v } from 'convex/values'
import { fail, hashPassword, publicUser, requireUser, verifyPassword } from './lib'

const tokenArg = { token: v.optional(v.string()) }

export const login = mutation({
  args: { token: v.optional(v.string()), email: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase()
    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', email))
      .unique()
    if (!user || !(await verifyPassword(args.password, user.passwordHash))) {
      fail(401, 'Invalid email or password.')
    }
    const token = crypto.randomUUID()
    await ctx.db.insert('sessions', {
      token,
      userId: user.id,
      createdAt: Date.now(),
    })
    return { token, user: publicUser(user) }
  },
})

export const forgotPassword = mutation({
  args: { token: v.optional(v.string()), email: v.string() },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase()
    await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', email))
      .unique()
    return { ok: true, message: 'If an account exists, a reset link would be sent.' }
  },
})

export const me = query({
  args: tokenArg,
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.token)
    return { user: publicUser(user) }
  },
})

export const updateProfile = mutation({
  args: {
    token: v.optional(v.string()),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.token)
    const patch = {}
    if (args.name != null) patch.name = args.name
    if (args.phone != null) patch.phone = args.phone
    if (args.title != null) patch.title = args.title
    await ctx.db.patch(user._id, patch)
    return { user: publicUser({ ...user, ...patch }) }
  },
})

export const updatePassword = mutation({
  args: {
    token: v.optional(v.string()),
    current: v.string(),
    next: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.token)
    if (!(await verifyPassword(args.current, user.passwordHash))) {
      fail(400, 'Current password is incorrect.')
    }
    if (!args.next || args.next.length < 6) {
      fail(400, 'New password must be at least 6 characters.')
    }
    await ctx.db.patch(user._id, { passwordHash: await hashPassword(args.next) })
    return { ok: true }
  },
})

export const logout = mutation({
  args: tokenArg,
  handler: async (ctx, args) => {
    if (!args.token) return { ok: true }
    const session = await ctx.db
      .query('sessions')
      .withIndex('by_token', (q) => q.eq('token', args.token))
      .unique()
    if (session) await ctx.db.delete(session._id)
    return { ok: true }
  },
})
