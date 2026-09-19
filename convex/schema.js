import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  organizations: defineTable({
    id: v.string(),
    name: v.string(),
    legalName: v.string(),
    timezone: v.string(),
    currency: v.string(),
    supportEmail: v.string(),
  }).index('by_id_field', ['id']),

  users: defineTable({
    id: v.string(),
    name: v.string(),
    email: v.string(),
    passwordHash: v.string(),
    role: v.string(),
    hotelId: v.optional(v.string()),
    phone: v.optional(v.string()),
    title: v.optional(v.string()),
  })
    .index('by_id_field', ['id'])
    .index('by_email', ['email']),

  sessions: defineTable({
    token: v.string(),
    userId: v.string(),
    createdAt: v.number(),
  }).index('by_token', ['token']),

  hotels: defineTable({
    id: v.string(),
    name: v.string(),
    city: v.string(),
    country: v.string(),
    address: v.string(),
    stars: v.number(),
    phone: v.string(),
    email: v.string(),
    manager: v.string(),
    status: v.string(),
    accent: v.string(),
  }).index('by_id_field', ['id']),

  roomTypes: defineTable({
    id: v.string(),
    hotelId: v.string(),
    name: v.string(),
    rate: v.number(),
    capacity: v.number(),
    amenities: v.array(v.string()),
  })
    .index('by_id_field', ['id'])
    .index('by_hotel', ['hotelId']),

  rooms: defineTable({
    id: v.string(),
    hotelId: v.string(),
    number: v.string(),
    floor: v.number(),
    type: v.string(),
    rate: v.number(),
    capacity: v.number(),
    amenities: v.array(v.string()),
    status: v.string(),
    notes: v.string(),
  })
    .index('by_id_field', ['id'])
    .index('by_hotel', ['hotelId']),

  guests: defineTable({
    id: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    phone: v.string(),
    nationality: v.string(),
    vip: v.boolean(),
    idType: v.string(),
    idNumber: v.string(),
    notes: v.string(),
  }).index('by_id_field', ['id']),

  reservations: defineTable({
    id: v.string(),
    hotelId: v.string(),
    guestId: v.string(),
    roomId: v.string(),
    checkIn: v.string(),
    checkOut: v.string(),
    status: v.string(),
    source: v.string(),
    adults: v.number(),
    children: v.number(),
    nights: v.number(),
    rate: v.number(),
    extras: v.number(),
    total: v.number(),
    paid: v.number(),
    notes: v.string(),
    createdAt: v.string(),
  })
    .index('by_id_field', ['id'])
    .index('by_hotel', ['hotelId']),

  staff: defineTable({
    id: v.string(),
    name: v.string(),
    email: v.string(),
    role: v.string(),
    hotelId: v.string(),
    department: v.string(),
    shift: v.string(),
    phone: v.string(),
    status: v.string(),
  })
    .index('by_id_field', ['id'])
    .index('by_hotel', ['hotelId']),

  housekeepingTasks: defineTable({
    id: v.string(),
    hotelId: v.string(),
    roomId: v.string(),
    reservationId: v.optional(v.string()),
    type: v.string(),
    assigneeId: v.optional(v.string()),
    status: v.string(),
    priority: v.string(),
    notes: v.string(),
    due: v.string(),
  })
    .index('by_id_field', ['id'])
    .index('by_hotel', ['hotelId']),

  payments: defineTable({
    id: v.string(),
    hotelId: v.string(),
    reservationId: v.optional(v.string()),
    invoiceId: v.optional(v.string()),
    guestId: v.optional(v.string()),
    amount: v.number(),
    method: v.string(),
    status: v.string(),
    type: v.string(),
    date: v.string(),
    reference: v.string(),
  })
    .index('by_id_field', ['id'])
    .index('by_hotel', ['hotelId']),

  invoices: defineTable({
    id: v.string(),
    hotelId: v.string(),
    guestId: v.optional(v.string()),
    reservationId: v.optional(v.string()),
    number: v.string(),
    company: v.string(),
    type: v.string(),
    date: v.string(),
    dueDate: v.string(),
    amount: v.number(),
    paid: v.number(),
    status: v.string(),
    notes: v.string(),
  })
    .index('by_id_field', ['id'])
    .index('by_hotel', ['hotelId'])
    .index('by_reservation', ['reservationId']),

  notifications: defineTable({
    id: v.string(),
    hotelId: v.optional(v.string()),
    title: v.string(),
    body: v.string(),
    time: v.string(),
    read: v.boolean(),
    type: v.string(),
  }).index('by_id_field', ['id']),

  dailyMetrics: defineTable({
    hotelId: v.string(),
    date: v.string(),
    occupancy: v.number(),
    revenue: v.number(),
  }).index('by_hotel_date', ['hotelId', 'date']),
})
