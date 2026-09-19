import { cn } from '../../lib/format'

export function StatCard({ label, value, hint, icon: Icon, trend }) {
  return (
    <div className="surface-card min-w-0 rounded-lg p-3.5 sm:p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-stone-500">{label}</p>
          <p className="mt-1 break-words text-[22px] font-extrabold leading-none tracking-tight text-[#1a1a1a] sm:text-[28px]">{value}</p>
        </div>
        {Icon ? (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-navy-900 text-white sm:h-10 sm:w-10">
            <Icon size={18} />
          </div>
        ) : null}
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs">
        {trend ? (
          <span
            className={cn(
              'rounded px-1.5 py-0.5 font-bold',
              trend.startsWith('-') ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700',
            )}
          >
            {trend}
          </span>
        ) : null}
        {hint ? <span className="min-w-0 text-stone-500">{hint}</span> : null}
      </div>
    </div>
  )
}
