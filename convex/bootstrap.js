import { query } from './_generated/server'
import { v } from 'convex/values'
import {
  isHotelManagerAdmin,
  isSuperAdmin,
  publicUser,
  requireUser,
  serializeGuest,
  serializeHotel,
  serializeNotification,
  serializeOrganization,
  serializePayment,
  serializeReservation,
  serializeRoom,
  serializeRoomType,
  serializeStaff,
  serializeTask,
} from './lib'

function shortName(name) {
  if (name.includes('Grand Palace')) return 'Grand Palace'
  if (name.includes('Ocean View')) return 'Ocean View'
  if (name.includes('City Heights')) return 'City Heights'
  return name
}

export const get = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.token)
    const scopeHotelId = isSuperAdmin(user) ? null : user.hotelId || '__none__'

    let [
      organizations,
      hotels,
      rooms,
      guests,
      reservations,
      staff,
      housekeepingTasks,
      payments,
      notifications,
      roomTypes,
      metrics,
      users,
    ] = await Promise.all([
      ctx.db.query('organizations').collect(),
      ctx.db.query('hotels').collect(),
      ctx.db.query('rooms').collect(),
      ctx.db.query('guests').collect(),
      ctx.db.query('reservations').collect(),
      ctx.db.query('staff').collect(),
      ctx.db.query('housekeepingTasks').collect(),
      ctx.db.query('payments').collect(),
      ctx.db.query('notifications').collect(),
      ctx.db.query('roomTypes').collect(),
      ctx.db.query('dailyMetrics').collect(),
      ctx.db.query('users').collect(),
    ])

    hotels.sort((a, b) => a.name.localeCompare(b.name))
    rooms.sort((a, b) => a.hotelId.localeCompare(b.hotelId) || a.number.localeCompare(b.number))
    guests.sort((a, b) => a.lastName.localeCompare(b.lastName))
    reservations.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    staff.sort((a, b) => a.name.localeCompare(b.name))
    housekeepingTasks.sort((a, b) => a.due.localeCompare(b.due))
    payments.sort((a, b) => b.date.localeCompare(a.date))
    notifications.sort((a, b) => a.id.localeCompare(b.id))
    roomTypes.sort((a, b) => a.name.localeCompare(b.name))
    metrics.sort((a, b) => a.date.localeCompare(b.date))
    users.sort((a, b) => a.name.localeCompare(b.name))

    if (scopeHotelId) {
      hotels = hotels.filter((hotel) => hotel.id === scopeHotelId)
      rooms = rooms.filter((room) => room.hotelId === scopeHotelId)
      reservations = reservations.filter((item) => item.hotelId === scopeHotelId)
      staff = staff.filter((member) => member.hotelId === scopeHotelId)
      housekeepingTasks = housekeepingTasks.filter((task) => task.hotelId === scopeHotelId)
      payments = payments.filter((payment) => payment.hotelId === scopeHotelId)
      notifications = notifications.filter((item) => item.hotelId === scopeHotelId || item.hotelId === 'all')
      roomTypes = roomTypes.filter((type) => type.hotelId === scopeHotelId)
      metrics = metrics.filter((row) => row.hotelId === scopeHotelId)
      const guestIds = new Set(reservations.map((item) => item.guestId))
      guests = guests.filter((guest) => guestIds.has(guest.id))
      users = users.filter((account) => isHotelManagerAdmin(account) && account.hotelId === scopeHotelId)
    }

    const occupancyTrend = []
    const revenueTrend = []
    const dates = [...new Set(metrics.map((row) => row.date))]
    const hotelName = Object.fromEntries(hotels.map((hotel) => [hotel.id, shortName(hotel.name)]))
    const roomCounts = rooms.reduce((acc, room) => {
      acc[room.hotelId] = (acc[room.hotelId] || 0) + 1
      return acc
    }, {})

    for (const date of dates) {
      const occ = { date: date.slice(5), iso: date }
      const rev = { date: date.slice(5) }
      for (const row of metrics.filter((item) => item.date === date)) {
        const key = hotelName[row.hotelId]
        occ[key] = row.occupancy
        rev[key] = row.revenue
        if (scopeHotelId) {
          occ.occupancy = row.occupancy
          rev.revenue = row.revenue
        }
      }
      occupancyTrend.push(occ)
      revenueTrend.push(rev)
    }

    const organizationRows = organizations.map(serializeOrganization)
    const organization = organizationRows[0] || {
      name: 'StayHub Hospitality Group',
      legalName: 'StayHub Hospitality Ltd',
      timezone: 'Africa/Mogadishu',
      currency: 'USD',
      supportEmail: 'ops@stayhub.com',
    }
    return {
      organization,
      organizations: organizationRows,
      hotels: hotels.map((hotel) => serializeHotel(hotel, roomCounts[hotel.id] || 0)),
      rooms: rooms.map(serializeRoom),
      guests: guests.map(serializeGuest),
      reservations: reservations.map(serializeReservation),
      staff: staff.map(serializeStaff),
      housekeepingTasks: housekeepingTasks.map(serializeTask),
      payments: payments.map(serializePayment),
      notifications: notifications.map(serializeNotification),
      roomTypes: roomTypes.map(serializeRoomType),
      occupancyTrend,
      revenueTrend,
      users: users.map(publicUser),
    }
  },
})
