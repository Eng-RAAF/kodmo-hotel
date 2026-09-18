import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  Bell,
  BedDouble,
  Building2,
  CalendarCheck,
  Car,
  CircleHelp,
  ConciergeBell,
  LayoutDashboard,
  Hotel,
  Settings,
  Sparkles,
  LogOut,
  Menu,
  Plane,
} from 'lucide-react'
import { HotelSelector } from './HotelSelector'
import { HeaderLoginForm } from './HeaderLoginForm'
import { useDataStore } from '../../store/dataStore'
import { useUiStore } from '../../store/uiStore'
import { useHotelScope } from '../../hooks/useHotelScope'
import { useAuthStore } from '../../store/authStore'
import { useHotelStore } from '../../store/hotelStore'
import { canAccess, isSuperAdmin, PUBLIC_TRAVEL_PATHS } from '../../lib/constants'
import { initials } from '../../lib/format'
import { useEffect, useRef, useState } from 'react'

const TRAVEL_PILLS = [
  { to: '/', label: 'Stays', icon: BedDouble, end: true },
  { to: '/flights', label: 'Flights', icon: Plane },
  { to: '/cars', label: 'Car rental', icon: Car },
  { to: '/attractions', label: 'Attractions', icon: Sparkles },
  { to: '/taxis', label: 'Airport taxis', icon: Car },
]

const PILLS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, key: 'dashboard' },
  { to: '/hotels', label: 'Hotels', icon: Hotel, key: 'hotels' },
  { to: '/rooms', label: 'Rooms', icon: Building2, key: 'rooms' },
  { to: '/reservations', label: 'Reservations', icon: CalendarCheck, key: 'reservations' },
  { to: '/front-desk', label: 'Front Desk', icon: ConciergeBell, key: 'front-desk' },
  { to: '/settings', label: 'Settings', icon: Settings, key: 'settings' },
]

