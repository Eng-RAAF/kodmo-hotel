import { PUBLIC_TRAVEL_PATHS, SUPER_ADMIN } from './constants'

export const HOTEL_SEGMENTS = [
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

export function hotelAppPath(hotelId, segment = 'dashboard') {
  const clean = String(segment || 'dashboard').replace(/^\//, '')
  return `/h/${hotelId}/${clean}`
}

export function matchHotelApp(pathname) {
  const match = String(pathname || '').match(/^\/h\/([^/]+)(?:\/(.*))?$/)
  if (!match) return null
  return { hotelId: match[1], segment: match[2] || 'dashboard' }
}

export function navHref(item, hotelId) {
  if (item.orgOnly || !hotelId || !item.segment) return item.to
  return hotelAppPath(hotelId, item.segment)
}

function isReturnablePath(from, user) {
  if (!from || from === '/' || PUBLIC_TRAVEL_PATHS.includes(from)) return false
  const hotel = matchHotelApp(from)
  if (hotel) {
    if (user?.role === SUPER_ADMIN) return true
    return Boolean(user?.hotelId && user.hotelId === hotel.hotelId)
  }
  return true
}

export function postLoginPath(user, from) {
  if (!user) return '/'
  if (from && isReturnablePath(from, user)) return from
  if (user.role === SUPER_ADMIN) return '/hotels'
  if (user.hotelId) return hotelAppPath(user.hotelId, 'dashboard')
  return '/'
}
