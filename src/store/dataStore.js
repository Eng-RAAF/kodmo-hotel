import { create } from 'zustand'
import { api, convexMutation, convexQuery } from '../api/client'

const empty = {
  hotels: [],
  rooms: [],
  guests: [],
  reservations: [],
  staff: [],
  housekeepingTasks: [],
  payments: [],
  invoices: [],
  notifications: [],
  roomTypes: [],
  organizations: [],
  organization: {
    name: 'StayHub Hospitality Group',
    legalName: 'StayHub Hospitality Ltd',
    timezone: 'Africa/Mogadishu',
    currency: 'USD',
    supportEmail: 'ops@stayhub.com',
  },
  occupancyTrend: [],
  revenueTrend: [],
  users: [],
  loaded: false,
}

export const useDataStore = create((set, get) => ({
  ...empty,

  hotelById: (hotelId) => get().hotels.find((hotel) => hotel.id === hotelId),
  guestById: (guestId) => get().guests.find((guest) => guest.id === guestId),
  roomById: (roomId) => get().rooms.find((room) => room.id === roomId),
  reservationById: (reservationId) => get().reservations.find((item) => item.id === reservationId),

  loadAll: async () => {
    try {
      await convexMutation(api.invoices.syncFolios)
    } catch {
      // Schema may still be pushing; AR page can retry.
    }
    const data = await convexQuery(api.bootstrap.get)
    set({ invoices: [], ...data, loaded: true })
    return data
  },

  addHotel: async (payload) => {
    const args = {
      name: String(payload.name || '').trim(),
      city: String(payload.city || '').trim(),
      country: payload.country,
      address: payload.address,
      stars: Number(payload.stars || 4),
      phone: payload.phone,
      email: payload.email,
      manager: payload.manager,
    }
    if (payload.managerEmail) {
      args.managerName = payload.managerName || payload.manager
      args.managerEmail = payload.managerEmail
      args.managerPassword = payload.managerPassword
    }
    const result = await convexMutation(api.hotels.create, args)
    const hotel = result.hotel || result
    const manager = result.manager
    set({
      hotels: [...get().hotels, hotel],
      users: manager ? [...get().users, manager].sort((a, b) => a.name.localeCompare(b.name)) : get().users,
    })
    return hotel
  },

  verifyHotel: async (hotelId) => {
    const hotel = await convexMutation(api.hotels.verify, { hotelId })
    set({ hotels: get().hotels.map((item) => (item.id === hotelId ? hotel : item)) })
    return hotel
  },

  setHotelStatus: async (hotelId, status) => {
    const hotel = await convexMutation(api.hotels.setStatus, { hotelId, status })
    set({ hotels: get().hotels.map((item) => (item.id === hotelId ? hotel : item)) })
    return hotel
  },

  updateHotel: async (hotelId, patch) => {
    const hotel = await convexMutation(api.hotels.update, { hotelId, patch })
    set({ hotels: get().hotels.map((item) => (item.id === hotelId ? hotel : item)) })
    return hotel
  },

  setRoomStatus: async (roomId, status, notes) => {
    set({
      rooms: get().rooms.map((room) =>
        room.id === roomId ? { ...room, status, notes: notes ?? room.notes } : room,
      ),
    })
    const room = await convexMutation(api.rooms.setStatus, { roomId, status, notes })
    set({ rooms: get().rooms.map((item) => (item.id === roomId ? room : item)) })
    return room
  },

  addRoom: async (payload) => {
    const args = {
      number: String(payload.number || '').trim(),
      floor: Number(payload.floor || 1),
      type: String(payload.type || 'Standard').trim() || 'Standard',
      rate: Number(payload.rate || 0),
      capacity: Number(payload.capacity || 2),
    }
    if (payload.hotelId) args.hotelId = payload.hotelId
    if (Array.isArray(payload.amenities) && payload.amenities.length) {
      args.amenities = payload.amenities.map(String)
    }
    if (!Number.isFinite(args.floor)) args.floor = 1
    if (!Number.isFinite(args.rate)) args.rate = 0
    if (!Number.isFinite(args.capacity)) args.capacity = 2
    const room = await convexMutation(api.rooms.create, args)
    set({
      rooms: [...get().rooms, room],
      hotels: get().hotels.map((hotel) =>
        hotel.id === room.hotelId ? { ...hotel, rooms: (hotel.rooms || 0) + 1 } : hotel,
      ),
    })
    return room
  },

  updateRoom: async (roomId, patch) => {
    const room = await convexMutation(api.rooms.update, { roomId, patch })
    set({ rooms: get().rooms.map((item) => (item.id === roomId ? room : item)) })
    return room
  },

  addRoomType: async (payload) => {
    const type = await convexMutation(api.roomTypes.create, payload)
    set({ roomTypes: [...get().roomTypes, type] })
    return type
  },

  removeRoomType: async (typeId) => {
    await convexMutation(api.roomTypes.remove, { typeId })
    set({ roomTypes: get().roomTypes.filter((item) => item.id !== typeId) })
  },

  addGuest: async (payload) => {
    const guest = await convexMutation(api.guests.create, payload)
    set({ guests: [...get().guests, guest] })
    return guest
  },

  updateGuest: async (guestId, patch) => {
    const guest = await convexMutation(api.guests.update, { guestId, patch })
    set({ guests: get().guests.map((item) => (item.id === guestId ? guest : item)) })
    return guest
  },

  addReservation: async (payload) => {
    const reservation = await convexMutation(api.reservations.create, payload)
    set({ reservations: [reservation, ...get().reservations] })
    return reservation
  },

  walkInStay: async (payload) => {
    const args = {
      firstName: String(payload.firstName || '').trim(),
      lastName: String(payload.lastName || '').trim(),
      roomId: payload.roomId,
      nights: Math.max(1, Number(payload.nights) || 1),
    }
    if (payload.hotelId) args.hotelId = payload.hotelId
    if (payload.idType) args.idType = String(payload.idType).trim()
    if (payload.idNumber) args.idNumber = String(payload.idNumber).trim()
    if (payload.phone) args.phone = String(payload.phone).trim()
    const { guest, reservation } = await convexMutation(api.reservations.walkIn, args)
    set({
      guests: [...get().guests, guest],
      reservations: [reservation, ...get().reservations],
      rooms: get().rooms.map((room) =>
        room.id === reservation.roomId ? { ...room, status: 'occupied' } : room,
      ),
    })
    return { guest, reservation }
  },

  updateReservation: async (reservationId, patch) => {
    set({
      reservations: get().reservations.map((item) =>
        item.id === reservationId ? { ...item, ...patch } : item,
      ),
    })
  },

  cancelReservation: async (reservationId) => {
    const reservation = await convexMutation(api.reservations.cancel, { reservationId })
    set({
      reservations: get().reservations.map((item) => (item.id === reservationId ? reservation : item)),
    })
    return reservation
  },

  checkIn: async (reservationId) => {
    const reservation = await convexMutation(api.reservations.checkIn, { reservationId })
    set({
      reservations: get().reservations.map((item) => (item.id === reservationId ? reservation : item)),
      rooms: get().rooms.map((room) =>
        room.id === reservation.roomId ? { ...room, status: 'occupied' } : room,
      ),
    })
    return reservation
  },

  checkOut: async (reservationId, extras = {}) => {
    const args = { reservationId }
    if (extras.collectBalance) args.collectBalance = true
    if (extras.method) args.method = extras.method
    const { reservation, task, payment } = await convexMutation(api.reservations.checkOut, args)
    set({
      reservations: get().reservations.map((item) => (item.id === reservationId ? reservation : item)),
      rooms: get().rooms.map((room) =>
        room.id === reservation.roomId ? { ...room, status: 'dirty' } : room,
      ),
      housekeepingTasks: task ? [task, ...get().housekeepingTasks] : get().housekeepingTasks,
      payments: payment ? [payment, ...get().payments] : get().payments,
    })
    return reservation
  },

  addStaff: async (payload) => {
    const member = await convexMutation(api.staff.create, payload)
    set({ staff: [...get().staff, member] })
    return member
  },

  addUser: async (payload) => {
    const account = await convexMutation(api.users.create, payload)
    set({ users: [...get().users, account].sort((a, b) => a.name.localeCompare(b.name)) })
    return account
  },

  updateUser: async (userId, patch) => {
    const account = await convexMutation(api.users.update, { userId, patch })
    set({ users: get().users.map((item) => (item.id === userId ? account : item)).sort((a, b) => a.name.localeCompare(b.name)) })
    return account
  },

  removeUser: async (userId) => {
    await convexMutation(api.users.remove, { userId })
    set({ users: get().users.filter((item) => item.id !== userId) })
  },

  updateStaff: async (staffId, patch) => {
    const member = await convexMutation(api.staff.update, { staffId, patch })
    set({ staff: get().staff.map((item) => (item.id === staffId ? member : item)) })
    return member
  },

  addPayment: async (payload) => {
    const { payment, reservation, invoice } = await convexMutation(api.payments.create, payload)
    set({
      payments: [payment, ...get().payments],
      reservations: reservation
        ? get().reservations.map((item) => (item.id === reservation.id ? reservation : item))
        : get().reservations,
      invoices: invoice
        ? get().invoices.map((item) => (item.id === invoice.id ? invoice : item))
        : get().invoices,
    })
    return payment
  },

  addInvoice: async (payload) => {
    const invoice = await convexMutation(api.invoices.create, payload)
    set({ invoices: [invoice, ...get().invoices] })
    return invoice
  },

  collectInvoice: async (payload) => {
    const { invoice, payment, reservation } = await convexMutation(api.invoices.collect, payload)
    set({
      invoices: get().invoices.map((item) => (item.id === invoice.id ? invoice : item)),
      payments: payment ? [payment, ...get().payments] : get().payments,
      reservations: reservation
        ? get().reservations.map((item) => (item.id === reservation.id ? reservation : item))
        : get().reservations,
    })
    return invoice
  },

  voidInvoice: async (invoiceId) => {
    const invoice = await convexMutation(api.invoices.voidInvoice, { invoiceId })
    set({ invoices: get().invoices.map((item) => (item.id === invoiceId ? invoice : item)) })
    return invoice
  },

  updateTask: async (taskId, patch) => {
    const { task, room } = await convexMutation(api.housekeeping.updateTask, { taskId, patch })
    set({
      housekeepingTasks: get().housekeepingTasks.map((item) => (item.id === taskId ? task : item)),
      rooms: room ? get().rooms.map((item) => (item.id === room.id ? room : item)) : get().rooms,
    })
    return task
  },

  addTask: async (payload) => {
    const task = await convexMutation(api.housekeeping.createTask, payload)
    set({ housekeepingTasks: [task, ...get().housekeepingTasks] })
    return task
  },

  markNotificationRead: async (notificationId) => {
    const item = await convexMutation(api.notifications.markRead, { notificationId })
    set({
      notifications: get().notifications.map((row) => (row.id === notificationId ? item : row)),
    })
  },

  markAllNotificationsRead: async () => {
    const notifications = await convexMutation(api.notifications.markAllRead)
    set({ notifications })
  },

  addOrganization: async (payload) => {
    const organization = await convexMutation(api.organization.create, payload)
    const organizations = [...get().organizations, organization]
    set({
      organizations,
      organization: get().organization?.id ? get().organization : organization,
    })
    return organization
  },

  updateOrganization: async (organizationId, patch) => {
    const nextPatch = typeof organizationId === 'string' ? patch : organizationId
    const id = typeof organizationId === 'string' ? organizationId : organizationId?.id
    const organization = await convexMutation(api.organization.update, { organizationId: id, patch: nextPatch })
    const organizations = get().organizations.length
      ? get().organizations.map((item) => (item.id === organization.id ? organization : item))
      : [organization]
    set({
      organizations,
      organization: !get().organization?.id || get().organization.id === organization.id ? organization : get().organization,
    })
    return organization
  },

  removeOrganization: async (organizationId) => {
    await convexMutation(api.organization.remove, { organizationId })
    const organizations = get().organizations.filter((item) => item.id !== organizationId)
    set({
      organizations,
      organization:
        get().organization?.id === organizationId
          ? organizations[0] || empty.organization
          : get().organization,
    })
  },
}))