export function Header() {
  const setSidebarOpen = useUiStore((state) => state.setSidebarOpen)
  const notificationsOpen = useUiStore((state) => state.notificationsOpen)
  const setNotificationsOpen = useUiStore((state) => state.setNotificationsOpen)
  const notifications = useDataStore((state) => state.notifications)
  const markNotificationRead = useDataStore((state) => state.markNotificationRead)
  const markAllNotificationsRead = useDataStore((state) => state.markAllNotificationsRead)
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const setHotel = useHotelStore((state) => state.setHotel)
  const { currentHotelId, isAllHotels } = useHotelScope()
  const ref = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()
  const onPublicTravel = PUBLIC_TRAVEL_PATHS.includes(location.pathname)
  const [loginOpen, setLoginOpen] = useState(false)

  const visible = notifications.filter((item) => isAllHotels || item.hotelId === 'all' || item.hotelId === currentHotelId)
  const unread = visible.filter((item) => !item.read).length
  const pills = PILLS.filter((item) => user && canAccess(user.role, item.key))

  useEffect(() => {
    const onClick = (event) => {
      if (!ref.current?.contains(event.target)) setNotificationsOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [setNotificationsOpen])

  useEffect(() => {
    setLoginOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const openLogin = () => setLoginOpen(true)
    window.addEventListener('stayhub:open-login', openLogin)
    return () => window.removeEventListener('stayhub:open-login', openLogin)
  }, [])

  return (
    <header className="bg-navy-900 text-white">
      <div className="mx-auto max-w-[1100px] px-3 py-3 sm:px-4">
        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <button
              type="button"
              className="rounded-md p-2 text-white hover:bg-white/10 lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
          ) : null}

          <button type="button" onClick={() => navigate('/')} className="flex min-w-0 shrink-0 items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-gold-400 text-navy-950">
              <Building2 size={16} />
            </span>
            <span className="text-lg font-extrabold tracking-tight sm:text-[22px]">StayHub</span>
          </button>

          {user && !onPublicTravel ? (
            <div className="min-w-0 max-w-[9.5rem] flex-1 sm:max-w-xs">
              <HotelSelector />
            </div>
          ) : null}

          <div className="ml-auto flex min-w-0 items-center gap-1 text-sm font-semibold sm:gap-2">
            {user || !onPublicTravel ? (
              <>
                <span className="hidden px-2 py-2 lg:inline">USD</span>
                <span className="hidden rounded-full px-2 py-1 text-base lg:inline" aria-hidden>🇸🇴</span>
                <button type="button" className="hidden rounded-full p-2 hover:bg-white/10 lg:inline-flex" aria-label="Help">
                  <CircleHelp size={20} />
                </button>
              </>
            ) : null}
            {isSuperAdmin(user) ? (
              <button
                type="button"
                onClick={() => navigate('/hotels')}
                className="hidden rounded-md px-3 py-2 hover:bg-white/10 lg:inline"
              >
                List your hotel
              </button>
            ) : null}
            {user ? (
              <>
                <div ref={ref} className="relative">
                  <button
                    type="button"
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="relative rounded-md p-2 hover:bg-white/10"
                    aria-label="Notifications"
                  >
                    <Bell size={18} />
                    {unread ? <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-gold-400 ring-2 ring-navy-900" /> : null}
                  </button>
                  {notificationsOpen ? (
                    <div className="absolute top-full right-0 z-40 mt-2 w-[min(100vw-1.5rem,360px)] overflow-hidden rounded-lg border border-stone-line bg-white text-[#1a1a1a] shadow-2xl">
                      <div className="flex items-center justify-between border-b border-stone-line px-4 py-3">
                        <p className="text-sm font-bold">Notifications</p>
                        <button type="button" className="text-xs font-bold text-[#006ce4]" onClick={markAllNotificationsRead}>
                          Mark all read
                        </button>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {visible.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              markNotificationRead(item.id)
                              setNotificationsOpen(false)
                            }}
                            className={`block w-full border-b border-stone-line px-4 py-3 text-left hover:bg-[#f0f6ff] ${item.read ? '' : 'bg-[#e7f3ff]'}`}
                          >
                            <p className="text-sm font-semibold">{item.title}</p>
                            <p className="mt-0.5 text-xs text-stone-500">{item.body}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/profile')}
                  className="hidden items-center gap-2 rounded-md px-2 py-1.5 hover:bg-white/10 sm:flex"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-xs font-bold text-navy-900">
                    {initials(user?.name)}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    logout()
                    setHotel('all')
                    navigate('/')
                  }}
                  className="hidden items-center gap-1 rounded-md border border-white px-3 py-1.5 hover:bg-white/10 lg:flex"
                >
                  <LogOut size={14} />
                  Sign out
                </button>
              </>
            ) : onPublicTravel ? (
              <>
                <button
                  type="button"
                  id="header-signin-toggle"
                  onClick={() => setLoginOpen((value) => !value)}
                  className="h-9 rounded-md bg-white px-3 text-sm font-bold text-[#006ce4] hover:bg-[#f0f6ff] lg:hidden"
                >
                  {loginOpen ? 'Close' : 'Sign in'}
                </button>
                <div className="hidden lg:block">
                  <HeaderLoginForm />
                </div>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="hidden rounded-md border border-white px-3 py-1.5 hover:bg-white/10 sm:inline"
                >
                  Register
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="rounded-md bg-white px-3 py-1.5 font-bold text-[#006ce4] hover:bg-[#f0f6ff]"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>
        {loginOpen && !user && onPublicTravel ? (
          <div className="mt-3 lg:hidden">
            <HeaderLoginForm />
          </div>
        ) : null}
      </div>

      <nav className="no-scrollbar mx-auto flex max-w-[1100px] gap-1.5 overflow-x-auto px-3 pb-3 sm:gap-2 sm:px-4">
        {TRAVEL_PILLS.concat(pills).map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold sm:gap-2 sm:px-4 sm:py-2 ${
                  isActive ? 'border-white bg-white/10' : 'border-transparent hover:bg-white/10'
                }`
              }
            >
              <Icon size={16} className="sm:hidden" />
              <Icon size={18} className="hidden sm:block" />
              {item.label}
            </NavLink>
          )
        })}
      </nav>
    </header>
  )
}
