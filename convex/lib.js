import { ConvexError } from 'convex/values'

export const SUPER_ADMIN = 'Super Admin'
export const HOTEL_MANAGER_ADMIN = 'Hotel Manager Admin'

const HOTEL_MANAGER_ACCESS = [
  'dashboard',
  'rooms',
  'reservations',
  'guests',
  'front-desk',
  'housekeeping',
  'staff',
  'payments',
  'receivables',
  'reports',
  'settings',
  'profile',
]

export const ROLE_ACCESS = {
  [SUPER_ADMIN]: [
    'dashboard',
    'hotels',
    'rooms',
    'reservations',
    'guests',
    'front-desk',
    'housekeeping',
    'staff',
    'payments',
    'receivables',
    'reports',
    'settings',
    'profile',
  ],
  [HOTEL_MANAGER_ADMIN]: HOTEL_MANAGER_ACCESS,
  'Hotel Manager': HOTEL_MANAGER_ACCESS,
}

export function isSuperAdmin(user) {
  return user?.role === SUPER_ADMIN
}

export function isHotelManagerAdmin(user) {
  return user?.role === HOTEL_MANAGER_ADMIN || user?.role === 'Hotel Manager'
}

export function canAccess(role, key) {
  const resolved = role === 'Hotel Manager' ? HOTEL_MANAGER_ADMIN : role
  return ROLE_ACCESS[resolved]?.includes(key) ?? false
}

export function assertHotelAccess(user, hotelId) {
  if (isSuperAdmin(user)) return
  if (isHotelManagerAdmin(user) && user.hotelId && user.hotelId === hotelId) return
  fail(403, 'You can only manage your hotel.')
}

export function fail(status, message) {
  throw new ConvexError({ status, message })
}

