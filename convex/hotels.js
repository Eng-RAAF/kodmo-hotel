import { mutation, query } from './_generated/server'
import { v } from 'convex/values'
import {
  HOTEL_MANAGER_ADMIN,
  fail,
  hashPassword,
  isSuperAdmin,
  nid,
  publicUser,
  requireAccess,
  requireUser,
  serializeHotel,
} from './lib'

const tokenArg = { token: v.optional(v.string()) }

async function loadHotel(ctx, hotelId) {
  const hotel = await ctx.db
    .query('hotels')
    .withIndex('by_id_field', (q) => q.eq('id', hotelId))
    .unique()
  if (!hotel) fail(404, 'Hotel not found.')
  return hotel
}

async function roomCount(ctx, hotelId) {
  const rooms = await ctx.db
    .query('rooms')
    .withIndex('by_hotel', (q) => q.eq('hotelId', hotelId))
    .collect()
  return rooms.length
}

async function createManagerAccount(ctx, { hotelId, name, email, password }) {
  const cleanedEmail = email.trim().toLowerCase()
  const cleanedName = name.trim()
  if (!cleanedName) fail(400, 'Hotel manager name is required.')
  if (!cleanedEmail) fail(400, 'Hotel manager email is required.')
  if (!password || password.length < 6) fail(400, 'Hotel manager password must be at least 6 characters.')
  const existing = await ctx.db
    .query('users')
    .withIndex('by_email', (q) => q.eq('email', cleanedEmail))
    .unique()
  if (existing) fail(400, 'An account with this email already exists.')
  const account = {
    id: nid('u'),
    name: cleanedName,
    email: cleanedEmail,
    passwordHash: await hashPassword(password),
    role: HOTEL_MANAGER_ADMIN,
    hotelId,
    phone: '',
    title: 'Hotel Manager Admin',
  }
  await ctx.db.insert('users', account)
  return publicUser(account)
}

export const create = mutation({
  args: {
    ...tokenArg,
    name: v.string(),
    city: v.string(),
    country: v.optional(v.string()),
    address: v.optional(v.string()),
    stars: v.optional(v.number()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    manager: v.optional(v.string()),
    managerName: v.optional(v.string()),
    managerEmail: v.optional(v.string()),
    managerPassword: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.token)
    requireAccess(user, 'hotels')
    if (!isSuperAdmin(user)) fail(403, 'Only a Super Admin can register hotels.')
    const name = args.name.trim()
    const city = args.city.trim()
    if (!name) fail(400, 'Hotel name is required.')
    if (!city) fail(400, 'City is required.')
    const hotel = {
      id: nid('h'),
      name,
      city,
      country: (args.country || 'Somalia').trim() || 'Somalia',
      address: (args.address || '').trim(),
      stars: Number(args.stars || 4),
      phone: (args.phone || '').trim(),
      email: (args.email || '').trim(),
      manager: (args.manager || args.managerName || '').trim(),
      status: 'pending',
      accent: 'from-slate-700/80 to-navy-900',
    }
    await ctx.db.insert('hotels', hotel)
    let manager = null
    if (args.managerEmail) {
      manager = await createManagerAccount(ctx, {
        hotelId: hotel.id,
        name: args.managerName || args.manager || name,
        email: args.managerEmail,
        password: args.managerPassword,
      })
      if (manager.name && !hotel.manager) {
        await ctx.db.patch((await loadHotel(ctx, hotel.id))._id, { manager: manager.name })
        hotel.manager = manager.name
      }
    }
    return { hotel: serializeHotel(hotel, 0), manager }
  },
})

export const update = mutation({
  args: {
    ...tokenArg,
    hotelId: v.string(),
    patch: v.any(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.token)
    requireAccess(user, 'hotels')
    if (!isSuperAdmin(user)) fail(403, 'Only a Super Admin can update hotels.')
    const hotel = await loadHotel(ctx, args.hotelId)
    const allowed = ['name', 'city', 'country', 'address', 'stars', 'phone', 'email', 'manager', 'status', 'accent']
    const next = {}
    for (const key of allowed) {
      if (args.patch?.[key] != null) next[key] = args.patch[key]
    }
    if (next.stars != null) next.stars = Number(next.stars)
    await ctx.db.patch(hotel._id, next)
    return serializeHotel({ ...hotel, ...next }, await roomCount(ctx, hotel.id))
  },
})

