import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Check, ChevronDown, Building2 } from 'lucide-react'
import { useHotelStore } from '../../store/hotelStore'
import { useHotelScope } from '../../hooks/useHotelScope'
import { hotelAppPath, matchHotelApp } from '../../lib/paths'
import { cn } from '../../lib/format'

export function HotelSelector() {
  const { availableHotels, currentHotelId, currentHotel, canViewAll } = useHotelScope()
  const setHotel = useHotelStore((state) => state.setHotel)
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()
  const route = matchHotelApp(location.pathname)
  const segment = route?.segment || 'dashboard'

  useEffect(() => {
    const onClick = (event) => {
      if (!ref.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const openHotel = (hotelId) => {
    setHotel(hotelId)
    navigate(hotelAppPath(hotelId, segment))
    setOpen(false)
  }

  if (!canViewAll) {
    return (
      <div className="flex w-full max-w-full items-center gap-2 rounded-md border border-white/25 bg-white/10 px-2 py-2 text-sm sm:px-3">
        <Building2 size={15} className="shrink-0 text-gold-400" />
        <span className="truncate font-semibold">{currentHotel?.name || 'Hotel system'}</span>
      </div>
    )
  }

  const label = currentHotel?.name || 'Select hotel'

  return (
    <div ref={ref} className="relative min-w-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full max-w-full items-center gap-2 rounded-md border border-white/25 bg-white/10 px-2 py-2 text-left text-sm text-white hover:bg-white/15 sm:px-3"
      >
        <Building2 size={15} className="shrink-0 text-gold-400" />
        <span className="truncate font-semibold">{label}</span>
        <ChevronDown size={14} className={cn('shrink-0 text-white/70 transition', open && 'rotate-180')} />
      </button>
      {open ? (
        <div className="absolute top-full left-0 z-40 mt-2 w-[min(100vw-2rem,320px)] overflow-hidden rounded-lg border border-stone-line bg-white text-[#1a1a1a] shadow-2xl">
          <button
            type="button"
            onClick={() => {
              setHotel('all')
              navigate('/hotels')
              setOpen(false)
            }}
            className="flex w-full items-center justify-between px-4 py-3 text-sm hover:bg-[#f0f6ff]"
          >
            <span className="font-semibold">Group console</span>
            {currentHotelId === 'all' ? <Check size={16} className="text-[#006ce4]" /> : null}
          </button>
          {availableHotels.map((hotel) => (
            <button
              key={hotel.id}
              type="button"
              onClick={() => openHotel(hotel.id)}
              className="flex w-full items-center justify-between border-t border-stone-line px-4 py-3 text-left text-sm hover:bg-[#f0f6ff]"
            >
              <span>
                <span className="block font-semibold">{hotel.name}</span>
                <span className="text-xs text-stone-500">
                  {hotel.city} · {hotel.stars}-star
                </span>
              </span>
              {currentHotelId === hotel.id ? <Check size={16} className="text-[#006ce4]" /> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
