import { CheckCircle2, Info, X } from 'lucide-react'
import { useUiStore } from '../../store/uiStore'

export function Toasts() {
  const toasts = useUiStore((state) => state.toasts)
  const dismissToast = useUiStore((state) => state.dismissToast)

  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-[80] flex w-[min(100%-2rem,320px)] flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-start gap-3 rounded-lg border border-stone-line bg-white p-3 shadow-lg"
        >
          {toast.type === 'success' ? (
            <CheckCircle2 size={18} className="mt-0.5 text-emerald-600" />
          ) : (
            <Info size={18} className="mt-0.5 text-[#006ce4]" />
          )}
          <p className="flex-1 text-sm text-navy-900">{toast.message}</p>
          <button type="button" onClick={() => dismissToast(toast.id)} className="text-stone-400 hover:text-navy-900">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
