import { CollapsibleCard } from '../CollapsibleCard'
import { EmptyState } from '../EmptyState'
import { ModuleName } from '../ModuleName'
import type { EdgeSnapshot } from '../../types'

type EdgesSectionProps = {
  edges: EdgeSnapshot[]
  total: number
  displayPrefix: string | null
}

export function EdgesSection({
  edges,
  total,
  displayPrefix,
}: EdgesSectionProps) {
  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2 className="text-xl font-semibold text-white">Edges</h2>
        <div className="text-sm text-slate-400">
          Showing {edges.length} of {total}
        </div>
      </div>

      <CollapsibleCard
        title="All edges"
        subtitle="Module import edges and symbol import edges"
        defaultOpen
      >
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-2 text-sm">
            <thead>
              <tr className="text-left text-slate-400">
                <th className="px-3 py-2 font-medium">Type</th>
                <th className="px-3 py-2 font-medium">From</th>
                <th className="px-3 py-2 font-medium">To</th>
                <th className="px-3 py-2 font-medium">Symbol</th>
                <th className="px-3 py-2 font-medium">Line</th>
              </tr>
            </thead>
            <tbody>
              {edges.map((edge, index) => (
                <tr key={`${edge.type}-${edge.from}-${edge.to}-${index}`}>
                  <td className="rounded-l-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-slate-200">
                    {edge.type}
                  </td>
                  <td className="border-y border-slate-800 bg-slate-900/70 px-3 py-2 text-slate-300">
                    <div>
                      <ModuleName name={edge.from} prefix={displayPrefix} />
                    </div>
                    <div className="text-xs text-slate-500">
                      <ModuleName
                        name={edge.from_package}
                        prefix={displayPrefix}
                      />
                    </div>
                  </td>
                  <td className="border-y border-slate-800 bg-slate-900/70 px-3 py-2 text-slate-300">
                    <div>
                      <ModuleName name={edge.to} prefix={displayPrefix} />
                    </div>
                    <div className="text-xs text-slate-500">
                      <ModuleName
                        name={edge.to_package}
                        prefix={displayPrefix}
                      />
                    </div>
                  </td>
                  <td className="border-y border-slate-800 bg-slate-900/70 px-3 py-2 text-slate-300">
                    {edge.symbol_name ?? '(none)'}
                  </td>
                  <td className="rounded-r-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-slate-300">
                    {edge.line ?? '(none)'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {edges.length === 0 ? (
            <EmptyState label="No edges match the current filter." />
          ) : null}
        </div>
      </CollapsibleCard>
    </section>
  )
}
