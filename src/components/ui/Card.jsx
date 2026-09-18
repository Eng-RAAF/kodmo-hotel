import { cn } from '../../lib/format'

export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'surface-card overflow-hidden rounded-lg',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ title, subtitle, action, className }) {
  return (
    <div className={cn('flex items-start justify-between gap-3 border-b border-stone-line px-5 py-3.5', className)}>
      <div>
        <h3 className="text-base font-bold text-navy-900">{title}</h3>
        {subtitle ? <p className="mt-0.5 text-xs leading-5 text-stone-500">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  )
}
