import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, MapPin, Plus, Star } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Modal } from '../components/ui/Modal'
import { Field, Input, Select } from '../components/ui/Field'
import { Badge } from '../components/ui/Badge'
import { useAuthStore } from '../store/authStore'
import { useDataStore } from '../store/dataStore'
import { useHotelStore } from '../store/hotelStore'
import { useUiStore } from '../store/uiStore'
import { isSuperAdmin } from '../lib/constants'
import { hotelAppPath } from '../lib/paths'
import { formatCurrency, percent } from '../lib/format'

function emptyHotelForm() {
  return {
    name: '',
    city: '',
    country: 'Somalia',
    address: '',
    stars: '4',
    phone: '',
    email: '',
    manager: '',
    managerEmail: '',
    managerPassword: '',
  }
}

function occupancyCopy(occ) {
  if (occ >= 85) return 'Excellent'
  if (occ >= 70) return 'Very good'
  if (occ >= 50) return 'Good'
  return 'Fair'
}

function statusTone(status) {
  if (status === 'active') return 'emerald'
  if (status === 'pending') return 'amber'
  return 'slate'
}

export function HotelsPage() {
  const user = useAuthStore((state) => state.user)
  const hotels = useDataStore((state) => state.hotels)
  const rooms = useDataStore((state) => state.rooms)
  const reservations = useDataStore((state) => state.reservations)
  const addHotel = useDataStore((state) => state.addHotel)
  const verifyHotel = useDataStore((state) => state.verifyHotel)
  const setHotelStatus = useDataStore((state) => state.setHotelStatus)
  const setHotel = useHotelStore((state) => state.setHotel)
  const pushToast = useUiStore((state) => state.pushToast)
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [form, setForm] = useState(emptyHotelForm())
  const canManage = isSuperAdmin(user)

  const cards = useMemo(
    () =>
      hotels.map((hotel) => {
        const hotelRooms = rooms.filter((room) => room.hotelId === hotel.id)
        const occupied = hotelRooms.filter((room) => room.status === 'occupied').length
        const occ = percent(occupied, hotelRooms.filter((room) => room.status !== 'out_of_order').length)
        const revenue = reservations.filter((item) => item.hotelId === hotel.id).reduce((sum, item) => sum + item.paid, 0)
        return { ...hotel, roomCount: hotelRooms.length, occ, revenue }
      }),
    [hotels, rooms, reservations],
  )

  const registerHotel = async () => {
    if (!form.name.trim() || !form.city.trim()) {
      setFormError('Hotel name and city are required.')
      return
    }
    if (form.managerEmail && (!form.managerPassword || form.managerPassword.length < 6)) {
      setFormError('Hotel manager password must be at least 6 characters.')
      return
    }
    setSaving(true)
    setFormError('')
    try {
      const payload = {
        name: form.name,
        city: form.city,
        country: form.country,
        address: form.address,
        stars: Number(form.stars),
        phone: form.phone,
        email: form.email,
        manager: form.manager,
      }
      if (form.managerEmail.trim()) {
        payload.managerName = form.manager || form.name
        payload.managerEmail = form.managerEmail
        payload.managerPassword = form.managerPassword
      }
      const hotel = await addHotel(payload)
      pushToast(`${hotel.name} registered and waiting for verification`)
      setForm(emptyHotelForm())
      setOpen(false)
    } catch (error) {
      setFormError(error.message || 'Could not register hotel')
      pushToast(error.message || 'Could not register hotel', 'info')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Hotels"
        subtitle="Super Admin registers hotels, verifies them, then opens each hotel’s own system."
        actions={
          canManage ? (
            <Button type="button" onClick={() => { setForm(emptyHotelForm()); setFormError(''); setOpen(true) }}>
              <Plus size={16} /> Register hotel
            </Button>
          ) : null
        }
      />
      <div className="space-y-3">
        {cards.map((hotel) => (
          <Card key={hotel.id} className="overflow-hidden hover:shadow-md">
            <div className="flex flex-col sm:flex-row">
              <div className={`relative h-40 shrink-0 bg-gradient-to-br ${hotel.accent} sm:h-auto sm:w-[200px]`}>
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/50 to-transparent" />
              </div>
              <div className="flex flex-1 flex-col gap-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-extrabold text-[#006ce4]">{hotel.name}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-sm text-[#006ce4]">
                      <MapPin size={12} /> {hotel.city}, {hotel.country}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-gold-600">
                      <Star size={12} fill="currentColor" /> {hotel.stars} star
                    </p>
                    <p className="mt-2 text-xs text-stone-500">GM · {hotel.manager || 'Unassigned'}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="hidden text-right sm:block">
                      <p className="text-xs font-bold text-[#1a1a1a]">{occupancyCopy(hotel.occ)}</p>
                      <p className="text-xs text-stone-500">{hotel.roomCount} rooms</p>
                    </div>
                    <span className="score-box">{(hotel.occ / 10).toFixed(1)}</span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <Badge tone={statusTone(hotel.status)}>{hotel.status}</Badge>
                    <p className="mt-2 text-sm font-extrabold text-[#1a1a1a]">{formatCurrency(hotel.revenue)}</p>
                    <p className="text-xs text-stone-500">Collected</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {canManage && hotel.status !== 'active' ? (
                      <Button
                        type="button"
                        size="sm"
                        onClick={async () => {
                          try {
                            await verifyHotel(hotel.id)
                            pushToast(`${hotel.name} verified`)
                          } catch (error) {
                            pushToast(error.message || 'Could not verify hotel', 'info')
                          }
                        }}
                      >
                        <CheckCircle2 size={14} /> Verify
                      </Button>
                    ) : null}
                    {canManage && hotel.status === 'active' ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          try {
                            await setHotelStatus(hotel.id, 'inactive')
                            pushToast(`${hotel.name} suspended`)
                          } catch (error) {
                            pushToast(error.message || 'Could not update hotel', 'info')
                          }
                        }}
                      >
                        Suspend
                      </Button>
                    ) : null}
                    <Button type="button" variant="outline" size="sm" onClick={() => {
                      setHotel(hotel.id)
                      navigate(hotelAppPath(hotel.id, 'dashboard'))
                    }}>
                      Open hotel system
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        open={open}
        onClose={() => !saving && setOpen(false)}
        title="Register hotel"
        subtitle="Creates a pending hotel. Verify it on the hotel card, then assign a Hotel Manager Admin."
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
            <Button type="button" onClick={registerHotel} disabled={saving}>{saving ? 'Registering…' : 'Register hotel'}</Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {formError ? (
            <p className="sm:col-span-2 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{formError}</p>
          ) : null}
          <Field label="Hotel name" className="sm:col-span-2">
            <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          </Field>
          <Field label="City">
            <Input value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} />
          </Field>
          <Field label="Stars">
            <Select value={form.stars} onChange={(event) => setForm({ ...form, stars: event.target.value })}>
              {[3, 4, 5].map((star) => (
                <option key={star} value={star}>{star} star</option>
              ))}
            </Select>
          </Field>
          <Field label="Address" className="sm:col-span-2">
            <Input value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} />
          </Field>
          <Field label="Phone">
            <Input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
          </Field>
          <Field label="Email">
            <Input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          </Field>
          <Field label="Manager name" className="sm:col-span-2">
            <Input value={form.manager} onChange={(event) => setForm({ ...form, manager: event.target.value })} placeholder="Hotel general manager" />
          </Field>
          <p className="sm:col-span-2 text-xs font-semibold tracking-[0.14em] text-stone-500 uppercase">Optional hotel manager login</p>
          <Field label="Manager email">
            <Input type="email" value={form.managerEmail} onChange={(event) => setForm({ ...form, managerEmail: event.target.value })} placeholder="manager@hotel.com" />
          </Field>
          <Field label="Manager password">
            <Input type="password" value={form.managerPassword} onChange={(event) => setForm({ ...form, managerPassword: event.target.value })} placeholder="At least 6 characters" />
          </Field>
        </div>
      </Modal>
    </div>
  )
}
