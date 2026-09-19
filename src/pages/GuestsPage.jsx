import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, Star } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Modal } from '../components/ui/Modal'
import { Field, Input, Select, Textarea } from '../components/ui/Field'
import { Table } from '../components/ui/Table'
import { Badge, ReservationStatusBadge } from '../components/ui/Badge'
import { useDataStore } from '../store/dataStore'
import { useUiStore } from '../store/uiStore'
import { useHotelScope, useScopedList } from '../hooks/useHotelScope'
import { initials, formatDate, formatCurrency } from '../lib/format'

export function GuestsPage() {
  const allGuests = useDataStore((state) => state.guests)
  const reservations = useScopedList(useDataStore((state) => state.reservations))
  const hotels = useDataStore((state) => state.hotels)
  const addGuest = useDataStore((state) => state.addGuest)
  const updateGuest = useDataStore((state) => state.updateGuest)
  const pushToast = useUiStore((state) => state.pushToast)
  const { isAllHotels } = useHotelScope()
  const guests = useMemo(() => {
    if (isAllHotels) return allGuests
    const guestIds = new Set(reservations.map((item) => item.guestId))
    return allGuests.filter((guest) => guestIds.has(guest.id))
  }, [allGuests, reservations, isAllHotels])
  const [query, setQuery] = useState('')
  const [vipOnly, setVipOnly] = useState(false)
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const { register, handleSubmit, reset } = useForm({
    defaultValues: { firstName: '', lastName: '', email: '', phone: '', nationality: 'Somalia', vip: false, notes: '' },
  })

  const rows = useMemo(
    () =>
      guests.filter((guest) => {
        const hay = `${guest.firstName} ${guest.lastName} ${guest.email} ${guest.phone}`.toLowerCase()
        return hay.includes(query.toLowerCase()) && (!vipOnly || guest.vip)
      }),
    [guests, query, vipOnly],
  )

  const stays = selected
    ? reservations.filter((item) => item.guestId === selected.id)
    : []

  return (
    <div>
      <PageHeader
        title="Guests"
        subtitle="Guest profiles, VIP flags, and stay history across the group."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus size={16} /> Add guest
          </Button>
        }
      />
      <Card className="mb-4 flex flex-col gap-3 p-4 sm:flex-row">
        <Input placeholder="Search name, email, or phone" value={query} onChange={(event) => setQuery(event.target.value)} />
        <Button variant={vipOnly ? 'gold' : 'outline'} onClick={() => setVipOnly((value) => !value)}>
          <Star size={14} /> VIP only
        </Button>
      </Card>
      <Card>
        <Table
          rows={rows}
          emptyTitle="No guests found"
          columns={[
            {
              key: 'name',
              label: 'Guest',
              render: (row) => (
                <button type="button" className="flex items-center gap-3 text-left" onClick={() => setSelected(row)}>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-900 text-xs font-semibold text-gold-300">
                    {initials(`${row.firstName} ${row.lastName}`)}
                  </span>
                  <span>
                    <span className="block font-medium">
                      {row.firstName} {row.lastName}
                    </span>
                    <span className="text-xs text-stone-500">{row.email}</span>
                  </span>
                </button>
              ),
            },
            { key: 'phone', label: 'Phone' },
            { key: 'nationality', label: 'Nationality' },
            { key: 'vip', label: 'VIP', render: (row) => (row.vip ? <Badge tone="gold">VIP</Badge> : <span className="text-stone-400">—</span>) },
            {
              key: 'stays',
              label: 'Stays',
              render: (row) => reservations.filter((item) => item.guestId === row.id).length,
            },
          ]}
        />
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add guest"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSubmit((values) => {
                addGuest({ ...values, vip: values.vip === true || values.vip === 'true' })
                pushToast('Guest profile created')
                reset()
                setOpen(false)
              })}
            >
              Save guest
            </Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First name"><Input {...register('firstName', { required: true })} /></Field>
          <Field label="Last name"><Input {...register('lastName', { required: true })} /></Field>
          <Field label="Email"><Input type="email" {...register('email')} /></Field>
          <Field label="Phone"><Input {...register('phone')} /></Field>
          <Field label="Nationality"><Input {...register('nationality')} /></Field>
          <Field label="VIP">
            <Select {...register('vip')}>
              <option value="false">No</option>
              <option value="true">Yes</option>
            </Select>
          </Field>
          <Field label="Notes" className="sm:col-span-2"><Textarea {...register('notes')} /></Field>
        </div>
      </Modal>

      <Modal
        wide
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected ? `${selected.firstName} ${selected.lastName}` : ''}
        subtitle={selected?.email}
        footer={
          selected ? (
            <Button
              variant="outline"
              onClick={() => {
                updateGuest(selected.id, { vip: !selected.vip })
                setSelected({ ...selected, vip: !selected.vip })
                pushToast(selected.vip ? 'VIP flag removed' : 'Marked as VIP')
              }}
            >
              {selected.vip ? 'Remove VIP' : 'Mark VIP'}
            </Button>
          ) : null
        }
      >
        {selected ? (
          <div className="space-y-4">
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <p><span className="text-stone-500">Phone:</span> {selected.phone}</p>
              <p><span className="text-stone-500">Nationality:</span> {selected.nationality}</p>
              <p><span className="text-stone-500">ID:</span> {selected.idType} {selected.idNumber}</p>
              <p><span className="text-stone-500">Notes:</span> {selected.notes || '—'}</p>
            </div>
            <p className="text-xs font-semibold tracking-wide text-stone-500 uppercase">Stay history</p>
            <Table
              rows={stays}
              emptyTitle="No stays yet"
              columns={[
                { key: 'hotel', label: 'Hotel', render: (row) => hotels.find((hotel) => hotel.id === row.hotelId)?.name },
                { key: 'dates', label: 'Dates', render: (row) => `${formatDate(row.checkIn)} – ${formatDate(row.checkOut)}` },
                { key: 'status', label: 'Status', render: (row) => <ReservationStatusBadge status={row.status} /> },
                { key: 'total', label: 'Total', render: (row) => formatCurrency(row.total) },
              ]}
            />
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
