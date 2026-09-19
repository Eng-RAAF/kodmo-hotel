import { cn } from '../../lib/format'

export function PageHeader({ title, subtitle, actions, className }) {
  return (
    <div className={cn('mb-5 flex min-w-0 flex-col gap-3 sm:mb-6 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="min-w-0">
        <h1 className="text-xl font-extrabold tracking-tight text-[#1a1a1a] sm:text-2xl lg:text-[28px]">{title}</h1>
        {subtitle ? <p className="mt-1 max-w-2xl text-sm leading-6 text-stone-500">{subtitle}</p> : null}
      </div>
      {actions ? (
        <div className="flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end [&>div]:contents [&>a]:w-full [&>button]:w-full sm:[&>a]:w-auto sm:[&>button]:w-auto">
          {actions}
        </div>
      ) : null}
    </div>
  )
}
