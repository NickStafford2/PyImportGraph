import { useMemo, useState } from 'react'
import { EdgesSection } from './components/sections/EdgesSection'
import { ModulesSection } from './components/sections/ModulesSection'
import { PackagesSection } from './components/sections/PackagesSection'
import { SummarySection } from './components/sections/SummarySection'
import { useSnapshot } from './hooks/useSnapshot'
import { matchesEdge, matchesModule, matchesPackage } from './lib/filters'

function App() {
  const [query, setQuery] = useState('')
  const { snapshot, error, loading } = useSnapshot()

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
            <PackagesSection
              packages={filteredPackages}
              total={snapshot.packages.length}
            />
            <ModulesSection
              modules={filteredModules}
              total={snapshot.modules.length}
            />
            <EdgesSection edges={filteredEdges} total={snapshot.edges.length} />
          </div>
        ) : null}
      </div>
    </main>
  )
}

export default App
