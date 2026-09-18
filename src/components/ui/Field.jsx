import { cn } from '../../lib/format'

export function Field({ label, error, children, className }) {
  return (
    <label className={cn('block', className)}>
      {label ? <span className="mb-1.5 block text-sm font-bold text-[#1a1a1a]">{label}</span> : null}
      {children}
      {error ? <span className="mt-1 block text-xs text-rose-600">{error}</span> : null}
    </label>
  )
}

const controlClass =
  'w-full min-w-0 rounded-md border border-[#bdbdbd] bg-white px-3.5 py-2.5 text-base text-[#1a1a1a] outline-none transition placeholder:text-stone-400 hover:border-navy-700 focus:border-[#006ce4] focus:ring-2 focus:ring-[#006ce4]/25 sm:text-sm'

export function Input({ className, ...props }) {
  return <input className={cn(controlClass, className)} {...props} />
}

export function Select({ className, children, ...props }) {
  return (
    <select className={cn(controlClass, className)} {...props}>
      {children}
    </select>
  )
}

export function Textarea({ className, ...props }) {
  return <textarea className={cn(controlClass, 'min-h-[88px] resize-y', className)} {...props} />
}
