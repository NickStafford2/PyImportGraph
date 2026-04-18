import type { ProjectSnapshot } from '../../types'

type SummarySectionProps = {
  snapshot: ProjectSnapshot
}

export function SummarySection({ snapshot }: SummarySectionProps) {
  const rows = [
    ['Packages', String(snapshot.summary.package_count)],
    ['Modules', String(snapshot.summary.module_count)],
    [
      'Packages with external interface',
      String(snapshot.summary.packages_with_external_interface),
    ],
    [
      'Modules with external interface',
      String(snapshot.summary.modules_with_external_interface),
    ],
    [
      'Cross-package symbol uses',
      String(snapshot.summary.cross_package_symbol_use_count),
    ],
  ]

  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold text-white">Summary</h2>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"
          >
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
              {label}
            </div>
            <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
