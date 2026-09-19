import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useHotelStore } from '../store/hotelStore'
import { useDataStore } from '../store/dataStore'
import { useAuthStore } from '../store/authStore'
import { hotelAppPath, matchHotelApp } from '../lib/paths'

export function useHotelScope() {
  const user = useAuthStore((state) => state.user)
  const currentHotelId = useHotelStore((state) => state.currentHotelId)
  const hotels = useDataStore((state) => state.hotels)
  const location = useLocation()
  const routeHotelId = matchHotelApp(location.pathname)?.hotelId

  const availableHotels = useMemo(() => {
    if (!user) return []
    if (user.role === 'Super Admin') return hotels
    return hotels.filter((hotel) => hotel.id === user.hotelId)
  }, [user, hotels])

  const canViewAll = user?.role === 'Super Admin'
  const activeHotelId = routeHotelId || (canViewAll ? currentHotelId : user?.hotelId || currentHotelId)
  const currentHotel = hotels.find((hotel) => hotel.id === activeHotelId) || null
  const isAllHotels = !routeHotelId && activeHotelId === 'all'

  return { availableHotels, currentHotelId: activeHotelId, currentHotel, isAllHotels, canViewAll }
}

export function useHotelPath() {
  const location = useLocation()
  const route = matchHotelApp(location.pathname)
  const { currentHotelId } = useHotelScope()
  const hotelId = route?.hotelId || (currentHotelId && currentHotelId !== 'all' ? currentHotelId : null)
  const path = (segment) => (hotelId ? hotelAppPath(hotelId, segment) : `/${String(segment || '').replace(/^\//, '')}`)
  return { hotelId, segment: route?.segment, path, inHotelApp: Boolean(route) }
}

export function useScopedList(collection) {
  const { currentHotelId, isAllHotels } = useHotelScope()
  return useMemo(() => {
    if (isAllHotels) return collection
    return collection.filter((item) => item.hotelId === currentHotelId)
  }, [collection, currentHotelId, isAllHotels])
}
