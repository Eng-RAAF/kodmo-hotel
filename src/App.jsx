import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthLayout } from './layouts/AuthLayout'
import { AppShell } from './layouts/AppShell'
import { ProtectedRoute } from './components/ProtectedRoute'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { ExplorePage } from './pages/ExplorePage'
import { TravelMarketPage } from './pages/TravelMarketPage'
import { DashboardPage } from './pages/DashboardPage'
import { HotelsPage } from './pages/HotelsPage'
import { RoomsPage } from './pages/RoomsPage'
import { ReservationsPage } from './pages/ReservationsPage'
import { GuestsPage } from './pages/GuestsPage'
import { FrontDeskPage } from './pages/FrontDeskPage'
import { HousekeepingPage } from './pages/HousekeepingPage'
import { StaffPage } from './pages/StaffPage'
import { PaymentsPage } from './pages/PaymentsPage'
import { ReportsPage } from './pages/ReportsPage'
import { SettingsPage } from './pages/SettingsPage'
import { ProfilePage } from './pages/ProfilePage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route element={<AuthLayout />}>
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>
      <Route element={<AppShell />}>
        <Route path="/" element={<ExplorePage />} />
        <Route path="/flights" element={<TravelMarketPage kind="flights" />} />
        <Route path="/cars" element={<TravelMarketPage kind="cars" />} />
        <Route path="/attractions" element={<TravelMarketPage kind="attractions" />} />
        <Route path="/taxis" element={<TravelMarketPage kind="taxis" />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/hotels" element={<HotelsPage />} />
          <Route path="/rooms" element={<RoomsPage />} />
          <Route path="/reservations" element={<ReservationsPage />} />
          <Route path="/guests" element={<GuestsPage />} />
          <Route path="/front-desk" element={<FrontDeskPage />} />
          <Route path="/housekeeping" element={<HousekeepingPage />} />
          <Route path="/staff" element={<StaffPage />} />
          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
