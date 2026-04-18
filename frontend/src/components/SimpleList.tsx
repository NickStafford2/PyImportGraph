type SimpleListProps = {
  title: string
  items: string[]
}

export function SimpleList({ title, items }: SimpleListProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
      <h3 className="mb-3 text-sm font-semibold text-white">{title}</h3>
      {items.length === 0 ? (
        <div className="text-sm text-slate-500">(none)</div>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item}
              className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-300"
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
