import { mutation } from './_generated/server'
import { v } from 'convex/values'
import { fail, nid, requireAccess, requireUser, serializePayment, serializeReservation, todayIso, assertHotelAccess } from './lib'

export const create = mutation({
  args: {
    token: v.optional(v.string()),
    hotelId: v.optional(v.string()),
    reservationId: v.optional(v.string()),
    guestId: v.optional(v.string()),
    amount: v.number(),
    method: v.optional(v.string()),
    status: v.optional(v.string()),
    type: v.optional(v.string()),
    date: v.optional(v.string()),
    reference: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.token)
    requireAccess(user, 'payments')
    const reservation = args.reservationId
      ? await ctx.db
          .query('reservations')
          .withIndex('by_id_field', (q) => q.eq('id', args.reservationId))
          .unique()
      : null
    if (args.reservationId && !reservation) fail(404, 'Reservation not found.')
    const payment = {
      id: nid('p'),
      hotelId: args.hotelId || reservation?.hotelId,
      reservationId: args.reservationId,
      guestId: args.guestId || reservation?.guestId,
      amount: Number(args.amount),
      method: args.method || 'Card',
      status: args.status || 'paid',
      type: args.type || 'payment',
      date: args.date || todayIso(),
      reference: args.reference || `REF-${Math.floor(10000 + Math.random() * 90000)}`,
    }
    if (!payment.hotelId) fail(400, 'Hotel is required.')
    assertHotelAccess(user, payment.hotelId)
    await ctx.db.insert('payments', payment)
    let updatedReservation = reservation
    if (reservation && payment.status !== 'pending') {
      const paid = reservation.paid + payment.amount
      await ctx.db.patch(reservation._id, { paid })
      updatedReservation = { ...reservation, paid }
    }
    return {
      payment: serializePayment(payment),
      reservation: updatedReservation ? serializeReservation(updatedReservation) : null,
    }
  },
})
