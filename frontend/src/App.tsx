import { useEffect, useMemo, useState } from 'react'
import { CollapsibleCard } from './components/CollapsibleCard'
import type {
  DefinitionSnapshot,
  EdgeSnapshot,
  ModuleSnapshot,
  PackageSnapshot,
  ProjectSnapshot,
} from './types'

function App() {
  const [snapshot, setSnapshot] = useState<ProjectSnapshot | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadSnapshot(): Promise<void> {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/snapshot')
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }

        const data = (await response.json()) as ProjectSnapshot
        if (!cancelled) {
          setSnapshot(data)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unknown error')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadSnapshot()

    return () => {
      cancelled = true
    }
  }, [])

  const normalizedQuery = query.trim().toLowerCase()

  const filteredPackages = useMemo(() => {
    if (!snapshot) {
      return []
    }
    return snapshot.packages.filter((item) =>
      matchesPackage(item, normalizedQuery),
    )
  }, [snapshot, normalizedQuery])

  const filteredModules = useMemo(() => {
    if (!snapshot) {
      return []
    }
    return snapshot.modules.filter((item) =>
      matchesModule(item, normalizedQuery),
    )
  }, [snapshot, normalizedQuery])

  const filteredEdges = useMemo(() => {
    if (!snapshot) {
      return []
    }
    return snapshot.edges.filter((item) => matchesEdge(item, normalizedQuery))
  }, [snapshot, normalizedQuery])

  return (
    <main className="min-h-screen bg-slate-950">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <header className="mb-8">
          <p className="text-sm uppercase tracking-[0.25em] text-sky-400">
            PyImportGraph
          </p>
          <h1 className="mt-2 text-3xl font-bold text-white">
            Architecture snapshot explorer
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
            This first frontend simply renders the backend JSON in a readable
            way so you can inspect summary, packages, modules, and edges before
            adding richer visualizations.
          </p>
        </header>

        <div className="mb-8 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <label className="block text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
            Filter
          </label>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search packages, modules, symbols, or edges..."
            className="mt-3 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none ring-0 placeholder:text-slate-500 focus:border-sky-500"
          />
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-sm text-slate-300">
            Loading snapshot...
          </div>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-red-800 bg-red-950/50 p-6 text-sm text-red-200">
            Failed to load snapshot: {error}
          </div>
        ) : null}

        {snapshot ? (
          <div className="space-y-8">
            <SummarySection snapshot={snapshot} />
            <PackagesSection packages={filteredPackages} total={snapshot.packages.length} />
            <ModulesSection modules={filteredModules} total={snapshot.modules.length} />
            <EdgesSection edges={filteredEdges} total={snapshot.edges.length} />
          </div>
        ) : null}
      </div>
    </main>
  )
}

