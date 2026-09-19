import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ChevronDown,
  LayoutGrid,
  List,
  MapPin,
  SlidersHorizontal,
  Star,
  ThumbsUp,
  Wifi,
  Utensils,
  Bath,
  Waves,
  Car,
} from 'lucide-react'
import { api, convexQuery } from '../api/client'
import { useAuthStore } from '../store/authStore'
import { isSuperAdmin } from '../lib/constants'
import { hotelAppPath } from '../lib/paths'

const PHOTOS = [
  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=900&q=80',
]

const FALLBACK_HOTELS = [
  {
    id: 'h1',
    name: 'Grand Palace Hotel',
    city: 'Mogadishu',
    country: 'Somalia',
    address: '12 Maka Al Mukarama Road',
    stars: 5,
    status: 'active',
    rooms: 48,
    occ: 86,
    reviews: 7363,
  },
  {
    id: 'h2',
    name: 'Ocean View Resort',
    city: 'Kismayo',
    country: 'Somalia',
    address: '88 Liido Beach Road',
    stars: 4,
    status: 'active',
    rooms: 36,
    occ: 74,
    reviews: 2140,
  },
  {
    id: 'h3',
    name: 'City Heights Inn',
    city: 'Hargeisa',
    country: 'Somalia',
    address: '4 Independence Avenue',
    stars: 3,
    status: 'active',
    rooms: 22,
    occ: 61,
    reviews: 980,
  },
]

const FILTERS = [
  { id: 'wifi', label: 'Free WiFi', icon: Wifi },
  { id: 'parking', label: 'Parking', icon: Car },
  { id: 'restaurant', label: 'Restaurant', icon: Utensils },
  { id: 'bath', label: 'Private bathroom', icon: Bath },
  { id: 'pool', label: 'Swimming pool', icon: Waves },
]

function photoFor(hotel, index) {
  return PHOTOS[index % PHOTOS.length]
}

function scoreFor(hotel) {
  const base = 5.8 + Number(hotel.stars || 3) * 0.55 + (Number(hotel.occ || 70) / 100)
  return Math.min(9.6, Math.round(base * 10) / 10)
}

function scoreLabel(score) {
  if (score >= 9) return 'Wonderful'
  if (score >= 8) return 'Excellent'
  if (score >= 7) return 'Good'
  return 'Pleasant'
}

function descriptionFor(hotel) {
  return `${hotel.name} is centrally located in ${hotel.city}. It offers comfortable accommodation and friendly service. Rooms are equipped with TV and en suite facilities.`
}

function distanceFor(hotel) {
  const km = 0.8 + ((hotel.name?.length || 8) % 7) * 0.4
  return `${km.toFixed(1)} km from centre`
}

