import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  BedDouble,
  CalendarCheck,
  CircleDollarSign,
  LogIn,
  LogOut,
  Percent,
  Sparkles,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { PageHeader } from '../components/ui/PageHeader'
import { StatCard } from '../components/ui/StatCard'
import { Card, CardHeader } from '../components/ui/Card'
import { Table } from '../components/ui/Table'
import { ReservationStatusBadge, RoomStatusBadge } from '../components/ui/Badge'
import { useDataStore } from '../store/dataStore'
import { useHotelScope, useScopedList } from '../hooks/useHotelScope'
import { TODAY, canAccess } from '../lib/constants'
import { formatCurrency, formatDate, formatShortDate, percent } from '../lib/format'
import { useAuthStore } from '../store/authStore'

const PIE_COLORS = {
  available: '#10b981',
  occupied: '#0ea5e9',
  reserved: '#6366f1',
  dirty: '#f59e0b',
  cleaning: '#06b6d4',
  out_of_order: '#f43f5e',
}

export function DashboardPage() {
  const { currentHotel, isAllHotels } = useHotelScope()
  const user = useAuthStore((state) => state.user)
  const hotels = useDataStore((state) => state.hotels)
  const rooms = useScopedList(useDataStore((state) => state.rooms))
  const reservations = useScopedList(useDataStore((state) => state.reservations))
  const guests = useDataStore((state) => state.guests)
  const tasks = useScopedList(useDataStore((state) => state.housekeepingTasks))
  const occupancyTrend = useDataStore((state) => state.occupancyTrend)
  const revenueTrend = useDataStore((state) => state.revenueTrend)
  const hotelById = useDataStore((state) => state.hotelById)

  const metrics = useMemo(() => {
    const sellable = rooms.filter((room) => room.status !== 'out_of_order')
    const occupied = rooms.filter((room) => room.status === 'occupied').length
    const available = rooms.filter((room) => room.status === 'available').length
    const arrivals = reservations.filter((item) => item.checkIn === TODAY && item.status !== 'cancelled')
    const departures = reservations.filter((item) => item.checkOut === TODAY && item.status !== 'cancelled')
    const inHouse = reservations.filter((item) => item.status === 'checked_in')
    const liveRevenue = reservations
      .filter((item) => item.status === 'checked_in' || item.status === 'checked_out')
      .reduce((sum, item) => sum + item.paid, 0)
    const occupancy = percent(occupied, sellable.length)
    const adr = occupied ? Math.round(liveRevenue / Math.max(occupied, 1)) : 0
    return { sellable: sellable.length, occupied, available, arrivals, departures, inHouse, liveRevenue, occupancy, adr }
  }, [rooms, reservations])

  const roomMix = useMemo(() => {
    const counts = rooms.reduce((acc, room) => {
      acc[room.status] = (acc[room.status] || 0) + 1
      return acc
    }, {})
    return Object.entries(counts).map(([name, value]) => ({ name: name.replaceAll('_', ' '), key: name, value }))
  }, [rooms])

  const hotelRows = useMemo(() => {
    return hotels.map((hotel) => {
      const hotelRooms = rooms.filter((room) => (isAllHotels ? room.hotelId === hotel.id : true) && room.hotelId === hotel.id)
      const allRooms = useDataStore.getState().rooms.filter((room) => room.hotelId === hotel.id)
      const source = isAllHotels ? allRooms : hotelRooms
      const occupied = source.filter((room) => room.status === 'occupied').length
      const occ = percent(occupied, source.filter((room) => room.status !== 'out_of_order').length)
      const revenue = useDataStore
        .getState()
        .reservations.filter((item) => item.hotelId === hotel.id)
        .reduce((sum, item) => sum + item.paid, 0)
      return { ...hotel, occupied, occ, revenue }
    })
  }, [hotels, rooms, isAllHotels])

  const upcoming = reservations
    .filter((item) => item.status === 'confirmed' || (item.status === 'checked_in' && item.checkOut === TODAY))
    .sort((a, b) => a.checkIn.localeCompare(b.checkIn))
    .slice(0, 6)

  const occupancyChart = occupancyTrend.map((row) => {
    if (isAllHotels) {
      return {
        date: row.date,
        occupancy: Math.round((row['Grand Palace'] + row['Ocean View'] + row['City Heights']) / 3),
      }
    }
    const name = currentHotel?.name
    return { date: row.date, occupancy: row[name] || 0 }
  })

  const revenueChart = isAllHotels
    ? revenueTrend
    : revenueTrend.map((row) => ({ date: row.date, revenue: row[currentHotel?.name] || 0 }))

  return (
    <div>
      <PageHeader
        title={isAllHotels ? 'Group dashboard' : currentHotel?.name || 'Dashboard'}
        subtitle={
          isAllHotels
            ? `Organization-wide occupancy, revenue, and hotel health for ${formatDate(TODAY)}.`
            : `${currentHotel?.city} · Today’s arrivals, in-house guests, and room status.`
        }
      />

      <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Occupancy" value={`${metrics.occupancy}%`} hint={`${metrics.occupied} of ${metrics.sellable} sellable rooms`} icon={Percent} trend="+4.2%" />
        <StatCard label="Available rooms" value={metrics.available} hint="Ready for walk-ins and assignments" icon={BedDouble} />
        <StatCard label="Arrivals today" value={metrics.arrivals.length} hint={`${metrics.departures.length} departures scheduled`} icon={LogIn} />
        <StatCard label="Collected revenue" value={formatCurrency(metrics.liveRevenue)} hint="Paid against current and recent stays" icon={CircleDollarSign} trend="+8%" />
      </div>

      <div className="mt-6 grid min-w-0 gap-4 xl:grid-cols-3">
        <Card className="min-w-0 xl:col-span-2">
          <CardHeader title="Occupancy trend" subtitle="Last 14 days" />
          <div className="h-64 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={occupancyChart}>
                <defs>
                  <linearGradient id="occ" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#003b95" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#003b95" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e7e7" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={[40, 100]} />
                <Tooltip />
                <Area type="monotone" dataKey="occupancy" stroke="#003b95" fill="url(#occ)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <CardHeader title="Room status" subtitle={`${rooms.length} rooms in scope`} />
          <div className="h-64 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={roomMix} dataKey="value" nameKey="name" innerRadius={52} outerRadius={80} paddingAngle={3}>
                  {roomMix.map((entry) => (
                    <Cell key={entry.key} fill={PIE_COLORS[entry.key]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {isAllHotels ? (
        <div className="mt-6 grid min-w-0 gap-4 xl:grid-cols-3">
          <Card className="min-w-0 xl:col-span-2">
            <CardHeader title="Revenue by hotel" subtitle="Trailing 14 days" />
            <div className="h-72 p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e7e7" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="Grand Palace" fill="#003b95" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Ocean View" fill="#006ce4" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="City Heights" fill="#ffb700" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card>
            <CardHeader title="Hotel snapshot" />
            <div className="divide-y divide-ivory-100">
              {hotelRows.map((hotel) => (
                <div key={hotel.id} className="px-5 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-navy-900">{hotel.name}</p>
                      <p className="text-xs text-stone-500">{hotel.city}</p>
                    </div>
                    <p className="font-display text-lg text-navy-900">{hotel.occ}%</p>
                  </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#e7e7e7]">
                    <div className="h-full rounded-full bg-navy-900" style={{ width: `${hotel.occ}%` }} />
                  </div>
                  <p className="mt-2 text-xs text-stone-500">{formatCurrency(hotel.revenue)} collected</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      ) : (
        <Card className="mt-6">
          <CardHeader title="Revenue" subtitle="Last 14 days at this hotel" />
          <div className="h-64 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e7e7" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#003b95" fill="#003b9522" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      <div className="mt-6 grid min-w-0 gap-4 xl:grid-cols-3">
        <Card className="min-w-0 xl:col-span-2">
          <CardHeader
            title="Front desk queue"
            subtitle="Arrivals, in-house departures, and upcoming confirmed stays"
            action={
              canAccess(user?.role, 'front-desk') ? (
                <Link to="/front-desk" className="text-xs font-bold text-[#006ce4] hover:underline">
                  Open front desk
                </Link>
              ) : null
            }
          />
          <Table
            rows={upcoming}
            emptyTitle="Nothing in the queue"
            columns={[
              {
                key: 'guest',
                label: 'Guest',
                render: (row) => {
                  const guest = guests.find((item) => item.id === row.guestId)
                  return (
                    <div>
                      <p className="font-medium">{guest ? `${guest.firstName} ${guest.lastName}` : '—'}</p>
                      <p className="text-xs text-stone-500">{row.id.toUpperCase()}</p>
                    </div>
                  )
                },
              },
              {
                key: 'hotel',
                label: 'Hotel',
                render: (row) => (isAllHotels ? hotelById(row.hotelId)?.name : currentHotel?.name),
              },
              { key: 'dates', label: 'Stay', render: (row) => `${formatShortDate(row.checkIn)} – ${formatShortDate(row.checkOut)}` },
              { key: 'status', label: 'Status', render: (row) => <ReservationStatusBadge status={row.status} /> },
            ]}
          />
        </Card>
        <Card>
          <CardHeader
            title="Housekeeping alerts"
            subtitle={`${tasks.filter((task) => task.status !== 'done').length} open tasks`}
            action={
              canAccess(user?.role, 'housekeeping') ? (
                <Link to="/housekeeping" className="text-xs font-bold text-[#006ce4] hover:underline">
                  Board
                </Link>
              ) : null
            }
          />
          <div className="divide-y divide-ivory-100">
            {tasks
              .filter((task) => task.status !== 'done')
              .slice(0, 6)
              .map((task) => {
                const room = rooms.find((item) => item.id === task.roomId) || useDataStore.getState().roomById(task.roomId)
                return (
                  <div key={task.id} className="flex items-start justify-between gap-3 px-5 py-3">
                    <div>
                      <p className="text-sm font-medium">
                        Room {room?.number} · {task.type.replaceAll('_', ' ')}
                      </p>
                      <p className="text-xs text-stone-500">{task.notes || 'No notes'}</p>
                    </div>
                    <RoomStatusBadge status={room?.status || 'dirty'} />
                  </div>
                )
              })}
            {tasks.filter((task) => task.status !== 'done').length === 0 ? (
              <div className="flex items-center gap-2 px-5 py-8 text-sm text-stone-500">
                <Sparkles size={16} className="text-[#006ce4]" /> All caught up
              </div>
            ) : null}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {canAccess(user?.role, 'reservations') ? <QuickLink to="/reservations" icon={CalendarCheck} label="New reservation" /> : null}
        {canAccess(user?.role, 'front-desk') ? <QuickLink to="/front-desk" icon={LogOut} label="Run check-out" /> : null}
        {canAccess(user?.role, 'reports') ? <QuickLink to="/reports" icon={Percent} label="Open reports" /> : null}
      </div>
    </div>
  )
}

function QuickLink({ to, icon: Icon, label }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-md border border-stone-line bg-white px-4 py-3 text-sm font-bold text-[#1a1a1a] hover:border-[#006ce4]"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-md bg-navy-900 text-white">
        <Icon size={16} />
      </span>
      {label}
    </Link>
  )
}
