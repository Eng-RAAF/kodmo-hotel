import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { Button } from './Button'

export function Modal({ open, title, subtitle, onClose, children, footer, wide }) {
  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-6"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-navy-950/55" />
      <div
        role="dialog"
        aria-modal="true"
        className={`relative z-10 flex w-full min-h-0 max-h-[calc(100dvh-1.5rem)] flex-col overflow-hidden rounded-lg border border-stone-line bg-white shadow-2xl sm:max-h-[calc(100dvh-3rem)] ${wide ? 'max-w-3xl' : 'max-w-[520px]'}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="gold-rule shrink-0" />
        <div className="flex shrink-0 items-start justify-between gap-3 px-5 py-3.5">
          <div className="min-w-0 pr-2">
            <h2 className="text-xl font-bold leading-tight text-[#1a1a1a]">{title}</h2>
            {subtitle ? <p className="mt-1 text-sm leading-5 text-stone-500">{subtitle}</p> : null}
          </div>
          <Button type="button" variant="ghost" size="sm" className="shrink-0" onClick={onClose} aria-label="Close">
            <X size={16} />
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-3 panel-scroll">{children}</div>
        {footer ? (
          <div className="flex shrink-0 justify-end gap-2 border-t border-stone-line bg-[#f5f5f5] px-5 py-3">{footer}</div>
        ) : null}
      </div>
    </div>,
    document.body,
  )
}