export function ExplorePage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const [hotels, setHotels] = useState(FALLBACK_HOTELS)
  const [view, setView] = useState('list')
  const [sort, setSort] = useState('top')
  const [compare, setCompare] = useState(false)
  const [starFilter, setStarFilter] = useState([])
  const [filtersOpen, setFiltersOpen] = useState(false)

  const query = (params.get('q') || '').trim().toLowerCase()
  const adults = params.get('adults') || '2'
  const children = params.get('children') || '0'
  const rooms = params.get('rooms') || '1'

  useEffect(() => {
    let alive = true
    convexQuery(api.hotels.publicList)
      .then((rows) => {
        if (alive && Array.isArray(rows) && rows.length) setHotels(rows)
      })
      .catch(() => {
        if (alive) setHotels(FALLBACK_HOTELS)
      })
    return () => {
      alive = false
    }
  }, [])

  const filtered = useMemo(() => {
    let rows = hotels.filter((hotel) => hotel.status !== 'inactive')
    if (query) {
      rows = rows.filter((hotel) =>
        [hotel.name, hotel.city, hotel.country, hotel.address].join(' ').toLowerCase().includes(query),
      )
    }
    if (starFilter.length) {
      rows = rows.filter((hotel) => starFilter.includes(Number(hotel.stars)))
    }
    const scored = rows.map((hotel, index) => ({ ...hotel, _score: scoreFor(hotel), _index: index }))
    if (sort === 'score') scored.sort((a, b) => b._score - a._score)
    else if (sort === 'stars') scored.sort((a, b) => Number(b.stars) - Number(a.stars))
    else scored.sort((a, b) => Number(b.stars) * 10 + b._score - (Number(a.stars) * 10 + a._score))
    return scored
  }, [hotels, query, starFilter, sort])

  const place = query
    ? query.replace(/\b\w/g, (letter) => letter.toUpperCase())
    : filtered[0]?.country || 'Somalia'
  const city = query || filtered[0]?.city || 'Mogadishu'

  const selectHotel = (hotel) => {
    if (!user) {
      window.dispatchEvent(new Event('stayhub:open-login'))
      window.setTimeout(() => {
        const fields = [...document.querySelectorAll('#header-login-email')]
        const visible = fields.find((field) => field.offsetParent !== null) || fields[0]
        visible?.focus()
      }, 80)
      return
    }
    if (isSuperAdmin(user)) {
      navigate(hotelAppPath(hotel.id, 'dashboard'))
      return
    }
    if (user.hotelId) {
      navigate(hotelAppPath(user.hotelId, 'dashboard'))
    }
  }

  const toggleStar = (value) => {
    setStarFilter((current) => (current.includes(value) ? current.filter((item) => item !== value) : [...current, value]))
  }

  return (
    <div className="bg-[#f5f5f5] pb-16">
      <div className="mx-auto max-w-[1100px] px-3 pt-3 sm:px-4">
        <nav className="flex flex-wrap items-center gap-1 text-xs text-stone-500">
          <Link to="/" className="hover:text-[#006ce4]">Home</Link>
          <span>›</span>
          <span>{filtered[0]?.country || 'Somalia'}</span>
          <span>›</span>
          <span className="capitalize">{city}</span>
          <span>›</span>
          <span>Search results</span>
        </nav>

        <div className="mt-3 flex items-center justify-between gap-2 lg:hidden">
          <button
            type="button"
            onClick={() => setFiltersOpen((value) => !value)}
            className="inline-flex items-center gap-2 rounded-md border border-stone-line bg-white px-3 py-2 text-sm font-bold text-[#1a1a1a]"
          >
            <SlidersHorizontal size={16} />
            {filtersOpen ? 'Hide filters' : 'Filters'}
          </button>
          <div className="flex overflow-hidden rounded-md border border-stone-line bg-white text-sm font-semibold">
            <button
              type="button"
              onClick={() => setView('list')}
              className={`flex items-center gap-1 px-3 py-1.5 ${view === 'list' ? 'bg-[#f0f6ff] text-[#006ce4]' : 'text-stone-600'}`}
            >
              <List size={14} /> List
            </button>
            <button
              type="button"
              onClick={() => setView('grid')}
              className={`flex items-center gap-1 border-l border-stone-line px-3 py-1.5 ${view === 'grid' ? 'bg-[#f0f6ff] text-[#006ce4]' : 'text-stone-600'}`}
            >
              <LayoutGrid size={14} /> Grid
            </button>
          </div>
        </div>

        <div className="mt-4 grid min-w-0 gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className={`space-y-3 ${filtersOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="overflow-hidden rounded-lg border border-[#8cb3e8] shadow-sm">
              <div className="explore-map relative h-[180px]">
                <span className="absolute top-8 left-10 text-[11px] font-semibold text-[#3d5a80]">{city}</span>
                <span className="absolute top-16 right-8 text-[10px] text-[#6b7c93]">Centre</span>
                <span className="absolute bottom-10 left-16 h-3 w-3 rounded-full bg-[#006ce4] ring-4 ring-white" />
                <span className="absolute top-12 right-16 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
                <button
                  type="button"
                  className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-md bg-[#006ce4] px-3 py-2 text-sm font-bold text-white shadow-md"
                >
                  <MapPin size={14} /> Show on map
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-stone-line bg-white p-4">
              <label className="flex items-center justify-between text-sm font-bold text-[#1a1a1a]">
                Compare hotels
                <button
                  type="button"
                  role="switch"
                  aria-checked={compare}
                  onClick={() => setCompare((value) => !value)}
                  className={`relative h-6 w-11 rounded-full transition ${compare ? 'bg-[#006ce4]' : 'bg-stone-300'}`}
                >
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${compare ? 'left-5' : 'left-0.5'}`} />
                </button>
              </label>
            </div>

            <div className="rounded-lg border border-stone-line bg-white p-4">
              <p className="text-base font-extrabold text-[#1a1a1a]">Filter by:</p>
              <p className="mt-4 text-sm font-bold">Popular filters</p>
              <div className="mt-3 space-y-2">
                {FILTERS.map((item) => {
                  const Icon = item.icon
                  return (
                    <label key={item.id} className="flex items-center gap-2 text-sm text-[#1a1a1a]">
                      <input type="checkbox" className="accent-[#006ce4]" defaultChecked={item.id === 'bath'} />
                      <Icon size={14} className="text-stone-400" />
                      {item.label}
                    </label>
                  )
                })}
              </div>
              <p className="mt-5 text-sm font-bold">Star rating</p>
              <div className="mt-3 space-y-2">
                {[5, 4, 3].map((stars) => (
                  <label key={stars} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="accent-[#006ce4]"
                      checked={starFilter.includes(stars)}
                      onChange={() => toggleStar(stars)}
                    />
                    {stars} stars
                  </label>
                ))}
              </div>
            </div>
          </aside>

          <section className="min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-lg font-extrabold tracking-tight text-[#1a1a1a] sm:text-[22px]">
                {place}: {filtered.length.toLocaleString()} {filtered.length === 1 ? 'hotel' : 'hotels'} found
              </h1>
              <div className="hidden overflow-hidden rounded-md border border-stone-line bg-white text-sm font-semibold lg:flex">
                <button
                  type="button"
                  onClick={() => setView('list')}
                  className={`flex items-center gap-1 px-3 py-1.5 ${view === 'list' ? 'bg-[#f0f6ff] text-[#006ce4]' : 'text-stone-600'}`}
                >
                  <List size={14} /> List
                </button>
                <button
                  type="button"
                  onClick={() => setView('grid')}
                  className={`flex items-center gap-1 border-l border-stone-line px-3 py-1.5 ${view === 'grid' ? 'bg-[#f0f6ff] text-[#006ce4]' : 'text-stone-600'}`}
                >
                  <LayoutGrid size={14} /> Grid
                </button>
              </div>
            </div>

            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-stone-line bg-white px-3 py-1.5 text-sm">
              <span className="text-stone-500">Sort by:</span>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="bg-transparent font-semibold text-[#006ce4] outline-none"
              >
                <option value="top">Our top picks</option>
                <option value="score">Guest rating</option>
                <option value="stars">Star rating</option>
              </select>
              <ChevronDown size={14} className="text-stone-400" />
            </div>

            <p className="mt-2 text-xs text-stone-500">
              {adults} adults · {children} children · {rooms} room
            </p>

            <div className={`mt-3 ${view === 'grid' ? 'grid gap-3 sm:grid-cols-2' : 'space-y-3'}`}>
              {filtered.map((hotel, index) => {
                const score = hotel._score
                return (
                  <article
                    key={hotel.id}
                    className="overflow-hidden rounded-lg border border-[#8cb3e8] bg-white shadow-sm"
                  >
                    <div className={view === 'grid' ? 'flex flex-col' : 'flex flex-col sm:flex-row'}>
                      <div className={`relative shrink-0 overflow-hidden ${view === 'grid' ? 'h-44 w-full' : 'h-44 sm:h-auto sm:w-[240px]'}`}>
                        <img src={photoFor(hotel, index)} alt="" className="h-full w-full object-cover" />
                      </div>
                      <div className="flex flex-1 flex-col p-3 sm:p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h2 className="text-base font-extrabold text-[#006ce4] sm:text-lg">{hotel.name}</h2>
                              <span className="flex text-[#ffb700]">
                                {Array.from({ length: Number(hotel.stars) || 3 }).map((_, star) => (
                                  <Star key={star} size={13} fill="currentColor" />
                                ))}
                              </span>
                              <ThumbsUp size={14} className="text-[#006ce4]" />
                            </div>
                            <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs font-semibold text-[#006ce4]">
                              <span className="flex items-center gap-1">
                                <MapPin size={12} /> {hotel.city}{hotel.address ? `, ${hotel.address}` : ''}
                              </span>
                              <button type="button" className="underline">Show on map</button>
                              <span className="font-normal text-stone-500">{distanceFor(hotel)}</span>
                            </p>
                            <p className="mt-3 max-w-xl text-sm leading-6 text-stone-600">{descriptionFor(hotel)}</p>
                          </div>
                          <div className="flex shrink-0 items-start gap-2">
                            <div className="hidden text-right sm:block">
                              <p className="text-sm font-extrabold text-[#1a1a1a]">{scoreLabel(score)}</p>
                              <p className="text-xs text-stone-500">{Number(hotel.reviews || 400).toLocaleString()} reviews</p>
                            </div>
                            <span className="score-box text-sm">{score.toFixed(1)}</span>
                          </div>
                        </div>
                        <div className="mt-4 flex justify-end">
                          <button
                            type="button"
                            onClick={() => selectHotel(hotel)}
                            className="w-full rounded-md bg-[#006ce4] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0057b8] sm:w-auto sm:py-2"
                          >
                            Select dates
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
