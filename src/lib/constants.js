export const TODAY = new Date().toISOString().slice(0, 10)

export const SUPER_ADMIN = 'Super Admin'
export const HOTEL_MANAGER_ADMIN = 'Hotel Manager Admin'

export const DEMO_ACCOUNTS = [
  { role: 'Super Admin', email: 'super@stayhub.com', password: 'admin123', scope: 'All hotels' },
  { role: 'Hotel Manager Admin', email: 'manager@stayhub.com', password: 'manager123', scope: 'Grand Palace Hotel' },
  { role: 'Hotel Manager Admin', email: 'ocean@stayhub.com', password: 'manager123', scope: 'Ocean View Resort' },
  { role: 'Hotel Manager Admin', email: 'city@stayhub.com', password: 'manager123', scope: 'City Heights Inn' },
]

export const LOGIN_ROLES = [SUPER_ADMIN, HOTEL_MANAGER_ADMIN]

export const STAFF_ROLES = ['Hotel Manager', 'Receptionist', 'Accountant', 'Housekeeping', 'Maintenance']

export const ROLES = [...LOGIN_ROLES, ...STAFF_ROLES]

const HOTEL_MANAGER_ACCESS = [
  'dashboard',
  'rooms',
  'reservations',
  'guests',
  'front-desk',
  'housekeeping',
  'staff',
  'payments',
  'reports',
  'settings',
  'profile',
]

export const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard', key: 'dashboard' },
  { to: '/hotels', label: 'Hotels', icon: 'Building2', key: 'hotels' },
  { to: '/rooms', label: 'Rooms', icon: 'BedDouble', key: 'rooms' },
  { to: '/reservations', label: 'Reservations', icon: 'CalendarCheck', key: 'reservations' },
  { to: '/guests', label: 'Guests', icon: 'Users', key: 'guests' },
  { to: '/front-desk', label: 'Front Desk', icon: 'ConciergeBell', key: 'front-desk' },
  { to: '/housekeeping', label: 'Housekeeping', icon: 'Sparkles', key: 'housekeeping' },
  { to: '/staff', label: 'Staff', icon: 'IdCard', key: 'staff' },
  { to: '/payments', label: 'Payments', icon: 'CreditCard', key: 'payments' },
  { to: '/reports', label: 'Reports', icon: 'BarChart3', key: 'reports' },
]

export const ROLE_ACCESS = {
  [SUPER_ADMIN]: NAV_ITEMS.map((item) => item.key).concat(['settings', 'profile']),
  [HOTEL_MANAGER_ADMIN]: HOTEL_MANAGER_ACCESS,
  'Hotel Manager': HOTEL_MANAGER_ACCESS,
}

export const ROOM_STATUSES = [
  { id: 'available', label: 'Available', color: 'emerald' },
  { id: 'occupied', label: 'Occupied', color: 'sky' },
  { id: 'reserved', label: 'Reserved', color: 'indigo' },
  { id: 'dirty', label: 'Dirty', color: 'amber' },
  { id: 'cleaning', label: 'Cleaning', color: 'cyan' },
  { id: 'out_of_order', label: 'Out of order', color: 'rose' },
]

export const RESERVATION_STATUSES = [
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'checked_in', label: 'Checked in' },
  { id: 'checked_out', label: 'Checked out' },
  { id: 'cancelled', label: 'Cancelled' },
  { id: 'no_show', label: 'No show' },
]

export const PAYMENT_METHODS = ['Card', 'Cash', 'Bank transfer', 'Mobile money']

export const HOUSEKEEPING_TYPES = [
  { id: 'cleaning', label: 'Cleaning' },
  { id: 'checkout_clean', label: 'Checkout clean' },
  { id: 'maintenance', label: 'Maintenance' },
  { id: 'turndown', label: 'Turndown' },
]

export function canAccess(role, key) {
  const resolved = role === 'Hotel Manager' ? HOTEL_MANAGER_ADMIN : role
  return ROLE_ACCESS[resolved]?.includes(key) ?? false
}

export function isSuperAdmin(user) {
  return user?.role === SUPER_ADMIN
}

export function isHotelManagerAdmin(user) {
  return user?.role === HOTEL_MANAGER_ADMIN || user?.role === 'Hotel Manager'
}

export const PUBLIC_TRAVEL_PATHS = ['/', '/flights', '/cars', '/attractions', '/taxis']

