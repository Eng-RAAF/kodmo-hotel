import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Plus } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Modal } from '../components/ui/Modal'
import { Field, Input, Select, Textarea } from '../components/ui/Field'
import { Table } from '../components/ui/Table'
import { ReservationStatusBadge } from '../components/ui/Badge'
import { RESERVATION_STATUSES, TODAY } from '../lib/constants'
import { useDataStore } from '../store/dataStore'
import { useHotelScope, useScopedList } from '../hooks/useHotelScope'
import { useUiStore } from '../store/uiStore'
import { addDays, formatCurrency, formatDate, nightsBetween } from '../lib/format'

export function ReservationsPage() {
  const reservations = useScopedList(useDataStore((state) => state.reservations))
  const guests = useDataStore((state) => state.guests)
  const rooms = useDataStore((state) => state.rooms)
  const hotels = useDataStore((state) => state.hotels)
  const addReservation = useDataStore((state) => state.addReservation)
  const addGuest = useDataStore((state) => state.addGuest)
  const cancelReservation = useDataStore((state) => state.cancelReservation)
  const { currentHotelId, isAllHotels, availableHotels } = useHotelScope()
  const pushToast = useUiStore((state) => state.pushToast)
  const [status, setStatus] = useState('all')
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const { register, handleSubmit, watch, reset } = useForm({
    defaultValues: {
      hotelId: currentHotelId === 'all' ? 'h1' : currentHotelId,
      guestId: guests[0]?.id,
      newGuest: false,
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      roomId: '',
      checkIn: TODAY,
      checkOut: addDays(TODAY, 2),
      source: 'Direct',
      adults: 1,
      notes: '',
    },
  })

  const hotelId = watch('hotelId')
  const availableRooms = rooms.filter(
    (room) => room.hotelId === hotelId && (room.status === 'available' || room.status === 'reserved'),
  )

  const rows = useMemo(() => {
    return reservations
      .filter((item) => (status === 'all' ? true : item.status === status))
      .filter((item) => {
        const guest = guests.find((g) => g.id === item.guestId)
        const hay = `${guest?.firstName} ${guest?.lastName} ${item.id}`.toLowerCase()
        return hay.includes(query.toLowerCase())
      })
  }, [reservations, status, query, guests])

  return (
    <div>
      <PageHeader
        title="Reservations"
        subtitle="Create, review, and cancel stays. Room assignment stays in local state until an API is connected."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus size={16} /> New reservation
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setStatus('all')}
          className={`chip ${status === 'all' ? 'chip-active' : ''}`}
        >
          All
        </button>
        {RESERVATION_STATUSES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setStatus(item.id)}
            className={`chip ${status === item.id ? 'chip-active' : ''}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <Card className="mb-4 p-4">
        <Input placeholder="Search guest or reservation ID" value={query} onChange={(event) => setQuery(event.target.value)} />
      </Card>

      <Card>
        <Table
          rows={rows}
          emptyTitle="No reservations in this filter"
          columns={[
            {
              key: 'guest',
              label: 'Guest',
              render: (row) => {
                const guest = guests.find((item) => item.id === row.guestId)
                return guest ? `${guest.firstName} ${guest.lastName}` : '—'
              },
            },
            {
              key: 'hotel',
              label: 'Hotel',
              render: (row) => hotels.find((hotel) => hotel.id === row.hotelId)?.name,
            },
            {
              key: 'room',
              label: 'Room',
              render: (row) => rooms.find((room) => room.id === row.roomId)?.number,
            },
            { key: 'dates', label: 'Dates', render: (row) => `${formatDate(row.checkIn)} – ${formatDate(row.checkOut)}` },
            { key: 'nights', label: 'Nights' },
            { key: 'total', label: 'Total', render: (row) => formatCurrency(row.total) },
            { key: 'paid', label: 'Paid', render: (row) => formatCurrency(row.paid) },
            { key: 'status', label: 'Status', render: (row) => <ReservationStatusBadge status={row.status} /> },
            {
              key: 'actions',
              label: '',
              render: (row) =>
                row.status === 'confirmed' ? (
                  <Button size="sm" variant="outline" onClick={() => {
                    cancelReservation(row.id)
                    pushToast('Reservation cancelled')
                  }}>
                    Cancel
                  </Button>
                ) : null,
            },
          ]}
        />
      </Card>

      <Modal
        wide
        open={open}
        onClose={() => setOpen(false)}
        title="New reservation"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSubmit((values) => {
                let guestId = values.guestId
                if (values.newGuest) {
                  const guest = addGuest({
                    firstName: values.firstName,
                    lastName: values.lastName,
                    email: values.email,
                    phone: values.phone,
                  })
                  guestId = guest.id
                }
                const room = rooms.find((item) => item.id === values.roomId)
                addReservation({
                  hotelId: values.hotelId,
                  guestId,
                  roomId: values.roomId,
                  checkIn: values.checkIn,
                  checkOut: values.checkOut,
                  source: values.source,
                  adults: Number(values.adults),
                  notes: values.notes,
                  rate: room?.rate,
                  extras: 0,
                  paid: 0,
                })
                pushToast('Reservation confirmed')
                reset()
                setOpen(false)
              })}
            >
              Create reservation
            </Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Hotel" className="sm:col-span-2">
            <Select {...register('hotelId')} disabled={!isAllHotels && availableHotels.length === 1}>
              {(isAllHotels ? hotels : availableHotels).map((hotel) => (
                <option key={hotel.id} value={hotel.id}>{hotel.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="Existing guest" className="sm:col-span-2">
            <Select {...register('guestId')}>
              {guests.map((guest) => (
                <option key={guest.id} value={guest.id}>
                  {guest.firstName} {guest.lastName}
                </option>
              ))}
            </Select>
          </Field>
          <label className="flex items-center gap-2 text-sm text-stone-600 sm:col-span-2">
            <input type="checkbox" {...register('newGuest')} /> Create a new guest instead
          </label>
          {watch('newGuest') ? (
            <>
              <Field label="First name"><Input {...register('firstName')} /></Field>
              <Field label="Last name"><Input {...register('lastName')} /></Field>
              <Field label="Email"><Input type="email" {...register('email')} /></Field>
              <Field label="Phone"><Input {...register('phone')} /></Field>
            </>
          ) : null}
          <Field label="Room">
            <Select {...register('roomId', { required: true })}>
              <option value="">Select a room</option>
              {availableRooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.number} · {room.type} · {formatCurrency(room.rate)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Source">
            <Select {...register('source')}>
              {['Direct', 'Website', 'Booking.com', 'Expedia', 'Corporate', 'Walk-in'].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </Select>
          </Field>
          <Field label="Check-in"><Input type="date" {...register('checkIn')} /></Field>
          <Field label="Check-out"><Input type="date" {...register('checkOut')} /></Field>
          <Field label="Adults"><Input type="number" min="1" {...register('adults')} /></Field>
          <Field label="Nights">
            <Input readOnly value={nightsBetween(watch('checkIn') || TODAY, watch('checkOut') || addDays(TODAY, 1))} />
          </Field>
          <Field label="Notes" className="sm:col-span-2">
            <Textarea {...register('notes')} />
          </Field>
        </div>
      </Modal>
    </div>
  )
}
