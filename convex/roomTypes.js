import { mutation } from './_generated/server'
import { v } from 'convex/values'
import { fail, nid, requireAccess, requireUser, serializeRoomType, assertHotelAccess } from './lib'

export const create = mutation({
  args: {
    token: v.optional(v.string()),
    hotelId: v.optional(v.string()),
    name: v.string(),
    rate: v.number(),
    capacity: v.optional(v.number()),
    amenities: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.token)
    requireAccess(user, 'rooms')
    const hotelId = user.hotelId || args.hotelId
    if (!hotelId) fail(400, 'Select a hotel before adding a room type.')
    assertHotelAccess(user, hotelId)
    const name = args.name.trim()
    if (!name) fail(400, 'Room type name is required.')
    const type = {
      id: nid('t'),
      hotelId,
      name,
      rate: Number(args.rate || 0),
      capacity: Number(args.capacity || 2),
      amenities: args.amenities?.length ? args.amenities : ['Wi-Fi', 'TV', 'Air conditioning'],
    }
    await ctx.db.insert('roomTypes', type)
    return serializeRoomType(type)
  },
})

export const remove = mutation({
  args: {
    token: v.optional(v.string()),
    typeId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.token)
    requireAccess(user, 'rooms')
    const type = await ctx.db
      .query('roomTypes')
      .withIndex('by_id_field', (q) => q.eq('id', args.typeId))
      .unique()
    if (!type) fail(404, 'Room type not found.')
    assertHotelAccess(user, type.hotelId)
    await ctx.db.delete(type._id)
    return { id: type.id }
  },
})
