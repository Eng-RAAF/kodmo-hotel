import { BedDouble, CalendarDays, Search, User } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { TODAY } from '../../lib/constants'
import { addDays } from '../../lib/format'

export function StaySearchBar() {
  const [params, setParams] = useSearchParams()
  const destination = params.get('q') || ''
  const checkIn = params.get('in') || TODAY
  const checkOut = params.get('out') || addDays(TODAY, 1)
  const adults = params.get('adults') || '2'
  const children = params.get('children') || '0'
  const rooms = params.get('rooms') || '1'

  const submit = (event) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const next = new URLSearchParams(params)
    next.set('q', String(data.get('q') || '').trim())
    next.set('in', String(data.get('in') || checkIn))
    next.set('out', String(data.get('out') || checkOut))
    next.set('adults', String(data.get('adults') || '2'))
    next.set('children', String(data.get('children') || '0'))
    next.set('rooms', String(data.get('rooms') || '1'))
    setParams(next)
  }

  return (
    <div className="bg-navy-900 px-3 pb-4 sm:px-4">
      <form
        onSubmit={submit}
        className="mx-auto grid max-w-[1100px] grid-cols-1 overflow-hidden rounded-lg border-4 border-gold-400 bg-gold-400 md:grid-cols-[1.3fr_1.2fr_1.2fr_auto]"
      >
        <label className="flex min-w-0 items-center gap-3 bg-white px-3 py-2.5">
          <BedDouble size={22} className="shrink-0 text-[#6b6b6b]" />
          <input
            name="q"
            aria-label="Destination"
            defaultValue={destination || 'Somalia'}
            placeholder="Where are you going?"
            className="w-full min-w-0 bg-transparent text-base font-semibold text-[#1a1a1a] outline-none placeholder:font-normal placeholder:text-stone-400 sm:text-sm"
          />
        </label>
        <label className="flex min-w-0 items-center gap-3 border-t-4 border-gold-400 bg-white px-3 py-2.5 md:border-t-0 md:border-l-4">
          <CalendarDays size={22} className="shrink-0 text-[#6b6b6b]" />
          <span className="flex min-w-0 flex-1 flex-col gap-2 text-sm font-semibold sm:flex-row sm:items-center">
            <input name="in" type="date" aria-label="Check-in date" defaultValue={checkIn} className="min-w-0 flex-1 bg-transparent text-base outline-none sm:text-sm" />
            <span className="hidden text-stone-300 sm:inline">—</span>
            <input name="out" type="date" aria-label="Check-out date" defaultValue={checkOut} className="min-w-0 flex-1 bg-transparent text-base outline-none sm:text-sm" />
          </span>
        </label>
        <label className="flex min-w-0 items-center gap-3 border-t-4 border-gold-400 bg-white px-3 py-2.5 md:border-t-0 md:border-l-4">
          <User size={22} className="shrink-0 text-[#6b6b6b]" />
          <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-1 gap-y-1 text-sm font-semibold text-[#1a1a1a]">
            <input name="adults" type="number" min="1" aria-label="Adults" defaultValue={adults} className="w-8 bg-transparent text-center text-base outline-none sm:text-sm" />
            <span>adults</span>
            <span className="text-stone-300">·</span>
            <input name="children" type="number" min="0" aria-label="Children" defaultValue={children} className="w-8 bg-transparent text-center text-base outline-none sm:text-sm" />
            <span>children</span>
            <span className="text-stone-300">·</span>
            <input name="rooms" type="number" min="1" aria-label="Rooms" defaultValue={rooms} className="w-8 bg-transparent text-center text-base outline-none sm:text-sm" />
            <span>room</span>
          </span>
        </label>
        <button
          type="submit"
          className="flex items-center justify-center gap-2 bg-[#006ce4] px-6 py-3 text-lg font-bold text-white hover:bg-[#0057b8] sm:px-8 md:border-l-4 md:border-gold-400"
        >
          <Search size={20} className="md:hidden" />
          Search
        </button>
      </form>
    </div>
  )
}
