import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  Bell,
  Building2,
  CalendarCheck,
  CircleHelp,
  ConciergeBell,
  LayoutDashboard,
  Settings,
  Sparkles,
  LogOut,
  Menu,
  Users,
  IdCard,
  CreditCard,
  BarChart3,
  BedDouble,
  Wallet,
} from 'lucide-react'
import { HotelSelector } from './HotelSelector'
import { useDataStore } from '../../store/dataStore'
import { useUiStore } from '../../store/uiStore'
import { useHotelScope, useHotelPath } from '../../hooks/useHotelScope'
import { useAuthStore } from '../../store/authStore'
import { useHotelStore } from '../../store/hotelStore'
import { canAccess, isSuperAdmin, NAV_ITEMS } from '../../lib/constants'
import { hotelAppPath, matchHotelApp, navHref } from '../../lib/paths'
import { initials } from '../../lib/format'
import { useEffect, useRef } from 'react'

const ICONS = {
  LayoutDashboard,
  Building2,
  BedDouble,
  CalendarCheck,
  Users,
  ConciergeBell,
  Sparkles,
  IdCard,
  CreditCard,
  BarChart3,
  Wallet,
  Settings,
}

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
  const { currentHotelId, currentHotel, isAllHotels, canViewAll } = useHotelScope()
  const { inHotelApp, path } = useHotelPath()
  const ref = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()
  const hotelRoute = matchHotelApp(location.pathname)

  const visible = notifications.filter((item) => isAllHotels || item.hotelId === 'all' || item.hotelId === currentHotelId)
  const unread = visible.filter((item) => !item.read).length

  const pills = !user
    ? []
    : inHotelApp
      ? NAV_ITEMS.filter((item) => !item.orgOnly && canAccess(user.role, item.key)).map((item) => ({
          ...item,
          to: navHref(item, hotelRoute.hotelId),
          icon: ICONS[item.icon],
          end: item.segment === 'dashboard',
        }))
      : NAV_ITEMS.filter((item) => (item.orgOnly || item.segment === 'dashboard') && canAccess(user.role, item.key)).map((item) => ({
          ...item,
          icon: ICONS[item.icon],
          end: item.to === '/dashboard',
        })).concat(
          canAccess(user.role, 'settings')
            ? [{ to: '/settings', label: 'Settings', icon: Settings, key: 'settings' }]
            : [],
        )

  useEffect(() => {
    const onClick = (event) => {
      if (!ref.current?.contains(event.target)) setNotificationsOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [setNotificationsOpen])

  const brandTarget = inHotelApp
    ? hotelAppPath(hotelRoute.hotelId, 'dashboard')
    : user
      ? isSuperAdmin(user) ? '/hotels' : '/'
      : '/'
  const brandName = inHotelApp ? currentHotel?.name || 'Hotel system' : 'StayHub'

  const shell = 'mx-auto w-full max-w-[1440px] px-3 sm:px-6 lg:px-8'

  return (
    <header className="bg-navy-900 text-white">
      <div className={`${shell} py-2.5 sm:py-3`}>
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          {user ? (
            <button
              type="button"
              className="shrink-0 rounded-md p-2 text-white hover:bg-white/10 lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
          ) : null}

          <button type="button" onClick={() => navigate(brandTarget)} className="flex min-w-0 shrink-0 items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gold-400 text-navy-950">
              <Building2 size={16} />
            </span>
            <span className={`truncate text-lg font-extrabold tracking-tight sm:text-[22px] ${user && inHotelApp ? 'hidden lg:inline lg:max-w-[16rem] xl:max-w-none' : 'max-w-[11rem] sm:max-w-none'}`}>
              {brandName}
            </span>
          </button>

          {user && inHotelApp ? (
            <div className={`min-w-0 max-w-[12rem] sm:max-w-xs lg:max-w-sm ${canViewAll ? 'flex-1 lg:flex-none' : 'flex-1 lg:hidden'}`}>
              <HotelSelector />
            </div>
          ) : null}

          <div className="ml-auto flex min-w-0 shrink-0 items-center gap-1 text-sm font-semibold sm:gap-2">
            {user ? (
              <>
                <span className="hidden px-2 py-2 lg:inline">USD</span>
                <span className="hidden rounded-full px-2 py-1 text-base lg:inline" aria-hidden>🇸🇴</span>
                <button type="button" className="hidden rounded-full p-2 hover:bg-white/10 lg:inline-flex" aria-label="Help">
                  <CircleHelp size={20} />
                </button>
                {isSuperAdmin(user) && !inHotelApp ? (
                  <button
                    type="button"
                    onClick={() => navigate('/hotels')}
                    className="hidden rounded-md px-3 py-2 hover:bg-white/10 lg:inline"
                  >
                    List your hotel
                  </button>
                ) : null}
                {isSuperAdmin(user) && inHotelApp ? (
                  <button
                    type="button"
                    onClick={() => navigate('/hotels')}
                    className="hidden rounded-md px-3 py-2 hover:bg-white/10 lg:inline"
                  >
                    All hotels
                  </button>
                ) : null}
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
                  onClick={() => navigate(inHotelApp ? path('profile') : '/profile')}
                  className="flex items-center gap-2 rounded-md px-1.5 py-1.5 hover:bg-white/10 sm:px-2"
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
                    navigate('/', { replace: true, state: {} })
                  }}
                  className="hidden items-center gap-1 rounded-md border border-white px-3 py-1.5 hover:bg-white/10 lg:flex"
                >
                  <LogOut size={14} />
                  Sign out
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/')}
                className="rounded-md bg-white px-3 py-1.5 font-bold text-[#006ce4] hover:bg-[#f0f6ff]"
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      </div>

      {pills.length ? (
        <nav className="hidden border-t border-white/10 lg:block">
          <div className={`${shell} flex flex-wrap gap-1.5 py-2.5 xl:gap-2`}>
          {pills.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-semibold xl:gap-2 xl:px-4 xl:text-sm ${
                    isActive ? 'border-white bg-white/10' : 'border-transparent hover:bg-white/10'
                  }`
                }
              >
                <Icon size={16} />
                {item.label}
              </NavLink>
            )
          })}
          {inHotelApp && canAccess(user?.role, 'settings') ? (
            <NavLink
              to={path('settings')}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-semibold xl:gap-2 xl:px-4 xl:text-sm ${
                  isActive ? 'border-white bg-white/10' : 'border-transparent hover:bg-white/10'
                }`
              }
            >
              <Settings size={16} />
              Settings
            </NavLink>
          ) : null}
          </div>
        </nav>
      ) : null}
    </header>
  )
}
