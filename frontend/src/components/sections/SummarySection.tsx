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
      <h1 className="mb-4 text-6xl font-semibold text-white">Package Name Here</h1>
      <div className="flex flex-row gap-6">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="rounded-2xl text-wrap flex flex-row justify-start border border-slate-800 bg-slate-900/70 p-5"
          >
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
              {value} {label}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
