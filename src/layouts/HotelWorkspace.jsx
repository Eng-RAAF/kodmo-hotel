import { Navigate, Outlet, useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { useHotelStore } from '../store/hotelStore'
import { useDataStore } from '../store/dataStore'
import { isSuperAdmin } from '../lib/constants'
import { hotelAppPath, postLoginPath } from '../lib/paths'

export function HotelWorkspace() {
  const { hotelId } = useParams()
  const user = useAuthStore((state) => state.user)
  const setHotel = useHotelStore((state) => state.setHotel)
  const hotels = useDataStore((state) => state.hotels)
  const loaded = useDataStore((state) => state.loaded)

  useEffect(() => {
    if (hotelId) setHotel(hotelId)
  }, [hotelId, setHotel])

  if (!user) return <Navigate to="/" replace />

  if (!isSuperAdmin(user)) {
    if (!user.hotelId) return <Navigate to="/" replace />
    if (user.hotelId !== hotelId) {
      return <Navigate to={hotelAppPath(user.hotelId, 'dashboard')} replace />
    }
  }

  if (loaded && !hotels.some((hotel) => hotel.id === hotelId)) {
    return <Navigate to={postLoginPath(user)} replace />
  }

  return <Outlet />
}

export function LegacyHotelRedirect({ segment }) {
  const user = useAuthStore((state) => state.user)
  const currentHotelId = useHotelStore((state) => state.currentHotelId)

  if (!user) return <Navigate to="/" replace />
  if (user.hotelId) return <Navigate to={hotelAppPath(user.hotelId, segment)} replace />
  if (isSuperAdmin(user) && currentHotelId && currentHotelId !== 'all') {
    return <Navigate to={hotelAppPath(currentHotelId, segment)} replace />
  }
  if (isSuperAdmin(user)) return <Navigate to="/hotels" replace />
  return <Navigate to="/" replace />
}

export function GroupDashboardPage({ children }) {
  const user = useAuthStore((state) => state.user)
  if (!user) return <Navigate to="/" replace />
  if (!isSuperAdmin(user) && user.hotelId) {
    return <Navigate to={hotelAppPath(user.hotelId, 'dashboard')} replace />
  }
  return children
}

export function OrgConsoleGate({ children, hotelSegment }) {
  const user = useAuthStore((state) => state.user)
  if (!user) return <Navigate to="/" replace />
  if (!isSuperAdmin(user) && user.hotelId && hotelSegment) {
    return <Navigate to={hotelAppPath(user.hotelId, hotelSegment)} replace />
  }
  return children
}
