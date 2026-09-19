import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthLayout } from './layouts/AuthLayout'
import { AppShell } from './layouts/AppShell'
import { GroupDashboardPage, HotelWorkspace, LegacyHotelRedirect, OrgConsoleGate } from './layouts/HotelWorkspace'
import { ProtectedRoute } from './components/ProtectedRoute'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { HotelsPage } from './pages/HotelsPage'
import { RoomsPage } from './pages/RoomsPage'
import { ReservationsPage } from './pages/ReservationsPage'
import { GuestsPage } from './pages/GuestsPage'
import { FrontDeskPage } from './pages/FrontDeskPage'
import { HousekeepingPage } from './pages/HousekeepingPage'
import { StaffPage } from './pages/StaffPage'
import { PaymentsPage } from './pages/PaymentsPage'
import { ReceivablesPage } from './pages/ReceivablesPage'
import { ReportsPage } from './pages/ReportsPage'
import { SettingsPage } from './pages/SettingsPage'
import { ProfilePage } from './pages/ProfilePage'

const hotelPages = (
  <>
    <Route index element={<Navigate to="dashboard" replace />} />
    <Route path="dashboard" element={<DashboardPage />} />
    <Route path="rooms" element={<RoomsPage />} />
    <Route path="reservations" element={<ReservationsPage />} />
    <Route path="guests" element={<GuestsPage />} />
    <Route path="front-desk" element={<FrontDeskPage />} />
    <Route path="housekeeping" element={<HousekeepingPage />} />
    <Route path="staff" element={<StaffPage />} />
    <Route path="payments" element={<PaymentsPage />} />
    <Route path="receivables" element={<ReceivablesPage />} />
    <Route path="reports" element={<ReportsPage />} />
    <Route path="settings" element={<SettingsPage />} />
    <Route path="profile" element={<ProfilePage />} />
  </>
)

export default function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>
      <Route element={<AppShell />}>
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<GroupDashboardPage><DashboardPage /></GroupDashboardPage>} />
          <Route path="/hotels" element={<HotelsPage />} />
          <Route path="/settings" element={<OrgConsoleGate hotelSegment="settings"><SettingsPage /></OrgConsoleGate>} />
          <Route path="/profile" element={<OrgConsoleGate hotelSegment="profile"><ProfilePage /></OrgConsoleGate>} />
          <Route path="/h/:hotelId" element={<HotelWorkspace />}>
            {hotelPages}
          </Route>
          <Route path="/rooms" element={<LegacyHotelRedirect segment="rooms" />} />
          <Route path="/reservations" element={<LegacyHotelRedirect segment="reservations" />} />
          <Route path="/guests" element={<LegacyHotelRedirect segment="guests" />} />
          <Route path="/front-desk" element={<LegacyHotelRedirect segment="front-desk" />} />
          <Route path="/housekeeping" element={<LegacyHotelRedirect segment="housekeeping" />} />
          <Route path="/staff" element={<LegacyHotelRedirect segment="staff" />} />
          <Route path="/payments" element={<LegacyHotelRedirect segment="payments" />} />
          <Route path="/receivables" element={<LegacyHotelRedirect segment="receivables" />} />
          <Route path="/reports" element={<LegacyHotelRedirect segment="reports" />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
