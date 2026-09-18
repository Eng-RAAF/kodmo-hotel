import { cn } from '../../lib/format'

const tones = {
  emerald: 'bg-emerald-50 text-emerald-800 ring-emerald-700/12',
  sky: 'bg-[#e7f3ff] text-[#006ce4] ring-[#006ce4]/15',
  indigo: 'bg-[#eef2ff] text-[#003b95] ring-[#003b95]/12',
  amber: 'bg-amber-50 text-amber-900 ring-amber-700/12',
  cyan: 'bg-cyan-50 text-cyan-800 ring-cyan-700/12',
  rose: 'bg-rose-50 text-rose-800 ring-rose-700/12',
  slate: 'bg-stone-100 text-stone-600 ring-stone-500/10',
  gold: 'bg-gold-200 text-navy-950 ring-gold-500/25',
}

export function Badge({ tone = 'slate', className, children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-2 py-0.5 text-[11px] font-bold capitalize ring-1 ring-inset',
        tones[tone] || tones.slate,
        className,
      )}
    >
      {children}
    </span>
  )
}

const roomTone = {
  available: 'emerald',
  occupied: 'sky',
  reserved: 'indigo',
  dirty: 'amber',
  cleaning: 'cyan',
  out_of_order: 'rose',
}

const reservationTone = {
  confirmed: 'indigo',
  checked_in: 'sky',
  checked_out: 'slate',
  cancelled: 'rose',
  no_show: 'amber',
}

export function RoomStatusBadge({ status }) {
  return <Badge tone={roomTone[status] || 'slate'}>{status.replaceAll('_', ' ')}</Badge>
}

export function ReservationStatusBadge({ status }) {
  return <Badge tone={reservationTone[status] || 'slate'}>{status.replaceAll('_', ' ')}</Badge>
}
