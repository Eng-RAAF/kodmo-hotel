import { CalendarDays, Car, MapPin, Plane, Search, Sparkles, User } from 'lucide-react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { TODAY } from '../../lib/constants'
import { addDays } from '../../lib/format'
import { AIRPORTS } from '../../data/travelCatalog'

function Field({ icon: Icon, children, className = '' }) {
  return (
    <label className={`flex items-center gap-3 bg-white px-3 py-2 ${className}`}>
      <Icon size={22} className="shrink-0 text-[#6b6b6b]" />
      {children}
    </label>
  )
}

export function TravelSearchBar() {
  const location = useLocation()
  const [params, setParams] = useSearchParams()
  const kind = location.pathname.replace('/', '') || 'flights'
  const from = params.get('from') || 'Mogadishu'
  const to = params.get('to') || 'Hargeisa'
  const date = params.get('date') || TODAY
  const back = params.get('back') || addDays(TODAY, 3)
  const people = params.get('people') || '1'
  const q = params.get('q') || 'Somalia'

  const submit = (event) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const next = new URLSearchParams()
    for (const [key, value] of data.entries()) next.set(key, String(value || '').trim())
    setParams(next)
  }

  const airportOptions = AIRPORTS.map((airport) => (
    <option key={airport.code} value={airport.city}>
      {airport.city} ({airport.code})
    </option>
  ))

  return (
    <div className="bg-navy-900 px-4 pb-4">
      <form
        key={kind + location.search}
        onSubmit={submit}
        className={`mx-auto grid max-w-[1100px] grid-cols-1 overflow-hidden rounded-lg border-4 border-gold-400 bg-gold-400 ${
          kind === 'attractions'
            ? 'md:grid-cols-[1.4fr_1fr_auto]'
            : 'md:grid-cols-[1.1fr_1.1fr_1fr_auto]'
        }`}
      >
        {kind === 'flights' ? (
          <>
            <Field icon={Plane} className="">
              <select name="from" defaultValue={from} aria-label="From" className="w-full bg-transparent text-sm font-semibold outline-none">
                {airportOptions}
              </select>
            </Field>
            <Field icon={Plane} className="border-t-4 border-gold-400 md:border-t-0 md:border-l-4">
              <select name="to" defaultValue={to} aria-label="To" className="w-full bg-transparent text-sm font-semibold outline-none">
                {airportOptions}
              </select>
            </Field>
            <Field icon={CalendarDays} className="border-t-4 border-gold-400 md:border-t-0 md:border-l-4">
              <span className="flex min-w-0 flex-1 items-center gap-2 text-sm font-semibold">
                <input name="date" type="date" aria-label="Depart" defaultValue={date} className="min-w-0 flex-1 bg-transparent outline-none" />
                <span className="text-stone-300">—</span>
                <input name="back" type="date" aria-label="Return" defaultValue={back} className="min-w-0 flex-1 bg-transparent outline-none" />
              </span>
            </Field>
          </>
        ) : null}

        {kind === 'cars' ? (
          <>
            <Field icon={Car}>
              <input name="q" defaultValue={params.get('q') || 'Mogadishu'} placeholder="Pick-up city" aria-label="Pick-up city" className="w-full bg-transparent text-sm font-semibold outline-none" />
            </Field>
            <Field icon={CalendarDays} className="border-t-4 border-gold-400 md:border-t-0 md:border-l-4">
              <span className="flex min-w-0 flex-1 items-center gap-2 text-sm font-semibold">
                <input name="date" type="date" aria-label="Pick-up date" defaultValue={date} className="min-w-0 flex-1 bg-transparent outline-none" />
                <span className="text-stone-300">—</span>
                <input name="back" type="date" aria-label="Drop-off date" defaultValue={back} className="min-w-0 flex-1 bg-transparent outline-none" />
              </span>
            </Field>
            <Field icon={User} className="border-t-4 border-gold-400 md:border-t-0 md:border-l-4">
              <span className="flex items-center gap-2 text-sm font-semibold">
                <input name="people" type="number" min="1" defaultValue={people} aria-label="Drivers" className="w-10 bg-transparent outline-none" />
                drivers
              </span>
            </Field>
          </>
        ) : null}

        {kind === 'attractions' ? (
          <>
            <Field icon={Sparkles}>
              <input name="q" defaultValue={q} placeholder="City or attraction" aria-label="Destination" className="w-full bg-transparent text-sm font-semibold outline-none" />
            </Field>
            <Field icon={CalendarDays} className="border-t-4 border-gold-400 md:border-t-0 md:border-l-4">
              <input name="date" type="date" aria-label="Date" defaultValue={date} className="w-full bg-transparent text-sm font-semibold outline-none" />
            </Field>
          </>
        ) : null}

        {kind === 'taxis' ? (
          <>
            <Field icon={Plane}>
              <select name="from" defaultValue={params.get('from') || 'Mogadishu'} aria-label="Airport city" className="w-full bg-transparent text-sm font-semibold outline-none">
                {airportOptions}
              </select>
            </Field>
            <Field icon={MapPin} className="border-t-4 border-gold-400 md:border-t-0 md:border-l-4">
              <input name="to" defaultValue={to === 'Hargeisa' ? 'city hotels' : to} placeholder="Drop-off" aria-label="Drop-off" className="w-full bg-transparent text-sm font-semibold outline-none" />
            </Field>
            <Field icon={CalendarDays} className="border-t-4 border-gold-400 md:border-t-0 md:border-l-4">
              <input name="date" type="date" aria-label="Pickup date" defaultValue={date} className="w-full bg-transparent text-sm font-semibold outline-none" />
            </Field>
          </>
        ) : null}

        <button
          type="submit"
          className="flex items-center justify-center gap-2 bg-[#006ce4] px-8 py-3 text-lg font-bold text-white hover:bg-[#0057b8] md:border-l-4 md:border-gold-400"
        >
          <Search size={20} className="md:hidden" />
          Search
        </button>
      </form>
    </div>
  )
}