export const verify = mutation({
  args: {
    ...tokenArg,
    hotelId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.token)
    requireAccess(user, 'hotels')
    if (!isSuperAdmin(user)) fail(403, 'Only a Super Admin can verify hotels.')
    const hotel = await loadHotel(ctx, args.hotelId)
    if (hotel.status === 'active') fail(400, 'This hotel is already verified.')
    await ctx.db.patch(hotel._id, { status: 'active' })
    return serializeHotel({ ...hotel, status: 'active' }, await roomCount(ctx, hotel.id))
  },
})

export const setStatus = mutation({
  args: {
    ...tokenArg,
    hotelId: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.token)
    requireAccess(user, 'hotels')
    if (!isSuperAdmin(user)) fail(403, 'Only a Super Admin can change hotel status.')
    const status = args.status.trim()
    if (!['pending', 'active', 'inactive'].includes(status)) fail(400, 'Hotel status must be pending, active, or inactive.')
    const hotel = await loadHotel(ctx, args.hotelId)
    await ctx.db.patch(hotel._id, { status })
    return serializeHotel({ ...hotel, status }, await roomCount(ctx, hotel.id))
  },
})

export const publicList = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx) => {
    const hotels = await ctx.db.query('hotels').collect()
    const rooms = await ctx.db.query('rooms').collect()
    hotels.sort((a, b) => a.name.localeCompare(b.name))
    return hotels
      .filter((hotel) => hotel.status !== 'inactive')
      .map((hotel) => {
        const hotelRooms = rooms.filter((room) => room.hotelId === hotel.id)
        const occupied = hotelRooms.filter((room) => room.status === 'occupied').length
        const sellable = hotelRooms.filter((room) => room.status !== 'out_of_order').length
        const occ = sellable ? Math.round((occupied / sellable) * 100) : 82
        return {
          ...serializeHotel(hotel, hotelRooms.length),
          occ,
          reviews: 400 + (hotel.name.length * 73) % 8000,
        }
      })
  },
})

export const loginOptions = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx) => {
    const users = await ctx.db.query('users').collect()
    const hotels = await ctx.db.query('hotels').collect()
    const hotelById = new Map(hotels.map((hotel) => [hotel.id, hotel]))
    const options = []
    const hotelsWithLogin = new Set()
    for (const account of users) {
      if (account.role === 'Super Admin') {
        options.push({
          email: account.email,
          label: 'Super Admin',
          role: account.role,
          hotelId: null,
        })
        continue
      }
      if (account.role !== HOTEL_MANAGER_ADMIN) continue
      const hotel = hotelById.get(account.hotelId)
      if (!hotel || hotel.status === 'inactive') continue
      hotelsWithLogin.add(hotel.id)
      options.push({
        email: account.email,
        label: hotel.name,
        role: account.role,
        hotelId: hotel.id,
      })
    }
    for (const hotel of hotels) {
      if (hotel.status === 'inactive' || hotelsWithLogin.has(hotel.id)) continue
      options.push({
        email: '',
        label: `${hotel.name} (no manager)`,
        role: 'hotel',
        hotelId: hotel.id,
      })
    }
    options.sort((a, b) => {
      if (a.role === 'Super Admin' && b.role !== 'Super Admin') return -1
      if (b.role === 'Super Admin' && a.role !== 'Super Admin') return 1
      return a.label.localeCompare(b.label) || String(a.email || '').localeCompare(String(b.email || ''))
    })
    const hotelCounts = {}
    for (const option of options) {
      if (option.hotelId && option.email) hotelCounts[option.hotelId] = (hotelCounts[option.hotelId] || 0) + 1
    }
    return options.map((option) => (
      option.hotelId && hotelCounts[option.hotelId] > 1
        ? { ...option, label: `${option.label} · ${option.email}` }
        : option
    ))
  },
})
