import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Clock3, MapPin, Star, Users } from 'lucide-react'
import { AIRPORTS, ATTRACTIONS, CARS, FLIGHTS, TAXIS, airportLabel, matchesPlace } from '../data/travelCatalog'
import { useTravelStore } from '../store/travelStore'
import { useUiStore } from '../store/uiStore'
import { formatCurrency, nightsBetween } from '../lib/format'
import { TODAY } from '../lib/constants'
import { addDays } from '../lib/format'

const COPY = {
  flights: { crumb: 'Flights', empty: 'No flights match that route. Try Mogadishu to Hargeisa.' },
  cars: { crumb: 'Car rental', empty: 'No cars in that city. Try Mogadishu, Hargeisa, Garowe, Kismayo, or Bosaso.' },
  attractions: { crumb: 'Attractions', empty: 'No attractions match that search. Try Mogadishu or Hargeisa.' },
  taxis: { crumb: 'Airport taxis', empty: 'No taxis for that airport. Try Mogadishu or Hargeisa.' },
}

function BookButton({ itemId, kind, title, price, details }) {
  const book = useTravelStore((state) => state.book)
  const booked = useTravelStore((state) => state.isBooked(itemId))
  const pushToast = useUiStore((state) => state.pushToast)

  return (
    <button
      type="button"
      disabled={booked}
      onClick={() => {
        const confirmation = book({ itemId, kind, title, price, details })
        pushToast(`${title} booked. Confirmation ${confirmation.id}`)
      }}
      className="rounded-md bg-[#006ce4] px-4 py-2 text-sm font-bold text-white hover:bg-[#0057b8] disabled:bg-emerald-600 disabled:hover:bg-emerald-600"
    >
      {booked ? 'Booked' : kind === 'flights' ? 'Select' : kind === 'taxis' ? 'Book transfer' : 'Book'}
    </button>
  )
}

function ResultCard({ children }) {
  return <article className="overflow-hidden rounded-lg border border-[#8cb3e8] bg-white p-4 shadow-sm">{children}</article>
}

