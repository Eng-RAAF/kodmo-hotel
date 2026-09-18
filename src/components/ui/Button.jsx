import { cn } from '../../lib/format'

const variants = {
  primary:
    'bg-[#006ce4] text-white hover:bg-[#0057b8] shadow-none',
  gold: 'bg-gold-400 text-navy-950 hover:bg-gold-500',
  outline: 'border border-[#006ce4] bg-white text-[#006ce4] hover:bg-[#f0f6ff]',
  ghost: 'text-[#006ce4] hover:bg-[#f0f6ff]',
  danger: 'bg-rose-600 text-white hover:bg-rose-500',
  soft: 'bg-[#f2f2f2] text-[#1a1a1a] hover:bg-[#e7e7e7]',
}

const sizes = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-5 text-[15px]',
}

export function Button({
  as: As = 'button',
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}) {
  return (
    <As
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md font-bold tracking-tight transition duration-150 disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </As>
  )
}
