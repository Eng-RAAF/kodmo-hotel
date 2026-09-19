import { Navigate, Outlet } from 'react-router-dom'
import { Building2 } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { postLoginPath } from '../lib/paths'
import { Toasts } from '../components/layout/Toasts'

const highlights = [
  { title: 'Grand Palace', detail: 'Mogadishu · 5-star flagship' },
  { title: 'Ocean View', detail: 'Kismayo · beachfront' },
  { title: 'City Heights', detail: 'Hargeisa · business' },
]

export function AuthLayout() {
  const user = useAuthStore((state) => state.user)
  if (user) return <Navigate to={postLoginPath(user)} replace />

  return (
    <div className="relative min-h-screen min-h-dvh">
      <div className="grid min-h-screen min-h-dvh lg:grid-cols-2">
      <div className="relative hidden bg-navy-900 lg:flex lg:flex-col lg:justify-between p-10 text-white">
        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-gold-400 text-navy-950">
            <Building2 size={22} />
          </div>
          <div>
            <p className="text-2xl font-extrabold">StayHub</p>
            <p className="text-sm text-white/75">Multi-hotel operations</p>
          </div>
        </div>
        <div className="relative max-w-lg">
          <p className="text-4xl font-extrabold leading-tight">Find, run, and grow every hotel from one desk.</p>
          <p className="mt-4 max-w-md text-sm leading-7 text-white/75">
            Switch hotels, take walk-ins, and watch occupancy and revenue across the group.
          </p>
          <div className="mt-8 grid gap-2">
            {highlights.map((item) => (
              <div key={item.title} className="flex items-center justify-between rounded-md bg-white/10 px-4 py-3">
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="text-xs text-gold-300">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-xs text-white/50">StayHub group · Grand Palace · Ocean View · City Heights</p>
      </div>
      <div className="flex items-center justify-center bg-[#f5f5f5] px-4 py-8 sm:px-6 sm:py-12">
        <div className="w-full min-w-0 max-w-md">
          <Outlet />
        </div>
      </div>
      </div>
      <Toasts />
    </div>
  )
}
