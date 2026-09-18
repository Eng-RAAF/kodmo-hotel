import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { useDataStore } from '../../store/dataStore'
import { useUiStore } from '../../store/uiStore'
import { useHotelScope } from '../../hooks/useHotelScope'
import { Input } from '../ui/Field'

export function SearchModal() {
  const open = useUiStore((state) => state.searchOpen)
  const setSearchOpen = useUiStore((state) => state.setSearchOpen)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const guests = useDataStore((state) => state.guests)
  const rooms = useDataStore((state) => state.rooms)
  const reservations = useDataStore((state) => state.reservations)
  const hotels = useDataStore((state) => state.hotels)
  const { currentHotelId, isAllHotels } = useHotelScope()

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === '/' && event.target.tagName !== 'INPUT' && event.target.tagName !== 'TEXTAREA') {
        event.preventDefault()
        setSearchOpen(true)
      }
      if (event.key === 'Escape') setSearchOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setSearchOpen])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (q.length < 1) return []
    const hotelOk = (hotelId) => isAllHotels || hotelId === currentHotelId
    const guestHits = guests
      .filter((guest) => `${guest.firstName} ${guest.lastName} ${guest.email} ${guest.phone}`.toLowerCase().includes(q))
      .slice(0, 5)
      .map((guest) => ({
        id: guest.id,
        title: `${guest.firstName} ${guest.lastName}`,
        subtitle: guest.email,
        to: '/guests',
      }))
    const roomHits = rooms
      .filter((room) => hotelOk(room.hotelId) && `${room.number} ${room.type}`.toLowerCase().includes(q))
      .slice(0, 5)
      .map((room) => ({
        id: room.id,
        title: `Room ${room.number}`,
        subtitle: `${hotels.find((h) => h.id === room.hotelId)?.name} · ${room.type}`,
        to: '/rooms',
      }))
    const stayHits = reservations
      .filter((item) => hotelOk(item.hotelId) && item.id.toLowerCase().includes(q))
      .slice(0, 4)
      .map((item) => ({
        id: item.id,
        title: item.id.toUpperCase(),
        subtitle: `${item.status.replaceAll('_', ' ')} · ${item.checkIn}`,
        to: '/reservations',
      }))
    return [...guestHits, ...roomHits, ...stayHits]
  }, [query, guests, rooms, reservations, hotels, currentHotelId, isAllHotels])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center px-3 pb-3 sm:items-start sm:px-4 sm:pt-[12vh] sm:pb-0">
      <button type="button" className="absolute inset-0 bg-navy-950/50 backdrop-blur-md" onClick={() => setSearchOpen(false)} aria-label="Close search" />
      <div className="relative w-full max-w-xl overflow-hidden rounded-lg border border-stone-line bg-white shadow-2xl">
        <div className="gold-rule" />
        <div className="flex items-center gap-2 border-b border-stone-line px-4">
          <Search size={16} className="text-[#006ce4]" />
          <Input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search guests, rooms, reservation IDs"
            className="border-0 bg-transparent py-4 shadow-none focus:ring-0"
          />
          <button type="button" onClick={() => setSearchOpen(false)} className="text-stone-400">
            <X size={16} />
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {results.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-stone-500">
              {query ? 'No matching records.' : 'Start typing to search across the current hotel scope.'}
            </p>
          ) : (
            results.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setSearchOpen(false)
                  setQuery('')
                  navigate(item.to)
                }}
                className="flex w-full flex-col rounded-md px-3 py-2.5 text-left hover:bg-[#f0f6ff]"
              >
                <span className="text-sm font-medium text-navy-900">{item.title}</span>
                <span className="text-xs text-stone-500">{item.subtitle}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
