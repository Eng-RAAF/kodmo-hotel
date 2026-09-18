import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useTravelStore = create(
  persist(
    (set, get) => ({
      bookings: [],
      book: (booking) => {
        const id = `SH-${booking.kind.slice(0, 2).toUpperCase()}-${Date.now().toString().slice(-6)}`
        const next = { id, bookedAt: new Date().toISOString(), ...booking }
        set({ bookings: [next, ...get().bookings] })
        return next
      },
      isBooked: (itemId) => get().bookings.some((item) => item.itemId === itemId),
    }),
    { name: 'stayhub-travel' },
  ),
)
