type EmptyStateProps = {
  label: string
}

export function EmptyState({ label }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-sm text-slate-400">
      {label}
    </div>
  )
}
