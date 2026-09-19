import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { CircleDollarSign, Clock3, Plus, Wallet } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { StatCard } from '../components/ui/StatCard'
import { Modal } from '../components/ui/Modal'
import { Field, Input, Select } from '../components/ui/Field'
import { Table } from '../components/ui/Table'
import { Badge } from '../components/ui/Badge'
import { PAYMENT_METHODS } from '../lib/constants'
import { useDataStore } from '../store/dataStore'
import { useHotelScope, useHotelPath, useScopedList } from '../hooks/useHotelScope'
import { useUiStore } from '../store/uiStore'
import { formatCurrency, formatDate } from '../lib/format'

const statusTone = {
  paid: 'emerald',
  partial: 'amber',
  pending: 'rose',
  refunded: 'slate',
}

export function PaymentsPage() {
  const payments = useScopedList(useDataStore((state) => state.payments))
  const reservations = useScopedList(useDataStore((state) => state.reservations))
  const guests = useDataStore((state) => state.guests)
  const hotels = useDataStore((state) => state.hotels)
  const addPayment = useDataStore((state) => state.addPayment)
  const { currentHotelId, isAllHotels } = useHotelScope()
  const { path } = useHotelPath()
  const pushToast = useUiStore((state) => state.pushToast)
  const [open, setOpen] = useState(false)
  const { register, handleSubmit, reset } = useForm({
    defaultValues: { reservationId: '', amount: '', method: 'Card' },
  })

  const outstanding = reservations.filter((item) => item.paid < item.total && item.status !== 'cancelled')
  const collected = payments.filter((item) => item.status === 'paid' || item.status === 'partial').reduce((sum, item) => sum + item.amount, 0)
  const pending = payments.filter((item) => item.status === 'pending').reduce((sum, item) => sum + item.amount, 0)
  const due = outstanding.reduce((sum, item) => sum + (item.total - item.paid), 0)

  const rows = useMemo(
    () =>
      payments.map((payment) => ({
        ...payment,
        guest: guests.find((guest) => guest.id === payment.guestId),
        hotel: hotels.find((hotel) => hotel.id === payment.hotelId),
      })),
    [payments, guests, hotels],
  )

  return (
    <div>
      <PageHeader
        title="Payments"
        subtitle="Folios, collected cash, and outstanding balances. Open receivables for aging, city ledger, and collections."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button as={Link} to={path('receivables')} variant="outline">
              Open receivables
            </Button>
            <Button onClick={() => setOpen(true)}>
              <Plus size={16} /> Record payment
            </Button>
          </div>
        }
      />
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Collected" value={formatCurrency(collected)} icon={CircleDollarSign} />
        <StatCard label="Outstanding folios" value={formatCurrency(due)} icon={Wallet} />
        <StatCard label="Pending invoices" value={formatCurrency(pending)} icon={Clock3} />
      </div>

      <Card className="mb-6">
        <div className="border-b border-stone-100 px-5 py-4">
          <h3 className="text-sm font-semibold">Outstanding balances</h3>
        </div>
        <Table
          rows={outstanding}
          emptyTitle="No open balances"
          columns={[
            { key: 'id', label: 'Stay', render: (row) => row.id.toUpperCase() },
            {
              key: 'guest',
              label: 'Guest',
              render: (row) => {
                const guest = guests.find((item) => item.id === row.guestId)
                return guest ? `${guest.firstName} ${guest.lastName}` : '—'
              },
            },
            { key: 'total', label: 'Total', render: (row) => formatCurrency(row.total) },
            { key: 'paid', label: 'Paid', render: (row) => formatCurrency(row.paid) },
            { key: 'due', label: 'Due', render: (row) => formatCurrency(row.total - row.paid) },
          ]}
        />
      </Card>

      <Card>
        <div className="border-b border-stone-100 px-5 py-4">
          <h3 className="text-sm font-semibold">Ledger</h3>
        </div>
        <Table
          rows={rows}
          emptyTitle="No payments recorded"
          columns={[
            { key: 'date', label: 'Date', render: (row) => formatDate(row.date) },
            { key: 'reference', label: 'Reference' },
            { key: 'guest', label: 'Guest', render: (row) => (row.guest ? `${row.guest.firstName} ${row.guest.lastName}` : '—') },
            { key: 'hotel', label: 'Hotel', render: (row) => row.hotel?.name },
            { key: 'method', label: 'Method' },
            { key: 'amount', label: 'Amount', render: (row) => formatCurrency(row.amount) },
            { key: 'status', label: 'Status', render: (row) => <Badge tone={statusTone[row.status]}>{row.status}</Badge> },
          ]}
        />
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Record payment"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSubmit((values) => {
                const reservation = reservations.find((item) => item.id === values.reservationId)
                if (!reservation) return
                addPayment({
                  hotelId: reservation.hotelId,
                  reservationId: reservation.id,
                  guestId: reservation.guestId,
                  amount: Number(values.amount),
                  method: values.method,
                  status: 'paid',
                })
                pushToast('Payment recorded')
                reset()
                setOpen(false)
              })}
            >
              Save payment
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Reservation">
            <Select {...register('reservationId', { required: true })}>
              <option value="">Select a stay</option>
              {reservations
                .filter((item) => item.status !== 'cancelled')
                .map((item) => {
                  const guest = guests.find((g) => g.id === item.guestId)
                  return (
                    <option key={item.id} value={item.id}>
                      {item.id.toUpperCase()} · {guest?.lastName} · due {formatCurrency(item.total - item.paid)}
                    </option>
                  )
                })}
            </Select>
          </Field>
          <Field label="Amount"><Input type="number" min="1" {...register('amount', { required: true })} /></Field>
          <Field label="Method">
            <Select {...register('method')}>
              {PAYMENT_METHODS.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </Select>
          </Field>
          {!isAllHotels ? <p className="text-xs text-stone-400">Posting against {currentHotelId}.</p> : null}
        </div>
      </Modal>
    </div>
  )
}
