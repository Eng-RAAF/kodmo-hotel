import { useMemo, useState } from 'react'
import { LayoutGrid, Plus } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Modal } from '../components/ui/Modal'
import { Field, Input, Select } from '../components/ui/Field'
import { RoomStatusBadge } from '../components/ui/Badge'
import { Table } from '../components/ui/Table'
import { ROOM_STATUSES } from '../lib/constants'
import { useDataStore } from '../store/dataStore'
import { useHotelScope, useScopedList } from '../hooks/useHotelScope'
import { useUiStore } from '../store/uiStore'
import { formatCurrency } from '../lib/format'

const STATUS_BAR = {
  available: 'bg-emerald-500',
  occupied: 'bg-sky-500',
  reserved: 'bg-indigo-500',
  dirty: 'bg-amber-500',
  cleaning: 'bg-cyan-500',
  out_of_order: 'bg-rose-500',
}

function emptyRoomForm(hotelId) {
  return { hotelId: hotelId === 'all' ? '' : hotelId, typeName: '', number: '', floor: '1', rate: '', capacity: '2', notes: '' }
}

export function RoomsPage() {
  const rooms = useScopedList(useDataStore((state) => state.rooms))
  const hotels = useDataStore((state) => state.hotels)
  const roomTypes = useDataStore((state) => state.roomTypes)
  const setRoomStatus = useDataStore((state) => state.setRoomStatus)
  const addRoom = useDataStore((state) => state.addRoom)
  const { isAllHotels, currentHotelId, availableHotels } = useHotelScope()
  const pushToast = useUiStore((state) => state.pushToast)
  const [status, setStatus] = useState('all')
  const [type, setType] = useState('all')
  const [query, setQuery] = useState('')
  const [view, setView] = useState('grid')
  const [selected, setSelected] = useState(null)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [form, setForm] = useState(emptyRoomForm(currentHotelId))

  const types = useMemo(() => [...new Set(rooms.map((room) => room.type))], [rooms])
  const hotelTypes = roomTypes.filter((item) => item.hotelId === (form.hotelId || currentHotelId))
  const filtered = rooms.filter((room) => {
    const matchesStatus = status === 'all' || room.status === status
    const matchesType = type === 'all' || room.type === type
    const matchesQuery = `${room.number} ${room.type}`.toLowerCase().includes(query.toLowerCase())
    return matchesStatus && matchesType && matchesQuery
  })

  const counts = ROOM_STATUSES.map((item) => ({
    ...item,
    count: rooms.filter((room) => room.status === item.id).length,
  }))

  const applyType = (typeName, hotelId) => {
    const match = roomTypes.find((item) => item.hotelId === hotelId && item.name === typeName)
    setForm((current) => ({
      ...current,
      hotelId,
      typeName,
      rate: match ? String(match.rate) : current.rate,
      capacity: match ? String(match.capacity) : current.capacity,
    }))
  }

  const openAdd = () => {
    setForm(emptyRoomForm(currentHotelId === 'all' ? availableHotels[0]?.id || '' : currentHotelId))
    setFormError('')
    setSaving(false)
    setOpen(true)
  }

  const saveRoom = async () => {
    const hotelId = form.hotelId || (currentHotelId === 'all' ? '' : currentHotelId)
    const number = String(form.number || '').trim()
    if (!hotelId) {
      setFormError('Select a hotel before adding a room.')
      return
    }
    if (!number) {
      setFormError('Room number is required.')
      return
    }
    setSaving(true)
    setFormError('')
    try {
      const match = roomTypes.find((item) => item.hotelId === hotelId && item.name === form.typeName)
      await addRoom({
        hotelId,
        number,
        floor: Number(form.floor || 1),
        type: (form.typeName || 'Standard').trim() || 'Standard',
        rate: Number(form.rate || match?.rate || 0),
        capacity: Number(form.capacity || match?.capacity || 2),
        amenities: Array.isArray(match?.amenities) ? match.amenities : undefined,
      })
      pushToast(`Room ${number} added`)
      setStatus('all')
      setType('all')
      setQuery('')
      setOpen(false)
      setForm(emptyRoomForm(currentHotelId))
    } catch (error) {
      setFormError(error.message || 'Could not add room')
      pushToast(error.message || 'Could not add room', 'info')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Rooms"
        subtitle="Add inventory, update housekeeping status, and hold rooms out of order."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={openAdd}>
              <Plus size={16} /> Add room
            </Button>
            <div className="flex rounded-xl border border-stone-line bg-white/90 p-1 shadow-sm">
              <button type="button" onClick={() => setView('grid')} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${view === 'grid' ? 'bg-navy-900 text-white shadow-sm' : 'text-stone-500 hover:text-navy-900'}`}>
                Grid
              </button>
              <button type="button" onClick={() => setView('list')} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${view === 'list' ? 'bg-navy-900 text-white shadow-sm' : 'text-stone-500 hover:text-navy-900'}`}>
                List
              </button>
            </div>
          </div>
        }
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {counts.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setStatus(status === item.id ? 'all' : item.id)}
            className={`chip ${status === item.id ? 'chip-active' : ''}`}
          >
            {item.label} · {item.count}
          </button>
        ))}
      </div>

      <Card className="mb-5 flex flex-col gap-3 p-4 sm:flex-row">
        <Input className="flex-1" placeholder="Search room number or type" value={query} onChange={(event) => setQuery(event.target.value)} />
        <Select value={type} onChange={(event) => setType(event.target.value)} className="sm:w-56">
          <option value="all">All types</option>
          {types.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </Select>
      </Card>

      {view === 'grid' ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {filtered.map((room) => (
            <button
              key={room.id}
              type="button"
              onClick={() => setSelected(room)}
              className="surface-card group relative overflow-hidden rounded-lg p-4 text-left hover:shadow-md"
            >
              <span className={`absolute inset-y-0 left-0 w-1 ${STATUS_BAR[room.status] || 'bg-stone-300'}`} />
              <div className="flex items-start justify-between gap-2 pl-1">
                <div>
                  <p className="font-display text-2xl text-navy-900">{room.number}</p>
                  <p className="text-xs text-stone-500">{room.type}</p>
                </div>
                <RoomStatusBadge status={room.status} />
              </div>
              <p className="mt-3 text-sm font-medium">{formatCurrency(room.rate)} / night</p>
              <p className="mt-1 text-xs text-stone-500">
                Floor {room.floor} · {room.capacity} guests
                {isAllHotels ? ` · ${hotels.find((hotel) => hotel.id === room.hotelId)?.name}` : ''}
              </p>
            </button>
          ))}
        </div>
      ) : (
        <Card>
          <Table
            rows={filtered}
            emptyTitle="No rooms match these filters"
            columns={[
              { key: 'number', label: 'Room', render: (row) => <span className="font-semibold">{row.number}</span> },
              { key: 'type', label: 'Type' },
              { key: 'floor', label: 'Floor' },
              { key: 'rate', label: 'Rate', render: (row) => formatCurrency(row.rate) },
              { key: 'status', label: 'Status', render: (row) => <RoomStatusBadge status={row.status} /> },
              {
                key: 'hotel',
                label: 'Hotel',
                render: (row) => hotels.find((hotel) => hotel.id === row.hotelId)?.name,
              },
            ]}
          />
        </Card>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add room"
        subtitle={isAllHotels ? 'Choose a hotel, then set the room details.' : 'Adds this room to your hotel inventory.'}
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
            <Button type="button" onClick={saveRoom} disabled={saving}>{saving ? 'Saving…' : 'Save room'}</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {formError ? (
            <p className="sm:col-span-2 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{formError}</p>
          ) : null}
          {isAllHotels ? (
            <Field label="Hotel" className="sm:col-span-2">
              <Select value={form.hotelId} onChange={(event) => applyType(form.typeName, event.target.value)}>
                <option value="">Select hotel</option>
                {availableHotels.map((hotel) => (
                  <option key={hotel.id} value={hotel.id}>{hotel.name}</option>
                ))}
              </Select>
            </Field>
          ) : null}
          <Field label="Room number">
            <Input value={form.number} onChange={(event) => setForm({ ...form, number: event.target.value })} placeholder="509" />
          </Field>
          <Field label="Floor">
            <Input type="number" min="1" value={form.floor} onChange={(event) => setForm({ ...form, floor: event.target.value })} />
          </Field>
          <Field label="Room type" className="sm:col-span-2">
            {hotelTypes.length ? (
              <Select value={form.typeName} onChange={(event) => applyType(event.target.value, form.hotelId || currentHotelId)}>
                <option value="">Select type</option>
                {hotelTypes.map((item) => (
                  <option key={item.id} value={item.name}>{item.name} · {formatCurrency(item.rate)}</option>
                ))}
              </Select>
            ) : (
              <Input value={form.typeName} onChange={(event) => setForm({ ...form, typeName: event.target.value })} placeholder="Deluxe King" />
            )}
          </Field>
          <Field label="Rate / night">
            <Input type="number" min="0" value={form.rate} onChange={(event) => setForm({ ...form, rate: event.target.value })} />
          </Field>
          <Field label="Capacity">
            <Input type="number" min="1" value={form.capacity} onChange={(event) => setForm({ ...form, capacity: event.target.value })} />
          </Field>
        </div>
      </Modal>

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected ? `Room ${selected.number}` : ''}
        subtitle={selected ? `${selected.type} · ${formatCurrency(selected.rate)} / night` : ''}
        footer={
          <Button variant="outline" onClick={() => setSelected(null)}>
            Close
          </Button>
        }
      >
        {selected ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {(selected.amenities || []).map((item) => (
                <span key={item} className="rounded-full bg-ivory-100 px-2.5 py-1 text-xs text-stone-600 ring-1 ring-stone-line/80">
                  {item}
                </span>
              ))}
            </div>
            {selected.notes ? <p className="text-sm text-stone-600">{selected.notes}</p> : null}
            <p className="text-xs font-medium text-stone-500">Update status</p>
            <div className="flex flex-wrap gap-2">
              {ROOM_STATUSES.map((item) => (
                <Button
                  key={item.id}
                  size="sm"
                  variant={selected.status === item.id ? 'primary' : 'outline'}
                  onClick={() => {
                    setRoomStatus(selected.id, item.id)
                    setSelected({ ...selected, status: item.id })
                    pushToast(`Room ${selected.number} marked ${item.label.toLowerCase()}`)
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
        ) : null}
      </Modal>
      {filtered.length === 0 ? (
        <p className="mt-8 flex items-center justify-center gap-2 text-sm text-stone-500">
          <LayoutGrid size={16} /> No rooms in this view.
        </p>
      ) : null}
    </div>
  )
}
