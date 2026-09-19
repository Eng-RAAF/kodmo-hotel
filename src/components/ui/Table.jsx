import { EmptyState } from './EmptyState'

export function Table({ columns, rows, rowKey = 'id', emptyTitle = 'No records', emptyBody }) {
  if (!rows.length) {
    return <EmptyState title={emptyTitle} body={emptyBody} />
  }

  return (
    <div className="touch-scroll w-full max-w-full overflow-x-auto overscroll-x-contain">
      <table className="w-full min-w-[36rem] text-left text-sm">
        <thead>
          <tr className="border-b border-stone-line bg-[#f5f5f5] text-xs font-bold text-stone-500">
            {columns.map((column) => (
              <th key={column.key} className="px-3 py-3 whitespace-nowrap sm:px-4">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[rowKey]} className="border-b border-stone-line last:border-0 hover:bg-[#f0f6ff]">
              {columns.map((column) => (
                <td key={column.key} className="px-3 py-3 align-middle sm:px-4 sm:py-3.5">
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
