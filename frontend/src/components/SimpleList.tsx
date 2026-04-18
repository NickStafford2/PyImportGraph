import { ModuleName } from './ModuleName'

type SimpleListProps = {
  title: string
  items: string[]
  formatAsModuleName?: boolean
  displayPrefix?: string | null
}

export function SimpleList({
  title,
  items,
  formatAsModuleName = false,
  displayPrefix = null,
}: SimpleListProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
      <h3 className="mb-3 text-sm font-semibold text-white">{title}</h3>

      {items.length === 0 ? (
        <div className="text-sm text-slate-500">(none)</div>
      ) : (
        <div className="columns-1 gap-2 sm:columns-2 2xl:columns-3">
          {items.map((item) => (
            <div
              key={item}
              className="mb-2 break-inside-avoid rounded-lg px-3 text-sm text-slate-300"
            >
              {formatAsModuleName ? (
                <ModuleName name={item} prefix={displayPrefix} />
              ) : (
                item
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
