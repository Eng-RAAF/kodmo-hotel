import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { canAccess } from '../lib/constants'
import { matchHotelApp } from '../lib/paths'

const PATH_KEYS = {
  '/dashboard': 'dashboard',
  '/hotels': 'hotels',
  '/rooms': 'rooms',
  '/reservations': 'reservations',
  '/guests': 'guests',
  '/front-desk': 'front-desk',
  '/housekeeping': 'housekeeping',
  '/staff': 'staff',
  '/payments': 'payments',
  '/receivables': 'receivables',
  '/reports': 'reports',
  '/settings': 'settings',
  '/profile': 'profile',
}

function accessKey(pathname) {
  const hotel = matchHotelApp(pathname)
  const path = hotel ? `/${hotel.segment}` : pathname
  return PATH_KEYS[path]
}

export function ProtectedRoute() {
  const user = useAuthStore((state) => state.user)
  const location = useLocation()

  if (!user) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />
  }

  const key = accessKey(location.pathname)
  if (key && !canAccess(user.role, key)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