export function nid(prefix) {
  return `${prefix}_${crypto.randomUUID().slice(0, 8)}`
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

export function addDays(iso, days) {
  const date = new Date(`${iso}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() + Number(days || 0))
  return date.toISOString().slice(0, 10)
}

export function nightsBetween(checkIn, checkOut) {
  const start = new Date(`${checkIn}T00:00:00`)
  const end = new Date(`${checkOut}T00:00:00`)
  return Math.max(1, Math.round((end - start) / 86400000))
}

export function invoiceStatus(amount, paid, dueDate, today = todayIso()) {
  const due = Math.max(0, Number(amount || 0) - Number(paid || 0))
  if (due <= 0) return 'paid'
  const overdue = dueDate && dueDate < today
  if (Number(paid || 0) > 0) return overdue ? 'overdue' : 'partial'
  return overdue ? 'overdue' : 'open'
}

export function publicUser(user) {
  if (!user) return null
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    hotelId: user.hotelId ?? null,
    phone: user.phone ?? '',
    title: user.title ?? '',
  }
}

export function serializeHotel(hotel, roomCount = 0) {
  return {
    id: hotel.id,
    name: hotel.name,
    city: hotel.city,
    country: hotel.country,
    address: hotel.address,
    stars: hotel.stars,
    phone: hotel.phone,
    email: hotel.email,
    manager: hotel.manager,
    status: hotel.status,
    accent: hotel.accent,
    rooms: roomCount,
  }
}

export function serializeOrganization(org) {
  return {
    id: org.id,
    name: org.name,
    legalName: org.legalName,
    timezone: org.timezone,
    currency: org.currency,
    supportEmail: org.supportEmail,
  }
}

export function serializeRoom(room) {
  return {
    id: room.id,
    hotelId: room.hotelId,
    number: room.number,
    floor: room.floor,
    type: room.type,
    rate: room.rate,
    capacity: room.capacity,
    amenities: room.amenities,
    status: room.status,
    notes: room.notes,
  }
}

export function serializeGuest(guest) {
  return {
    id: guest.id,
    firstName: guest.firstName,
    lastName: guest.lastName,
    email: guest.email,
    phone: guest.phone,
    nationality: guest.nationality,
    vip: guest.vip,
    idType: guest.idType,
    idNumber: guest.idNumber,
    notes: guest.notes,
  }
}

export function serializeReservation(item) {
  return {
    id: item.id,
    hotelId: item.hotelId,
    guestId: item.guestId,
    roomId: item.roomId,
    checkIn: item.checkIn,
    checkOut: item.checkOut,
    status: item.status,
    source: item.source,
    adults: item.adults,
    children: item.children,
    nights: item.nights,
    rate: item.rate,
    extras: item.extras,
    total: item.total,
    paid: item.paid,
    notes: item.notes,
    createdAt: item.createdAt,
  }
}

export function serializeStaff(member) {
  return {
    id: member.id,
    name: member.name,
    email: member.email,
    role: member.role,
    hotelId: member.hotelId,
    department: member.department,
    shift: member.shift,
    phone: member.phone,
    status: member.status,
  }
}

export function serializeTask(task) {
  return {
    id: task.id,
    hotelId: task.hotelId,
    roomId: task.roomId,
    reservationId: task.reservationId ?? null,
    type: task.type,
    assigneeId: task.assigneeId ?? null,
    status: task.status,
    priority: task.priority,
    notes: task.notes,
    due: task.due,
  }
}

export function serializePayment(payment) {
  return {
    id: payment.id,
    hotelId: payment.hotelId,
    reservationId: payment.reservationId ?? null,
    invoiceId: payment.invoiceId ?? null,
    guestId: payment.guestId ?? null,
    amount: payment.amount,
    method: payment.method,
    status: payment.status,
    type: payment.type,
    date: payment.date,
    reference: payment.reference,
  }
}

export function serializeInvoice(invoice) {
  const amount = Number(invoice.amount || 0)
  const paid = Number(invoice.paid || 0)
  return {
    id: invoice.id,
    hotelId: invoice.hotelId,
    guestId: invoice.guestId ?? null,
    reservationId: invoice.reservationId ?? null,
    number: invoice.number,
    company: invoice.company || '',
    type: invoice.type,
    date: invoice.date,
    dueDate: invoice.dueDate,
    amount,
    paid,
    balance: Math.max(0, amount - paid),
    status: invoice.status,
    notes: invoice.notes || '',
  }
}

export function serializeNotification(item) {
  return {
    id: item.id,
    hotelId: item.hotelId ?? 'all',
    title: item.title,
    body: item.body,
    time: item.time,
    read: item.read,
    type: item.type,
  }
}

export function serializeRoomType(type) {
  return {
    id: type.id,
    hotelId: type.hotelId,
    name: type.name,
    rate: type.rate,
    capacity: type.capacity,
    amenities: type.amenities,
  }
}

export async function byPublicId(ctx, table, id) {
  return await ctx.db
    .query(table)
    .withIndex('by_id_field', (q) => q.eq('id', id))
    .unique()
}

export async function requireUser(ctx, token) {
  if (!token) fail(401, 'Sign in required.')
  const session = await ctx.db
    .query('sessions')
    .withIndex('by_token', (q) => q.eq('token', token))
    .unique()
  if (!session) fail(401, 'Session expired. Please sign in again.')
  const user = await byPublicId(ctx, 'users', session.userId)
  if (!user) fail(401, 'Account not found.')
  return user
}

export function requireAccess(user, key) {
  if (!canAccess(user.role, key)) fail(403, 'You do not have access to this module.')
}

export async function hashPassword(password) {
  const saltBytes = new Uint8Array(16)
  crypto.getRandomValues(saltBytes)
  const salt = bytesToHex(saltBytes)
  const hash = await pbkdf2(password, salt)
  return `${salt}:${hash}`
}

export async function verifyPassword(password, stored) {
  if (!stored || !stored.includes(':')) return false
  const [salt, hash] = stored.split(':')
  const next = await pbkdf2(password, salt)
  return next === hash
}

async function pbkdf2(password, salt) {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: enc.encode(salt), iterations: 100000, hash: 'SHA-256' },
    key,
    256,
  )
  return bytesToHex(new Uint8Array(bits))
}

function bytesToHex(bytes) {
  return [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}
