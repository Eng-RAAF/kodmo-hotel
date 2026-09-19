import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { PageHeader } from '../components/ui/PageHeader'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Modal } from '../components/ui/Modal'
import { Field, Input, Select } from '../components/ui/Field'
import { Table } from '../components/ui/Table'
import { Badge } from '../components/ui/Badge'
import { useDataStore } from '../store/dataStore'
import { useHotelScope, useScopedList } from '../hooks/useHotelScope'
import { useUiStore } from '../store/uiStore'
import { TODAY } from '../lib/constants'
import { formatCurrency, formatDate } from '../lib/format'

const TABS = [
  { id: 'arrivals', label: 'Arrivals' },
  { id: 'inhouse', label: 'In house' },
  { id: 'departures', label: 'Departures' },
]

function emptyWalkIn(currentHotelId, availableHotels) {
  return {
    hotelId: currentHotelId === 'all' ? availableHotels[0]?.id || '' : currentHotelId,
    firstName: '',
    lastName: '',
    idType: 'National ID',
    idNumber: '',
    phone: '',
    roomId: '',
    nights: 1,
  }
}

export function FrontDeskPage() {
  const reservations = useScopedList(useDataStore((state) => state.reservations))
  const guests = useDataStore((state) => state.guests)
  const rooms = useDataStore((state) => state.rooms)
  const hotels = useDataStore((state) => state.hotels)
  const checkIn = useDataStore((state) => state.checkIn)
  const checkOut = useDataStore((state) => state.checkOut)
  const walkInStay = useDataStore((state) => state.walkInStay)
  const { currentHotelId, isAllHotels, availableHotels, currentHotel } = useHotelScope()
  const pushToast = useUiStore((state) => state.pushToast)
  const [tab, setTab] = useState('arrivals')
  const [walkIn, setWalkIn] = useState(false)
  const [checkout, setCheckout] = useState(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const { register, handleSubmit, reset, watch } = useForm({
    defaultValues: emptyWalkIn(currentHotelId, availableHotels),
  })

  const hotelId = watch('hotelId')
  const selectedHotelId = isAllHotels ? hotelId : currentHotelId
  const freeRooms = rooms.filter((room) => room.hotelId === selectedHotelId && room.status === 'available')

  const lists = useMemo(() => {
    const withGuest = (item) => ({
      ...item,
      guest: guests.find((guest) => guest.id === item.guestId),
      room: rooms.find((room) => room.id === item.roomId),
      hotel: hotels.find((hotel) => hotel.id === item.hotelId),
      balance: Math.max(0, item.total - item.paid),
    })
    return {
      arrivals: reservations.filter((item) => item.checkIn === TODAY && item.status === 'confirmed').map(withGuest),
      inhouse: reservations.filter((item) => item.status === 'checked_in').map(withGuest),
      departures: reservations.filter((item) => item.checkOut === TODAY && item.status !== 'cancelled').map(withGuest),
    }
  }, [reservations, guests, rooms, hotels])

  const rows = lists[tab]

  const openWalkIn = () => {
    reset(emptyWalkIn(currentHotelId, availableHotels))
    setFormError('')
    setWalkIn(true)
  }

  const submitWalkIn = handleSubmit(async (values) => {
    if (!values.firstName?.trim() || !values.lastName?.trim()) {
      setFormError('First and last name are required.')
      return
    }
    if (!values.roomId) {
      setFormError('Select an available room.')
      return
    }
    if (!values.idNumber?.trim()) {
      setFormError('Guest ID is required.')
      return
    }
    setSaving(true)
    setFormError('')
    try {
      const stay = await walkInStay({
        hotelId: isAllHotels ? values.hotelId : currentHotelId,
        firstName: values.firstName,
        lastName: values.lastName,
        idType: values.idType,
        idNumber: values.idNumber,
        phone: values.phone,
        roomId: values.roomId,
        nights: Number(values.nights || 1),
      })
      pushToast(`${stay.guest.firstName} checked in`)
      reset(emptyWalkIn(currentHotelId, availableHotels))
      setWalkIn(false)
      setTab('inhouse')
    } catch (error) {
      setFormError(error.message || 'Could not complete walk-in')
      pushToast(error.message || 'Could not complete walk-in', 'info')
    } finally {
      setSaving(false)
    }
  })

  const completeCheckout = async () => {
    if (!checkout) return
    setSaving(true)
    try {
      await checkOut(checkout.id, { collectBalance: checkout.balance > 0, method: 'Card' })
      pushToast('Guest checked out. Room marked dirty.')
      setCheckout(null)
    } catch (error) {
      pushToast(error.message || 'Could not complete check-out', 'info')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Front desk"
        subtitle={currentHotel ? `${currentHotel.name} · arrivals, in-house, and departures for today.` : 'Today’s operational board across hotels.'}
        actions={
          <Button type="button" onClick={openWalkIn}>Walk-in check-in</Button>
        }
      />

      <div className="mb-5 grid gap-3 grid-cols-1 sm:grid-cols-3">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`rounded-md border px-4 py-4 text-left ${tab === item.id ? 'border-navy-900 bg-navy-900 text-white' : 'border-stone-line bg-white hover:border-[#006ce4]'}`}
          >
            <p className="text-[11px] font-semibold tracking-[0.16em] uppercase opacity-70">{item.label}</p>
            <p className="mt-1 font-display text-3xl leading-none">{lists[item.id].length}</p>
          </button>
        ))}
      </div>

      <Card>
        <Table
          rows={rows}
          emptyTitle={`No ${tab.replace('inhouse', 'in-house')} guests right now`}
          columns={[
            {
              key: 'guest',
              label: 'Guest',
              render: (row) => (
                <div>
                  <p className="font-medium">{row.guest ? `${row.guest.firstName} ${row.guest.lastName}` : '—'}</p>
                  {row.guest?.vip ? <Badge tone="gold">VIP</Badge> : null}
                </div>
              ),
            },
            { key: 'hotel', label: 'Hotel', render: (row) => row.hotel?.name },
            { key: 'room', label: 'Room', render: (row) => row.room?.number },
            { key: 'dates', label: 'Stay', render: (row) => `${formatDate(row.checkIn)} – ${formatDate(row.checkOut)}` },
            { key: 'balance', label: 'Balance', render: (row) => formatCurrency(row.balance) },
            {
              key: 'action',
              label: '',
              render: (row) => (
                <div className="flex justify-end gap-2">
                  {row.status === 'confirmed' ? (
                    <Button
                      type="button"
                      size="sm"
                      onClick={async () => {
                        try {
                          await checkIn(row.id)
                          pushToast(`${row.guest?.firstName} checked in`)
                        } catch (error) {
                          pushToast(error.message || 'Could not check in', 'info')
                        }
                      }}
                    >
                      Check in
                    </Button>
                  ) : null}
                  {row.status === 'checked_in' && (tab === 'departures' || tab === 'inhouse') ? (
                    <Button type="button" size="sm" variant="outline" onClick={() => setCheckout(row)}>
                      Check out
                    </Button>
                  ) : null}
                </div>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        open={walkIn}
        onClose={() => !saving && setWalkIn(false)}
        title="Walk-in check-in"
        subtitle="Creates a guest, a stay, and checks them in immediately."
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setWalkIn(false)} disabled={saving}>Cancel</Button>
            <Button type="button" onClick={submitWalkIn} disabled={saving}>
              {saving ? 'Checking in…' : 'Check in now'}
            </Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {formError ? (
            <p className="sm:col-span-2 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{formError}</p>
          ) : null}
          {isAllHotels ? (
            <Field label="Hotel" className="sm:col-span-2">
              <Select {...register('hotelId')}>
                {availableHotels.map((hotel) => (
                  <option key={hotel.id} value={hotel.id}>{hotel.name}</option>
                ))}
              </Select>
            </Field>
          ) : null}
          <Field label="First name"><Input {...register('firstName', { required: true })} /></Field>
          <Field label="Last name"><Input {...register('lastName', { required: true })} /></Field>
          <Field label="ID type">
            <Select {...register('idType', { required: true })}>
              <option value="National ID">National ID</option>
              <option value="Passport">Passport</option>
            </Select>
          </Field>
          <Field label="ID">
            <Input {...register('idNumber', { required: true })} placeholder="ID number" />
          </Field>
          <Field label="Phone"><Input {...register('phone')} /></Field>
          <Field label="Room">
            <Select {...register('roomId', { required: true })}>
              <option value="">Select available room</option>
              {freeRooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.number} · {room.type}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Nights"><Input type="number" min="1" {...register('nights')} /></Field>
          {freeRooms.length === 0 ? (
            <p className="sm:col-span-2 text-sm text-stone-500">No available rooms at this hotel right now.</p>
          ) : null}
        </div>
      </Modal>

      <Modal
        open={Boolean(checkout)}
        onClose={() => !saving && setCheckout(null)}
        title={checkout ? `Check out ${checkout.guest?.firstName || ''}` : ''}
        subtitle={checkout ? `Room ${checkout.room?.number} · folio ${formatCurrency(checkout.total)}` : ''}
        footer={
          checkout ? (
            <>
              <Button type="button" variant="outline" onClick={() => setCheckout(null)} disabled={saving}>Cancel</Button>
              <Button type="button" onClick={completeCheckout} disabled={saving}>
                {saving
                  ? 'Checking out…'
                  : checkout.balance > 0
                    ? `Collect ${formatCurrency(checkout.balance)} & check out`
                    : 'Complete check-out'}
              </Button>
            </>
          ) : null
        }
      >
        {checkout ? (
          <div className="space-y-2 text-sm">
            <p className="flex justify-between"><span>Room charges</span><span>{formatCurrency(checkout.total)}</span></p>
            <p className="flex justify-between"><span>Paid</span><span>{formatCurrency(checkout.paid)}</span></p>
            <p className="flex justify-between font-semibold"><span>Balance due</span><span>{formatCurrency(checkout.balance)}</span></p>
            <p className="pt-2 text-xs text-stone-500">Housekeeping will receive a checkout-clean task automatically.</p>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
