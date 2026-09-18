import { Inbox } from 'lucide-react'

export function EmptyState({ title, body, action, icon: Icon = Inbox }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-md bg-navy-900 text-white">
        <Icon size={20} />
      </div>
      <p className="text-sm font-bold text-navy-900">{title}</p>
      {body ? <p className="mt-1 max-w-sm text-sm text-stone-500">{body}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}
