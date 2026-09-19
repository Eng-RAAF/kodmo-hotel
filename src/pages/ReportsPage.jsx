import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Download } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { Button } from '../components/ui/Button'
import { Card, CardHeader } from '../components/ui/Card'
import { StatCard } from '../components/ui/StatCard'
import { Table } from '../components/ui/Table'
import { Select } from '../components/ui/Field'
import { useDataStore } from '../store/dataStore'
import { useHotelScope, useScopedList } from '../hooks/useHotelScope'
import { useUiStore } from '../store/uiStore'
import { formatCurrency, percent } from '../lib/format'
import { Percent, CircleDollarSign, BedDouble, Ban } from 'lucide-react'

export function ReportsPage() {
  const { isAllHotels, currentHotel } = useHotelScope()
  const rooms = useScopedList(useDataStore((state) => state.rooms))
  const reservations = useScopedList(useDataStore((state) => state.reservations))
  const occupancyTrend = useDataStore((state) => state.occupancyTrend)
  const revenueTrend = useDataStore((state) => state.revenueTrend)
  const hotels = useDataStore((state) => state.hotels)
  const pushToast = useUiStore((state) => state.pushToast)
  const [range, setRange] = useState('14')

  const kpis = useMemo(() => {
    const occupied = rooms.filter((room) => room.status === 'occupied').length
    const sellable = rooms.filter((room) => room.status !== 'out_of_order').length
    const occupancy = percent(occupied, sellable)
    const roomRevenue = reservations.reduce((sum, item) => sum + item.paid, 0)
    const roomsSold = reservations.filter((item) => item.status !== 'cancelled' && item.status !== 'no_show').length
    const adr = roomsSold ? Math.round(roomRevenue / roomsSold) : 0
    const revpar = sellable ? Math.round(roomRevenue / sellable) : 0
    const cancelled = reservations.filter((item) => item.status === 'cancelled' || item.status === 'no_show').length
    return { occupancy, roomRevenue, adr, revpar, cancelled, roomsSold }
  }, [rooms, reservations])

  const occupancyChart = occupancyTrend.slice(-Number(range)).map((row) => {
    if (isAllHotels) {
      return {
        date: row.date,
        occupancy: Math.round((row['Grand Palace'] + row['Ocean View'] + row['City Heights']) / 3),
        'Grand Palace': row['Grand Palace'],
        'Ocean View': row['Ocean View'],
        'City Heights': row['City Heights'],
      }
    }
    return { date: row.date, occupancy: row[currentHotel?.name] || 0 }
  })

  const revenueChart = revenueTrend.slice(-Number(range)).map((row) => {
    if (isAllHotels) return row
    return { date: row.date, revenue: row[currentHotel?.name] || 0 }
  })

  const hotelTable = hotels.map((hotel) => {
    const hotelRooms = useDataStore.getState().rooms.filter((room) => room.hotelId === hotel.id)
    const hotelRes = useDataStore.getState().reservations.filter((item) => item.hotelId === hotel.id)
    const occupied = hotelRooms.filter((room) => room.status === 'occupied').length
    const sellable = hotelRooms.filter((room) => room.status !== 'out_of_order').length
    const revenue = hotelRes.reduce((sum, item) => sum + item.paid, 0)
    return {
      ...hotel,
      occupancy: percent(occupied, sellable),
      adr: hotelRes.length ? Math.round(revenue / hotelRes.length) : 0,
      revenue,
    }
  })

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle={isAllHotels ? 'Organization-level performance across all hotels.' : `${currentHotel?.name} performance snapshot.`}
        actions={
          <>
            <Select value={range} onChange={(event) => setRange(event.target.value)} className="w-36">
              <option value="7">Last 7 days</option>
              <option value="14">Last 14 days</option>
            </Select>
            <Button variant="outline" onClick={() => pushToast('Export queued — connect a backend to download CSV')}>
              <Download size={16} /> Export
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Occupancy" value={`${kpis.occupancy}%`} icon={Percent} />
        <StatCard label="ADR" value={formatCurrency(kpis.adr)} hint="Average daily rate from collected stays" icon={BedDouble} />
        <StatCard label="RevPAR" value={formatCurrency(kpis.revpar)} hint="Revenue per available room" icon={CircleDollarSign} />
        <StatCard label="Cancellations / no-shows" value={kpis.cancelled} icon={Ban} />
      </div>

      <div className="mt-6 grid min-w-0 gap-4 xl:grid-cols-2">
        <Card className="min-w-0">
          <CardHeader title="Occupancy" subtitle={isAllHotels ? 'Compared across hotels' : 'Hotel occupancy'} />
          <div className="h-56 min-w-0 p-3 sm:h-72 sm:p-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={occupancyChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e0d4" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis domain={[40, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                {isAllHotels ? (
                  <>
                    <Line type="monotone" dataKey="Grand Palace" stroke="#0c1a2e" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="Ocean View" stroke="#0ea5e9" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="City Heights" stroke="#d4af37" strokeWidth={2} dot={false} />
                  </>
                ) : (
                  <Line type="monotone" dataKey="occupancy" stroke="#c9a227" strokeWidth={2} />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="min-w-0">
          <CardHeader title="Revenue" />
          <div className="h-56 min-w-0 p-3 sm:h-72 sm:p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e0d4" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                {isAllHotels ? (
                  <>
                    <Bar dataKey="Grand Palace" stackId="a" fill="#0c1a2e" />
                    <Bar dataKey="Ocean View" stackId="a" fill="#0ea5e9" />
                    <Bar dataKey="City Heights" stackId="a" fill="#d4af37" />
                  </>
                ) : (
                  <Bar dataKey="revenue" fill="#0c1a2e" radius={[4, 4, 0, 0]} />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {isAllHotels ? (
        <Card className="mt-6">
          <CardHeader title="Hotel comparison" subtitle="Use All Hotels in the selector to keep this table organization-wide." />
          <Table
            rows={hotelTable}
            columns={[
              { key: 'name', label: 'Hotel' },
              { key: 'city', label: 'City' },
              { key: 'occupancy', label: 'Occupancy', render: (row) => `${row.occupancy}%` },
              { key: 'adr', label: 'ADR', render: (row) => formatCurrency(row.adr) },
              { key: 'revenue', label: 'Collected', render: (row) => formatCurrency(row.revenue) },
            ]}
          />
        </Card>
      ) : null}
    </div>
  )
}
