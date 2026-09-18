import { mutation } from './_generated/server'
import { v } from 'convex/values'
import { fail, isSuperAdmin, nid, requireAccess, requireUser, serializeOrganization } from './lib'

const tokenArg = { token: v.optional(v.string()) }
const allowed = ['name', 'legalName', 'timezone', 'currency', 'supportEmail']

function requireOrgAccess(user) {
  requireAccess(user, 'settings')
  if (!isSuperAdmin(user)) fail(403, 'Only a Super Admin can manage organizations.')
}

function cleanPatch(patch) {
  const next = {}
  for (const key of allowed) {
    if (patch?.[key] != null) next[key] = typeof patch[key] === 'string' ? patch[key].trim() : patch[key]
  }
  return next
}

async function findOrganization(ctx, organizationId) {
  if (organizationId) {
    return await ctx.db
      .query('organizations')
      .withIndex('by_id_field', (q) => q.eq('id', organizationId))
      .unique()
  }
  return (await ctx.db.query('organizations').collect())[0] || null
}

export const create = mutation({
  args: {
    ...tokenArg,
    name: v.string(),
    legalName: v.optional(v.string()),
    timezone: v.optional(v.string()),
    currency: v.optional(v.string()),
    supportEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.token)
    requireOrgAccess(user)
    const name = args.name.trim()
    if (!name) fail(400, 'Organization name is required.')
    const organization = {
      id: nid('org'),
      name,
      legalName: (args.legalName || name).trim(),
      timezone: (args.timezone || 'Africa/Mogadishu').trim(),
      currency: (args.currency || 'USD').trim() || 'USD',
      supportEmail: (args.supportEmail || '').trim(),
    }
    await ctx.db.insert('organizations', organization)
    return serializeOrganization(organization)
  },
})

export const update = mutation({
  args: {
    ...tokenArg,
    organizationId: v.optional(v.string()),
    patch: v.any(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.token)
    requireOrgAccess(user)
    const current = await findOrganization(ctx, args.organizationId)
    if (!current) fail(404, 'Organization not found.')
    const next = cleanPatch(args.patch)
    if (next.name === '') fail(400, 'Organization name is required.')
    await ctx.db.patch(current._id, next)
    return serializeOrganization({ ...current, ...next })
  },
})

export const remove = mutation({
  args: {
    ...tokenArg,
    organizationId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.token)
    requireOrgAccess(user)
    const current = await findOrganization(ctx, args.organizationId)
    if (!current) fail(404, 'Organization not found.')
    const all = await ctx.db.query('organizations').collect()
    if (all.length <= 1) fail(400, 'Keep at least one organization.')
    await ctx.db.delete(current._id)
    return { id: current.id }
  },
})
