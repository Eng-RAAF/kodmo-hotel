import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Building2 } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Field, Input } from '../components/ui/Field'
import { DEMO_ACCOUNTS } from '../lib/constants'
import { useAuthStore } from '../store/authStore'
import { useHotelStore } from '../store/hotelStore'
import { useUiStore } from '../store/uiStore'

export function LoginPage() {
  const login = useAuthStore((state) => state.login)
  const setHotel = useHotelStore((state) => state.setHotel)
  const pushToast = useUiStore((state) => state.pushToast)
  const navigate = useNavigate()
  const location = useLocation()
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async ({ email, password }) => {
    const result = await login(email, password)
    if (!result.ok) {
      pushToast(result.error, 'info')
      return
    }
    const orgWide = result.user.role === 'Super Admin'
    setHotel(orgWide ? 'all' : result.user.hotelId)
    navigate(location.state?.from || '/dashboard', { replace: true })
  }

  return (
    <div className="rounded-lg border border-stone-line bg-white p-7 shadow-sm sm:p-8">
      <div className="mb-6 flex items-center gap-3 lg:hidden">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-navy-900 text-gold-400">
          <Building2 size={18} />
        </div>
        <p className="text-2xl font-extrabold text-navy-900">StayHub</p>
      </div>
      <p className="text-sm font-bold text-[#006ce4]">Sign in</p>
      <h1 className="mt-1 text-3xl font-extrabold text-[#1a1a1a]">Welcome back</h1>
      <p className="mt-2 text-sm leading-6 text-stone-500">Sign in as Super Admin or as a Hotel Manager Admin for a single hotel.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4">
        <Field label="Email" error={errors.email?.message}>
          <Input
            type="email"
            placeholder="you@stayhub.com"
            {...register('email', { required: 'Email is required' })}
          />
        </Field>
        <Field label="Password" error={errors.password?.message}>
          <Input
            type="password"
            placeholder="Enter password"
            {...register('password', { required: 'Password is required' })}
          />
        </Field>
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm font-bold text-[#006ce4] hover:underline">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <div className="mt-8 rounded-md border border-stone-line bg-[#f5f5f5] p-4">
        <p className="text-xs font-bold text-stone-500">Demo accounts</p>
        <div className="mt-3 space-y-1.5">
          {DEMO_ACCOUNTS.map((user) => (
            <button
              key={user.email}
              type="button"
              onClick={() => {
                setValue('email', user.email)
                setValue('password', user.password)
              }}
              className="flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-xs transition hover:bg-white"
            >
              <span className="font-bold text-navy-900">{user.role}</span>
              <span className="text-stone-400">{user.scope || user.email}</span>
            </button>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-stone-400">Hotel Manager Admins only see their own hotel. Super Admin sees the whole group.</p>
      </div>
    </div>
  )
}
