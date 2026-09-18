import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { canAccess } from '../lib/constants'

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
  '/reports': 'reports',
  '/settings': 'settings',
  '/profile': 'profile',
}

export function ProtectedRoute() {
  const user = useAuthStore((state) => state.user)
  const location = useLocation()

  if (!user) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />
  }

  const key = PATH_KEYS[location.pathname]
  if (key && !canAccess(user.role, key)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
