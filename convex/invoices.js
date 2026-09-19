import { mutation } from './_generated/server'
import { v } from 'convex/values'
import {
  addDays,
  assertHotelAccess,
  fail,
  invoiceStatus,
  nid,
  requireAccess,
  requireUser,
  serializeInvoice,
  serializePayment,
  serializeReservation,
  todayIso,
} from './lib'

const tokenArg = { token: v.optional(v.string()) }

async function loadById(ctx, table, id) {
  const row = await ctx.db
    .query(table)
    .withIndex('by_id_field', (q) => q.eq('id', id))
    .unique()
  if (!row) fail(404, `${table === 'invoices' ? 'Invoice' : 'Record'} not found.`)
  return row
}

async function nextInvoiceNumber(ctx) {
  const rows = await ctx.db.query('invoices').collect()
  return `INV-${String(rows.length + 1).padStart(4, '0')}`
}

export const create = mutation({
  args: {
    ...tokenArg,
    hotelId: v.optional(v.string()),
    guestId: v.optional(v.string()),
    reservationId: v.optional(v.string()),
    company: v.optional(v.string()),
    type: v.optional(v.string()),
    date: v.optional(v.string()),
    dueDate: v.optional(v.string()),
    amount: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.token)
    requireAccess(user, 'receivables')
    const amount = Number(args.amount)
    if (!Number.isFinite(amount) || amount <= 0) fail(400, 'Invoice amount must be greater than zero.')
    const hotelId = args.hotelId || user.hotelId
    if (!hotelId) fail(400, 'Hotel is required.')
    assertHotelAccess(user, hotelId)
    const type = (args.type || 'city_ledger').trim()
    if (!['folio', 'city_ledger', 'manual'].includes(type)) fail(400, 'Invoice type is invalid.')
    const date = args.date || todayIso()
    const dueDate = args.dueDate || addDays(date, 30)
    const invoice = {
      id: nid('inv'),
      hotelId,
      number: await nextInvoiceNumber(ctx),
      company: (args.company || '').trim(),
      type,
      date,
      dueDate,
      amount,
      paid: 0,
      status: invoiceStatus(amount, 0, dueDate),
      notes: (args.notes || '').trim(),
    }
    if (args.guestId) invoice.guestId = args.guestId
    if (args.reservationId) invoice.reservationId = args.reservationId
    await ctx.db.insert('invoices', invoice)
    return serializeInvoice(invoice)
  },
})

export const collect = mutation({
  args: {
    ...tokenArg,
    invoiceId: v.string(),
    amount: v.number(),
    method: v.optional(v.string()),
    reference: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.token)
    requireAccess(user, 'receivables')
    const invoice = await loadById(ctx, 'invoices', args.invoiceId)
    assertHotelAccess(user, invoice.hotelId)
    if (invoice.status === 'void') fail(400, 'This invoice is void.')
    const amount = Number(args.amount)
    const balance = Math.max(0, Number(invoice.amount || 0) - Number(invoice.paid || 0))
    if (!Number.isFinite(amount) || amount <= 0) fail(400, 'Collection amount must be greater than zero.')
    if (amount > balance) fail(400, 'Collection cannot exceed the open balance.')
    const paid = Number(invoice.paid || 0) + amount
    const status = invoiceStatus(invoice.amount, paid, invoice.dueDate)
    await ctx.db.patch(invoice._id, { paid, status })
    const payment = {
      id: nid('p'),
      hotelId: invoice.hotelId,
      amount,
      method: args.method || 'Bank transfer',
      status: 'paid',
      type: 'collection',
      date: todayIso(),
      reference: args.reference || invoice.number,
    }
    if (invoice.reservationId) payment.reservationId = invoice.reservationId
    payment.invoiceId = invoice.id
    if (invoice.guestId) payment.guestId = invoice.guestId
    await ctx.db.insert('payments', payment)
    let reservation = null
    if (invoice.reservationId) {
      const stay = await ctx.db
        .query('reservations')
        .withIndex('by_id_field', (q) => q.eq('id', invoice.reservationId))
        .unique()
      if (stay) {
        const stayPaid = Number(stay.paid || 0) + amount
        await ctx.db.patch(stay._id, { paid: stayPaid })
        reservation = serializeReservation({ ...stay, paid: stayPaid })
      }
    }
    return {
      invoice: serializeInvoice({ ...invoice, paid, status }),
      payment: serializePayment(payment),
      reservation,
    }
  },
})

