type KeyValueListProps = {
  title: string
  items: Array<[string, string]>
}

export function KeyValueList({ title, items }: KeyValueListProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
      <h3 className="mb-3 text-sm font-semibold text-white">{title}</h3>
      <div className="space-y-3">
        {items.map(([label, value]) => (
          <div key={label}>
            <div className="text-xs uppercase tracking-[0.15em] text-slate-500">
              {label}
            </div>
            <div className="mt-1 break-words text-sm text-slate-300">{value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
