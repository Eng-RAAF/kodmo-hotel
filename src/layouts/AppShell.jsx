import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from '../components/layout/Sidebar'
import { Header } from '../components/layout/Header'
import { isSuperAdmin } from '../lib/constants'
import { SearchModal } from '../components/layout/SearchModal'
import { Toasts } from '../components/layout/Toasts'
import { useUiStore } from '../store/uiStore'
import { useAuthStore } from '../store/authStore'
import { useHotelStore } from '../store/hotelStore'
import { useDataStore } from '../store/dataStore'
import { matchHotelApp } from '../lib/paths'

function LoadingScreen() {
  return (
    <div className="fade-up space-y-6">
      <div className="h-9 w-56 animate-pulse rounded-md bg-white" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-28 animate-pulse rounded-lg bg-white" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="h-72 animate-pulse rounded-lg bg-white xl:col-span-2" />
        <div className="h-72 animate-pulse rounded-lg bg-white" />
      </div>
    </div>
  )
}

export function AppShell() {
  const location = useLocation()
  const sidebarOpen = useUiStore((state) => state.sidebarOpen)
  const setSidebarOpen = useUiStore((state) => state.setSidebarOpen)
  const user = useAuthStore((state) => state.user)
  const currentHotelId = useHotelStore((state) => state.currentHotelId)
  const setHotel = useHotelStore((state) => state.setHotel)
  const loadAll = useDataStore((state) => state.loadAll)
  const loaded = useDataStore((state) => state.loaded)
  const logout = useAuthStore((state) => state.logout)

  useEffect(() => {
    if (!user) return
    if (!isSuperAdmin(user) && user.hotelId && currentHotelId === 'all') {
      setHotel(user.hotelId)
    }
    if (isSuperAdmin(user) && !matchHotelApp(location.pathname)) {
      setHotel('all')
    }
  }, [user, currentHotelId, setHotel, location.pathname])

  useEffect(() => {
    if (!user) return
    loadAll().catch((error) => {
      if (error.status === 401) logout()
    })
  }, [user, loadAll, logout])

  return (
    <div className="app-shell min-h-screen min-h-dvh min-w-0 overflow-x-clip">
      <div className="sticky top-0 z-30 pt-[env(safe-area-inset-top)]">
        <Header />
      </div>

      {sidebarOpen && user ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button type="button" className="absolute inset-0 bg-navy-950/55" onClick={() => setSidebarOpen(false)} aria-label="Close menu" />
          <div className="relative h-full w-[min(100vw-2.5rem,20rem)] max-w-full pt-[env(safe-area-inset-top)] shadow-2xl">
            <Sidebar mobile />
          </div>
        </div>
      ) : null}

      <main className="mx-auto min-w-0 w-full max-w-[1440px] px-3 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-6 lg:px-8">
        {user && !loaded ? <LoadingScreen /> : <div className="fade-up min-w-0"><Outlet /></div>}
      </main>
      <SearchModal />
      <Toasts />
    </div>
  )
}

export { AppShell as DashboardLayout }
