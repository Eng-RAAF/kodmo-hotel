import { NavLink, useNavigate } from 'react-router-dom'
import {
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
  Settings,
  LogOut,
  X,
  Plane,
  Car,
} from 'lucide-react'
import { NAV_ITEMS, canAccess } from '../../lib/constants'
import { useAuthStore } from '../../store/authStore'
import { useHotelStore } from '../../store/hotelStore'
import { useUiStore } from '../../store/uiStore'
import { initials } from '../../lib/format'

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
}

const TRAVEL_LINKS = [
  { to: '/flights', label: 'Flights', icon: Plane },
  { to: '/cars', label: 'Car rental', icon: Car },
  { to: '/attractions', label: 'Attractions', icon: Sparkles },
  { to: '/taxis', label: 'Airport taxis', icon: Car },
]

export function Sidebar({ mobile = false }) {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const setHotel = useHotelStore((state) => state.setHotel)
  const setSidebarOpen = useUiStore((state) => state.setSidebarOpen)
  const navigate = useNavigate()

  const items = NAV_ITEMS.filter((item) => canAccess(user?.role, item.key))

  const close = () => {
    if (mobile) setSidebarOpen(false)
  }

  const handleLogout = () => {
    logout()
    setHotel('all')
    navigate('/')
  }

  return (
    <aside className="relative flex h-full w-[280px] flex-col overflow-hidden bg-navy-900 text-white">
      <div className="relative px-5 pt-6 pb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gold-400 text-navy-950">
              <Building2 size={18} />
            </div>
            <div>
              <p className="text-lg font-extrabold leading-none text-white">StayHub</p>
              <p className="mt-1 text-[11px] font-semibold text-white/70">Hotel operations</p>
            </div>
          </div>
          {mobile ? (
            <button type="button" onClick={close} className="rounded-md p-2 text-white/70 hover:bg-white/10">
              <X size={18} />
            </button>
          ) : null}
        </div>
      </div>

      <nav className="sidebar-scroll relative flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
        <NavLink
          to="/"
          end
          onClick={close}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold ${
              isActive ? 'bg-white text-navy-900' : 'text-white/85 hover:bg-white/10 hover:text-white'
            }`
          }
        >
          <BedDouble size={18} className="shrink-0" />
          Stays
        </NavLink>
        {TRAVEL_LINKS.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={close}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold ${
                  isActive ? 'bg-white text-navy-900' : 'text-white/85 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon size={18} className="shrink-0" />
              {item.label}
            </NavLink>
          )
        })}
        {items.map((item) => {
          const Icon = ICONS[item.icon]
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard'}
              onClick={close}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold ${
                  isActive ? 'bg-white text-navy-900' : 'text-white/85 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon size={18} className="shrink-0" />
              {item.label}
            </NavLink>
          )
        })}
      </nav>

      <div className="relative border-t border-white/15 p-3">
        {canAccess(user?.role, 'settings') ? (
          <NavLink
            to="/settings"
            onClick={close}
            className={({ isActive }) =>
              `mb-1 flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold ${
                isActive ? 'bg-white text-navy-900' : 'text-white/85 hover:bg-white/10'
              }`
            }
          >
            <Settings size={18} />
            Settings
          </NavLink>
        ) : null}
        <button
          type="button"
          onClick={handleLogout}
          className="mb-3 flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-semibold text-white/85 hover:bg-white/10"
        >
          <LogOut size={18} />
          Logout
        </button>
        <button
          type="button"
          onClick={() => {
            close()
            navigate('/profile')
          }}
          className="flex w-full items-center gap-3 rounded-md bg-white/10 px-3 py-3 text-left hover:bg-white/15"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-400 text-xs font-bold text-navy-950">
            {initials(user?.name)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-white">{user?.name}</p>
            <p className="truncate text-xs text-white/65">{user?.role}</p>
          </div>
        </button>
      </div>
    </aside>
  )
}
