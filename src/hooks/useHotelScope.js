import { useMemo } from 'react'
import { useHotelStore } from '../store/hotelStore'
import { useDataStore } from '../store/dataStore'
import { useAuthStore } from '../store/authStore'

export function useHotelScope() {
  const user = useAuthStore((state) => state.user)
  const currentHotelId = useHotelStore((state) => state.currentHotelId)
  const hotels = useDataStore((state) => state.hotels)

  const availableHotels = useMemo(() => {
    if (!user) return []
    if (user.role === 'Super Admin') return hotels
    return hotels.filter((hotel) => hotel.id === user.hotelId)
  }, [user, hotels])

  const canViewAll = user?.role === 'Super Admin'
  const activeHotelId = canViewAll ? currentHotelId : user?.hotelId || currentHotelId
  const currentHotel = hotels.find((hotel) => hotel.id === activeHotelId) || null
  const isAllHotels = activeHotelId === 'all'

  return { availableHotels, currentHotelId: activeHotelId, currentHotel, isAllHotels, canViewAll }
}

export function useScopedList(collection) {
  const { currentHotelId, isAllHotels } = useHotelScope()
  return useMemo(() => {
    if (isAllHotels) return collection
    return collection.filter((item) => item.hotelId === currentHotelId)
  }, [collection, currentHotelId, isAllHotels])
}
