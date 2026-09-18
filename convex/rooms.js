import { mutation } from './_generated/server'
import { v } from 'convex/values'
import { fail, nid, requireAccess, requireUser, serializeRoom, assertHotelAccess } from './lib'

const tokenArg = { token: v.optional(v.string()) }

export const create = mutation({
  args: {
    ...tokenArg,
    hotelId: v.optional(v.string()),
    number: v.string(),
    floor: v.optional(v.number()),
    type: v.string(),
    rate: v.optional(v.number()),
    capacity: v.optional(v.number()),
    amenities: v.optional(v.array(v.string())),
    status: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.token)
    requireAccess(user, 'rooms')
    const hotelId = user.hotelId || args.hotelId
    if (!hotelId) fail(400, 'Select a hotel before adding a room.')
    assertHotelAccess(user, hotelId)
    const number = args.number.trim()
    if (!number) fail(400, 'Room number is required.')
    const siblings = await ctx.db
      .query('rooms')
      .withIndex('by_hotel', (q) => q.eq('hotelId', hotelId))
      .collect()
    if (siblings.some((room) => room.number === number)) fail(400, 'That room number already exists at this hotel.')
    const room = {
      id: nid('r'),
      hotelId,
      number,
      floor: Number(args.floor || 1),
      type: args.type.trim() || 'Standard',
      rate: Number(args.rate || 0),
      capacity: Number(args.capacity || 2),
      amenities: args.amenities?.length ? args.amenities : ['Wi-Fi', 'TV', 'Air conditioning'],
      status: args.status || 'available',
      notes: args.notes || '',
    }
    await ctx.db.insert('rooms', room)
    return serializeRoom(room)
  },
})

export const update = mutation({
  args: {
    ...tokenArg,
    roomId: v.string(),
    patch: v.any(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.token)
    requireAccess(user, 'rooms')
    const room = await ctx.db
      .query('rooms')
      .withIndex('by_id_field', (q) => q.eq('id', args.roomId))
      .unique()
    if (!room) fail(404, 'Room not found.')
    assertHotelAccess(user, room.hotelId)
    const allowed = ['number', 'floor', 'type', 'rate', 'capacity', 'amenities', 'status', 'notes']
    const next = {}
    for (const key of allowed) {
      if (args.patch?.[key] != null) next[key] = args.patch[key]
    }
    if (next.floor != null) next.floor = Number(next.floor)
    if (next.rate != null) next.rate = Number(next.rate)
    if (next.capacity != null) next.capacity = Number(next.capacity)
    await ctx.db.patch(room._id, next)
    return serializeRoom({ ...room, ...next })
  },
})

export const setStatus = mutation({
  args: {
    token: v.optional(v.string()),
    roomId: v.string(),
    status: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.token)
    requireAccess(user, 'rooms')
    const room = await ctx.db
      .query('rooms')
      .withIndex('by_id_field', (q) => q.eq('id', args.roomId))
      .unique()
    if (!room) fail(404, 'Room not found.')
    assertHotelAccess(user, room.hotelId)
    const patch = { status: args.status }
    if (args.notes != null) patch.notes = args.notes
    await ctx.db.patch(room._id, patch)
    return serializeRoom({ ...room, ...patch })
  },
})