export const voidInvoice = mutation({
  args: {
    ...tokenArg,
    invoiceId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.token)
    requireAccess(user, 'receivables')
    const invoice = await loadById(ctx, 'invoices', args.invoiceId)
    assertHotelAccess(user, invoice.hotelId)
    if (invoice.status === 'paid') fail(400, 'Paid invoices cannot be voided.')
    await ctx.db.patch(invoice._id, { status: 'void' })
    return serializeInvoice({ ...invoice, status: 'void' })
  },
})

export const syncFolios = mutation({
  args: tokenArg,
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.token)
    requireAccess(user, 'receivables')
    const scopeHotelId = user.role === 'Super Admin' ? null : user.hotelId
    const reservations = await ctx.db.query('reservations').collect()
    const invoices = await ctx.db.query('invoices').collect()
    const byReservation = new Map(
      invoices.filter((item) => item.reservationId).map((item) => [item.reservationId, item]),
    )
    let created = 0
    let updated = 0
    const hotelsWithCityLedger = new Set(
      invoices.filter((item) => item.type === 'city_ledger').map((item) => item.hotelId),
    )
    const TODAY = todayIso()
    const demos = [
      { hotelId: 'h1', guestId: 'g3', company: 'Atlas Logistics', amount: 2400, paid: 800, date: addDays(TODAY, -25), dueDate: addDays(TODAY, -10), notes: 'Corporate group rooms — August' },
      { hotelId: 'h1', company: 'Hormuud Telecom', amount: 3600, paid: 0, date: addDays(TODAY, -50), dueDate: addDays(TODAY, -20), notes: 'Staff lodging contract' },
      { hotelId: 'h2', guestId: 'g16', company: 'Somali Airlines', amount: 1800, paid: 0, date: addDays(TODAY, -8), dueDate: addDays(TODAY, 12), notes: 'Crew layover account' },
      { hotelId: 'h2', company: 'Kismayo Port Authority', amount: 950, paid: 200, date: addDays(TODAY, -70), dueDate: addDays(TODAY, -40), notes: 'Official visit balance' },
      { hotelId: 'h3', guestId: 'g13', company: 'Dahabshiil', amount: 450, paid: 0, date: addDays(TODAY, -5), dueDate: addDays(TODAY, 25), notes: 'City desk rooms' },
    ]
    let n = invoices.length
    for (const row of demos) {
      if (scopeHotelId && row.hotelId !== scopeHotelId) continue
      if (hotelsWithCityLedger.has(row.hotelId)) continue
      n += 1
      const ledger = {
        id: nid('inv'),
        hotelId: row.hotelId,
        number: `INV-${String(n).padStart(4, '0')}`,
        company: row.company,
        type: 'city_ledger',
        date: row.date,
        dueDate: row.dueDate,
        amount: row.amount,
        paid: row.paid,
        status: invoiceStatus(row.amount, row.paid, row.dueDate),
        notes: row.notes,
      }
      if (row.guestId) ledger.guestId = row.guestId
      await ctx.db.insert('invoices', ledger)
      created += 1
    }
    for (const stay of reservations) {
      if (scopeHotelId && stay.hotelId !== scopeHotelId) continue
      if (stay.status === 'cancelled') continue
      const existing = byReservation.get(stay.id)
      const amount = Number(stay.total || 0)
      const paid = Number(stay.paid || 0)
      const dueDate = stay.checkOut || todayIso()
      const date = stay.createdAt || stay.checkIn || todayIso()
      const status = invoiceStatus(amount, paid, dueDate)
      if (existing) {
        if (existing.status === 'void') continue
        await ctx.db.patch(existing._id, { amount, paid, status, dueDate, date })
        updated += 1
        continue
      }
      if (amount - paid <= 0) continue
      await ctx.db.insert('invoices', {
        id: nid('inv'),
        hotelId: stay.hotelId,
        guestId: stay.guestId,
        reservationId: stay.id,
        number: `INV-${stay.id.replace('rs', '').toUpperCase()}`,
        company: stay.source === 'Corporate' ? 'Corporate account' : '',
        type: 'folio',
        date,
        dueDate,
        amount,
        paid,
        status,
        notes: `Folio for stay ${stay.id.toUpperCase()}`,
      })
      created += 1
    }
    const openLedgers = invoices.filter((item) => item.type !== 'folio' && item.status !== 'void')
    for (const invoice of openLedgers) {
      if (scopeHotelId && invoice.hotelId !== scopeHotelId) continue
      const next = invoiceStatus(invoice.amount, invoice.paid, invoice.dueDate)
      if (next !== invoice.status) {
        await ctx.db.patch(invoice._id, { status: next })
        updated += 1
      }
    }
    return { ok: true, created, updated }
  },
})