export function TravelMarketPage({ kind }) {
  const [params] = useSearchParams()
  const from = params.get('from') || (kind === 'flights' || kind === 'taxis' ? 'Mogadishu' : '')
  const to = params.get('to') || (kind === 'flights' ? 'Hargeisa' : '')
  const q = (params.get('q') || (kind === 'cars' ? 'Mogadishu' : kind === 'attractions' ? 'Somalia' : '')).trim()
  const date = params.get('date') || TODAY
  const back = params.get('back') || addDays(TODAY, 3)
  const people = Number(params.get('people') || 1)
  const nights = nightsBetween(date, back)

  const results = useMemo(() => {
    if (kind === 'flights') {
      return FLIGHTS.filter((flight) => {
        const origin = airportLabel(flight.from)
        const dest = airportLabel(flight.to)
        const fromOk = !from || matchesPlace(origin, from) || matchesPlace(flight.from, from)
        const toOk = !to || matchesPlace(dest, to) || matchesPlace(flight.to, to)
        return fromOk && toOk
      })
    }
    if (kind === 'cars') {
      const cityQuery = !q || q.toLowerCase() === 'somalia' ? '' : q
      return CARS.filter((car) => matchesPlace(`${car.city} ${car.name} ${car.type}`, cityQuery) && car.seats >= people)
        .map((car) => ({ ...car, total: car.price * nights }))
    }
    if (kind === 'attractions') {
      const placeQuery = !q || q.toLowerCase() === 'somalia' ? '' : q
      return ATTRACTIONS.filter((item) => matchesPlace(`${item.city} ${item.name}`, placeQuery))
    }
    return TAXIS.filter((taxi) => {
      const airport = AIRPORTS.find((item) => item.code === taxi.from)
      const fromOk = !from || matchesPlace(`${airport?.city} ${taxi.from}`, from)
      const genericDrop = !to || /city|hotel/i.test(to)
      const toOk = genericDrop || matchesPlace(taxi.to, to)
      return fromOk && toOk
    })
  }, [kind, from, to, q, people, nights])

  const heading = `${COPY[kind].crumb}: ${results.length} ${results.length === 1 ? 'option' : 'options'} found`

  return (
    <div className="bg-[#f5f5f5] pb-16">
      <div className="mx-auto max-w-[1100px] px-4 pt-3">
        <nav className="flex flex-wrap items-center gap-1 text-xs text-stone-500">
          <Link to="/" className="hover:text-[#006ce4]">Home</Link>
          <span>›</span>
          <span>{COPY[kind].crumb}</span>
          <span>›</span>
          <span>Search results</span>
        </nav>
        <h1 className="mt-3 text-[22px] font-extrabold tracking-tight text-[#1a1a1a]">{heading}</h1>
        <p className="mt-1 text-sm text-stone-500">
          {kind === 'flights' ? `${from || 'Mogadishu'} → ${to || 'Hargeisa'} · ${date}` : null}
          {kind === 'cars' ? `${q || 'Somalia'} · ${nights} day${nights === 1 ? '' : 's'}` : null}
          {kind === 'attractions' ? `${q || 'Somalia'} · ${date}` : null}
          {kind === 'taxis' ? `${from || 'Airport'} → ${to || 'hotel'} · ${date}` : null}
        </p>

        <div className="mt-4 space-y-3">
          {results.length === 0 ? (
            <ResultCard>
              <p className="text-sm text-stone-600">{COPY[kind].empty}</p>
            </ResultCard>
          ) : null}

          {kind === 'flights'
            ? results.map((flight) => (
                <ResultCard key={flight.id}>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-stone-500">{flight.airline} · {flight.cabin}</p>
                      <p className="mt-1 text-lg font-extrabold text-[#006ce4]">
                        {airportLabel(flight.from)} → {airportLabel(flight.to)}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[#1a1a1a]">
                        {flight.depart} — {flight.arrive}
                        <span className="ml-2 font-normal text-stone-500">{flight.duration} · {flight.stops}</span>
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                      <p className="text-xl font-extrabold text-[#1a1a1a]">{formatCurrency(flight.price)}</p>
                      <BookButton
                        itemId={flight.id}
                        kind="flights"
                        title={`${flight.airline} ${flight.from}-${flight.to}`}
                        price={flight.price}
                        details={`${date} ${flight.depart}`}
                      />
                    </div>
                  </div>
                </ResultCard>
              ))
            : null}

          {kind === 'cars'
            ? results.map((car) => (
                <ResultCard key={car.id}>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-lg font-extrabold text-[#006ce4]">{car.name}</h2>
                      <p className="mt-1 flex flex-wrap items-center gap-x-3 text-sm text-stone-600">
                        <span className="flex items-center gap-1"><MapPin size={14} /> {car.city}</span>
                        <span>{car.type}</span>
                        <span className="flex items-center gap-1"><Users size={14} /> {car.seats} seats</span>
                        <span>{car.transmission}</span>
                      </p>
                      <p className="mt-1 text-xs text-stone-500">{car.supplier} · {formatCurrency(car.price)} / day</p>
                    </div>
                    <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                      <p className="text-xl font-extrabold text-[#1a1a1a]">{formatCurrency(car.total)}</p>
                      <BookButton
                        itemId={`${car.id}-${date}`}
                        kind="cars"
                        title={`${car.name} in ${car.city}`}
                        price={car.total}
                        details={`${date} to ${back}`}
                      />
                    </div>
                  </div>
                </ResultCard>
              ))
            : null}

          {kind === 'attractions'
            ? results.map((item) => (
                <ResultCard key={item.id}>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-extrabold text-[#006ce4]">{item.name}</h2>
                        <span className="score-box">{item.rating.toFixed(1)}</span>
                      </div>
                      <p className="mt-1 flex flex-wrap items-center gap-x-3 text-sm text-[#006ce4]">
                        <span className="flex items-center gap-1"><MapPin size={14} /> {item.city}</span>
                        <span className="flex items-center gap-1 text-stone-500"><Clock3 size={14} /> {item.duration}</span>
                        <span className="flex items-center gap-1 text-stone-500"><Star size={14} /> {item.reviews.toLocaleString()} reviews</span>
                      </p>
                      <p className="mt-2 max-w-xl text-sm leading-6 text-stone-600">{item.summary}</p>
                    </div>
                    <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                      <p className="text-xl font-extrabold text-[#1a1a1a]">{formatCurrency(item.price)}</p>
                      <BookButton
                        itemId={`${item.id}-${date}`}
                        kind="attractions"
                        title={item.name}
                        price={item.price}
                        details={`${item.city} · ${date}`}
                      />
                    </div>
                  </div>
                </ResultCard>
              ))
            : null}

          {kind === 'taxis'
            ? results.map((taxi) => (
                <ResultCard key={taxi.id}>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-stone-500">{taxi.type} transfer</p>
                      <h2 className="mt-1 text-lg font-extrabold text-[#006ce4]">{taxi.name}</h2>
                      <p className="mt-1 text-sm text-stone-600">
                        {airportLabel(taxi.from)} → {taxi.to}
                      </p>
                      <p className="mt-1 text-xs text-stone-500">{taxi.minutes} min · up to {taxi.people} passengers</p>
                    </div>
                    <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                      <p className="text-xl font-extrabold text-[#1a1a1a]">{formatCurrency(taxi.price)}</p>
                      <BookButton
                        itemId={`${taxi.id}-${date}`}
                        kind="taxis"
                        title={`${taxi.name} from ${taxi.from}`}
                        price={taxi.price}
                        details={`${taxi.to} · ${date}`}
                      />
                    </div>
                  </div>
                </ResultCard>
              ))
            : null}
        </div>
      </div>
    </div>
  )
}
