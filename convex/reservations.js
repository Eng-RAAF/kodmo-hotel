import { mutation } from './_generated/server'
import { v } from 'convex/values'
import {
  addDays,
  fail,
  nid,
  nightsBetween,
  requireAccess,
  requireUser,
  serializeGuest,
  serializePayment,
  serializeReservation,
  serializeTask,
  todayIso,
  assertHotelAccess,
} from './lib'

const tokenArg = { token: v.optional(v.string()) }

export const create = mutation({
  args: {
    ...tokenArg,
    hotelId: v.optional(v.string()),
    guestId: v.string(),
    roomId: v.string(),
    checkIn: v.string(),
    checkOut: v.string(),
    status: v.optional(v.string()),
    source: v.optional(v.string()),
    adults: v.optional(v.number()),
    children: v.optional(v.number()),
    extras: v.optional(v.number()),
    rate: v.optional(v.number()),
    paid: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.token)
    requireAccess(user, 'reservations')
    const room = await ctx.db
      .query('rooms')
      .withIndex('by_id_field', (q) => q.eq('id', args.roomId))
      .unique()
    if (!room) fail(400, 'Room not found.')
    assertHotelAccess(user, room.hotelId)
    const nights = nightsBetween(args.checkIn, args.checkOut)
    const extras = Number(args.extras || 0)
    const rate = Number(args.rate || room.rate)
    const reservation = {
      id: nid('rs'),
      hotelId: args.hotelId || room.hotelId,
      guestId: args.guestId,
      roomId: room.id,
      checkIn: args.checkIn,
      checkOut: args.checkOut,
      status: args.status || 'confirmed',
      source: args.source || 'Direct',
      adults: Number(args.adults || 1),
      children: Number(args.children || 0),
      nights,
      rate,
      extras,
      total: rate * nights + extras,
      paid: Number(args.paid || 0),
      notes: args.notes || '',
      createdAt: todayIso(),
    }
    await ctx.db.insert('reservations', reservation)
    if (room.status === 'available' && args.checkIn === todayIso()) {
      await ctx.db.patch(room._id, { status: 'reserved' })
    }
    return serializeReservation(reservation)
  },
})

export const cancel = mutation({
  args: { ...tokenArg, reservationId: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.token)
    requireAccess(user, 'reservations')
    const current = await ctx.db
      .query('reservations')
      .withIndex('by_id_field', (q) => q.eq('id', args.reservationId))
      .unique()
    if (!current) fail(404, 'Reservation not found.')
    assertHotelAccess(user, current.hotelId)
    await ctx.db.patch(current._id, { status: 'cancelled' })
    const room = await ctx.db
      .query('rooms')
      .withIndex('by_id_field', (q) => q.eq('id', current.roomId))
      .unique()
    if (room?.status === 'reserved') {
      await ctx.db.patch(room._id, { status: 'available' })
    }
    return serializeReservation({ ...current, status: 'cancelled' })
  },
})