function SummarySection({ snapshot }: { snapshot: ProjectSnapshot }) {
  const rows = [
    ['Schema version', String(snapshot.schema_version)],
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

function PackagesSection({
  packages,
  total,
}: {
  packages: PackageSnapshot[]
  total: number
}) {
  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2 className="text-xl font-semibold text-white">Packages</h2>
        <div className="text-sm text-slate-400">
          Showing {packages.length} of {total}
        </div>
      </div>

      <div className="space-y-4">
        {packages.map((item) => (
          <CollapsibleCard
            key={item.name}
            title={item.name}
            subtitle={`children=${item.children.length} • direct_modules=${item.direct_modules.length} • subtree_modules=${item.subtree_modules.length}`}
          >
            <div className="grid gap-6 xl:grid-cols-2">
              <KeyValueList
                title="Metadata"
                items={[
                  ['Parent', item.parent ?? '(none)'],
                  ['Children', joinOrNone(item.children)],
                  ['Direct modules', String(item.direct_modules.length)],
                  ['Subtree modules', String(item.subtree_modules.length)],
                ]}
              />

              <KeyValueList
                title="Imported by"
                items={[
                  ['Modules', joinOrNone(item.imported_by_modules)],
                  ['Packages', joinOrNone(item.imported_by_packages)],
                ]}
              />

              <SimpleList title="Direct modules" items={item.direct_modules} />
              <SimpleList title="Subtree modules" items={item.subtree_modules} />
            </div>

            <div className="mt-6">
              <DefinitionTable
                title="Observed external interface"
                definitions={item.external_interface}
              />
            </div>
          </CollapsibleCard>
        ))}

        {packages.length === 0 ? <EmptyState label="No packages match the current filter." /> : null}
      </div>
    </section>
  )
}

function ModulesSection({
  modules,
  total,
}: {
  modules: ModuleSnapshot[]
  total: number
}) {
  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2 className="text-xl font-semibold text-white">Modules</h2>
        <div className="text-sm text-slate-400">
          Showing {modules.length} of {total}
        </div>
      </div>

      <div className="space-y-4">
        {modules.map((item) => (
          <CollapsibleCard
            key={item.name}
            title={item.name}
            subtitle={`package=${item.package} • imports=${item.imports.length} • imported_by=${item.imported_by.length}`}
          >
            <div className="grid gap-6 xl:grid-cols-2">
              <KeyValueList
                title="Metadata"
                items={[
                  ['Package', item.package],
                  ['Imports', String(item.imports.length)],
                  ['Imported by', String(item.imported_by.length)],
                ]}
              />

              <KeyValueList
                title="Importing packages"
                items={[['Packages', joinOrNone(item.importing_packages)]]}
              />

              <SimpleList title="Imports" items={item.imports} />
              <SimpleList title="Imported by" items={item.imported_by} />
            </div>

            <div className="mt-6">
              <DefinitionTable
                title="Observed external interface"
                definitions={item.external_interface}
              />
            </div>
          </CollapsibleCard>
        ))}

        {modules.length === 0 ? <EmptyState label="No modules match the current filter." /> : null}
      </div>
    </section>
  )
}

function EdgesSection({
  edges,
  total,
}: {
  edges: EdgeSnapshot[]
  total: number
}) {
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
                    <div>{edge.from}</div>
                    <div className="text-xs text-slate-500">{edge.from_package}</div>
                  </td>
                  <td className="border-y border-slate-800 bg-slate-900/70 px-3 py-2 text-slate-300">
                    <div>{edge.to}</div>
                    <div className="text-xs text-slate-500">{edge.to_package}</div>
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

          {edges.length === 0 ? <EmptyState label="No edges match the current filter." /> : null}
        </div>
      </CollapsibleCard>
    </section>
  )
}

function KeyValueList({
  title,
  items,
}: {
  title: string
  items: Array<[string, string]>
}) {
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

function SimpleList({
  title,
  items,
}: {
  title: string
  items: string[]
}) {
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

function DefinitionTable({
  title,
  definitions,
}: {
  title: string
  definitions: DefinitionSnapshot[]
}) {
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

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-sm text-slate-400">
      {label}
    </div>
  )
}

function joinOrNone(values: string[]): string {
  return values.length > 0 ? values.join(', ') : '(none)'
}

function matchesPackage(item: PackageSnapshot, query: string): boolean {
  if (!query) {
    return true
  }

  const haystack = [
    item.name,
    item.parent ?? '',
    ...item.children,
    ...item.direct_modules,
    ...item.subtree_modules,
    ...item.imported_by_modules,
    ...item.imported_by_packages,
    ...item.external_interface.flatMap((definition) => [
      definition.symbol_name,
      definition.kind,
      definition.module_name,
      definition.package_name,
    ]),
  ]
    .join(' ')
    .toLowerCase()

  return haystack.includes(query)
}

function matchesModule(item: ModuleSnapshot, query: string): boolean {
  if (!query) {
    return true
  }

  const haystack = [
    item.name,
    item.package,
    ...item.imports,
    ...item.imported_by,
    ...item.importing_packages,
    ...item.external_interface.flatMap((definition) => [
      definition.symbol_name,
      definition.kind,
      definition.module_name,
      definition.package_name,
    ]),
  ]
    .join(' ')
    .toLowerCase()

  return haystack.includes(query)
}

function matchesEdge(item: EdgeSnapshot, query: string): boolean {
  if (!query) {
    return true
  }

  const haystack = [
    item.type,
    item.from,
    item.to,
    item.from_package,
    item.to_package,
    item.symbol_name ?? '',
    item.line != null ? String(item.line) : '',
  ]
    .join(' ')
    .toLowerCase()

  return haystack.includes(query)
}

export default App
