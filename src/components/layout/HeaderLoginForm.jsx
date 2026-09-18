import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { DEMO_ACCOUNTS } from '../../lib/constants'
import { api, convexQuery } from '../../api/client'
import { useAuthStore } from '../../store/authStore'
import { useHotelStore } from '../../store/hotelStore'
import { useUiStore } from '../../store/uiStore'

const demoByEmail = Object.fromEntries(DEMO_ACCOUNTS.map((account) => [account.email, account]))

export function HeaderLoginForm() {
  const login = useAuthStore((state) => state.login)
  const setHotel = useHotelStore((state) => state.setHotel)
  const pushToast = useUiStore((state) => state.pushToast)
  const navigate = useNavigate()
  const location = useLocation()
  const [options, setOptions] = useState(DEMO_ACCOUNTS.map((account) => ({
    email: account.email,
    label: account.role === 'Super Admin' ? 'Super Admin' : account.scope,
    role: account.role,
  })))
  const {
    register,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: { email: '', password: '' },
  })

  useEffect(() => {
    let alive = true
    convexQuery(api.hotels.loginOptions)
      .then((rows) => {
        if (!alive || !Array.isArray(rows) || !rows.length) return
        setOptions(rows)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

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

  const fillAccount = (value) => {
    const option = options.find((item) => (item.email || `hotel:${item.hotelId}`) === value)
    if (!option) return
    if (!option.email) {
      pushToast('This hotel has no manager login yet. Create one under Settings.', 'info')
      return
    }
    setValue('email', option.email)
    setValue('password', demoByEmail[option.email]?.password || '')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex w-full min-w-0 flex-col gap-2 lg:w-auto lg:flex-row lg:items-center">
      <input
        id="header-login-email"
        type="email"
        autoComplete="username"
        placeholder="Email"
        aria-label="Email"
        className="h-9 w-full rounded-md border-0 bg-white px-3 text-sm font-medium text-[#1a1a1a] outline-none placeholder:text-stone-400 lg:w-44"
        {...register('email', { required: true })}
      />
      <input
        type="password"
        autoComplete="current-password"
        placeholder="Password"
        aria-label="Password"
        className="h-9 w-full rounded-md border-0 bg-white px-3 text-sm font-medium text-[#1a1a1a] outline-none placeholder:text-stone-400 lg:w-36"
        {...register('password', { required: true })}
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="h-9 shrink-0 rounded-md bg-white px-4 text-sm font-bold text-[#006ce4] hover:bg-[#f0f6ff] disabled:opacity-60"
      >
        {isSubmitting ? 'Signing in…' : 'Sign in'}
      </button>
      <select
        aria-label="Choose a hotel login"
        defaultValue=""
        className="h-9 w-full rounded-md border border-white/40 bg-white/10 px-2 text-xs font-semibold text-white outline-none lg:w-[180px]"
        onChange={(event) => {
          fillAccount(event.target.value)
          event.target.value = ''
        }}
      >
        <option value="" className="text-[#1a1a1a]">
          Hotels
        </option>
        {options.map((option) => (
          <option key={`${option.hotelId || 'sa'}-${option.email || option.label}`} value={option.email || `hotel:${option.hotelId}`} className="text-[#1a1a1a]">
            {option.label}
          </option>
        ))}
      </select>
      <Link to="/forgot-password" className="hidden text-xs font-semibold text-white/80 underline lg:inline">
        Forgot?
      </Link>
    </form>
  )
}
