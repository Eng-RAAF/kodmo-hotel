import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useHotelStore = create(
  persist(
    (set) => ({
      currentHotelId: 'all',
      setHotel: (currentHotelId) => set({ currentHotelId }),
    }),
    { name: 'stayhub-hotel' },
  ),
)