export const walkIn = mutation({
  args: {
    ...tokenArg,
    hotelId: v.optional(v.string()),
    firstName: v.string(),
    lastName: v.string(),
    phone: v.optional(v.string()),
    idType: v.optional(v.string()),
    idNumber: v.optional(v.string()),
    roomId: v.string(),
    nights: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.token)
    requireAccess(user, 'front-desk')
    requireAccess(user, 'guests')
    requireAccess(user, 'reservations')

    const firstName = args.firstName.trim()
    const lastName = args.lastName.trim()
    const idNumber = (args.idNumber || '').trim()
    if (!firstName) fail(400, 'First name is required.')
    if (!lastName) fail(400, 'Last name is required.')
    if (!idNumber) fail(400, 'Guest ID is required.')
    if (!args.roomId) fail(400, 'Select an available room.')

    const room = await ctx.db
      .query('rooms')
      .withIndex('by_id_field', (q) => q.eq('id', args.roomId))
      .unique()
    if (!room) fail(400, 'Room not found.')
    if (room.status !== 'available') fail(400, 'That room is not available.')
    assertHotelAccess(user, room.hotelId)
    const hotelId = args.hotelId || room.hotelId
    if (hotelId !== room.hotelId) fail(400, 'Room does not belong to that hotel.')

    const checkInDate = todayIso()
    const nights = Math.max(1, Math.floor(Number(args.nights) || 1))
    const checkOutDate = addDays(checkInDate, nights)
    const guest = {
      id: nid('g'),
      firstName,
      lastName,
      email: '',
      phone: (args.phone || '').trim(),
      nationality: 'Somalia',
      vip: false,
      idType: (args.idType || 'National ID').trim() || 'National ID',
      idNumber,
      notes: 'Created from walk-in check-in.',
    }
    await ctx.db.insert('guests', guest)

    const reservation = {
      id: nid('rs'),
      hotelId,
      guestId: guest.id,
      roomId: room.id,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      status: 'checked_in',
      source: 'Walk-in',
      adults: 1,
      children: 0,
      nights,
      rate: room.rate,
      extras: 0,
      total: room.rate * nights,
      paid: 0,
      notes: '',
      createdAt: checkInDate,
    }
    await ctx.db.insert('reservations', reservation)
    await ctx.db.patch(room._id, { status: 'occupied' })
    return {
      guest: serializeGuest(guest),
      reservation: serializeReservation(reservation),
    }
  },
})

export const checkIn = mutation({
  args: { ...tokenArg, reservationId: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.token)
    requireAccess(user, 'front-desk')
    const current = await ctx.db
      .query('reservations')
      .withIndex('by_id_field', (q) => q.eq('id', args.reservationId))
      .unique()
    if (!current) fail(404, 'Reservation not found.')
    assertHotelAccess(user, current.hotelId)
    await ctx.db.patch(current._id, { status: 'checked_in' })
    const room = await ctx.db
      .query('rooms')
      .withIndex('by_id_field', (q) => q.eq('id', current.roomId))
      .unique()
    if (room) await ctx.db.patch(room._id, { status: 'occupied' })
    return serializeReservation({ ...current, status: 'checked_in' })
  },
})

export const checkOut = mutation({
  args: {
    ...tokenArg,
    reservationId: v.string(),
    collectBalance: v.optional(v.boolean()),
    method: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.token)
    requireAccess(user, 'front-desk')
    const current = await ctx.db
      .query('reservations')
      .withIndex('by_id_field', (q) => q.eq('id', args.reservationId))
      .unique()
    if (!current) fail(404, 'Reservation not found.')
    assertHotelAccess(user, current.hotelId)
    if (current.status === 'checked_out') fail(400, 'This stay is already checked out.')
    if (current.status !== 'checked_in') fail(400, 'Guest must be checked in before check-out.')

    const due = Math.max(0, Number(current.total || 0) - Number(current.paid || 0))
    let paid = Number(current.paid || 0)
    let payment = null
    if (due > 0) {
      if (!args.collectBalance) fail(400, 'Collect the remaining folio balance before check-out.')
      payment = {
        id: nid('p'),
        hotelId: current.hotelId,
        reservationId: current.id,
        guestId: current.guestId,
        amount: due,
        method: args.method || 'Card',
        status: 'paid',
        type: 'payment',
        date: todayIso(),
        reference: `REF-${Math.floor(10000 + Math.random() * 90000)}`,
      }
      await ctx.db.insert('payments', payment)
      paid += due
    }

    await ctx.db.patch(current._id, { status: 'checked_out', paid })
    const room = await ctx.db
      .query('rooms')
      .withIndex('by_id_field', (q) => q.eq('id', current.roomId))
      .unique()
    if (room) await ctx.db.patch(room._id, { status: 'dirty' })
    const task = {
      id: nid('hk'),
      hotelId: current.hotelId,
      roomId: current.roomId,
      reservationId: current.id,
      type: 'checkout_clean',
      status: 'pending',
      priority: 'high',
      notes: 'Created at checkout',
      due: todayIso(),
    }
    await ctx.db.insert('housekeepingTasks', task)
    return {
      reservation: serializeReservation({ ...current, status: 'checked_out', paid }),
      task: serializeTask(task),
      payment: payment ? serializePayment(payment) : null,
    }
  },
})
