import type { DefinitionSnapshot } from '../types'

type DefinitionTableProps = {
  title: string
  definitions: DefinitionSnapshot[]
}

export function DefinitionTable({
  title,
  definitions,
}: DefinitionTableProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
      <h3 className="mb-3 text-sm font-semibold text-white">{title}</h3>

      {definitions.length === 0 ? (
        <div className="text-sm text-slate-500">(none)</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-2 text-sm">
            <thead>
              <tr className="text-left text-slate-400">
                <th className="px-3 py-2 font-medium">Symbol</th>
                <th className="px-3 py-2 font-medium">Kind</th>
                <th className="px-3 py-2 font-medium">Module</th>
                <th className="px-3 py-2 font-medium">Line</th>
              </tr>
            </thead>
            <tbody>
              {definitions.map((definition) => (
                <tr
                  key={`${definition.module_name}-${definition.symbol_name}-${definition.line}`}
                >
                  <td className="rounded-l-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-slate-200">
                    {definition.symbol_name}
                  </td>
                  <td className="border-y border-slate-800 bg-slate-900/70 px-3 py-2 text-slate-300">
                    {definition.kind}
                  </td>
                  <td className="border-y border-slate-800 bg-slate-900/70 px-3 py-2 text-slate-300">
                    {definition.module_name}
                  </td>
                  <td className="rounded-r-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-slate-300">
                    {definition.line}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
