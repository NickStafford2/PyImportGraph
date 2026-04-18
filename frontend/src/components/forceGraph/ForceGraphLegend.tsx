import { getPackageColor } from './graphColors'

type ForceGraphLegendProps = {
  packageNames: string[]
}

export function ForceGraphLegend({
  packageNames,
}: ForceGraphLegendProps) {
  const sortedPackages = [...packageNames].sort((left, right) =>
    left.localeCompare(right),
  )

  return (
    <aside className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
      <h3 className="text-sm font-semibold text-white">Legend</h3>

      <div className="mt-3 space-y-2 text-xs text-slate-400">
        <div>
          <span className="text-slate-200">Node color</span> = package
        </div>
        <div>
          <span className="text-slate-200">Node size</span> = relative module
          activity
        </div>
        <div>
          <span className="text-slate-200">Links</span> = import relationships
        </div>
      </div>

      <div className="mt-4 border-t border-slate-800 pt-4">
        <div className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
          Packages
        </div>

        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {sortedPackages.map((packageName) => (
            <div
              key={packageName}
              className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-xs text-slate-200"
            >
              <span
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: getPackageColor(packageName) }}
              />
              <span className="truncate" title={packageName}>
                {packageName}
              </span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
