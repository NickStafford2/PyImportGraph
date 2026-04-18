import { useMemo, useState } from 'react'
import { EdgesSection } from './components/sections/EdgesSection'
import { ModulesSection } from './components/sections/ModulesSection'
import { PackagesSection } from './components/sections/PackagesSection'
import { SummarySection } from './components/sections/SummarySection'
import { useSnapshot } from './hooks/useSnapshot'
import { matchesEdge, matchesModule, matchesPackage } from './lib/filters'
import { findCommonModulePrefix } from './lib/moduleName'
import { ForceGraph } from './components/forceGraph/ForceGraph'

function App() {
  const [query, setQuery] = useState('')
  const { snapshot, error, loading } = useSnapshot()

  const normalizedQuery = query.trim().toLowerCase()

  const displayPrefix = useMemo(() => {
    if (!snapshot) {
      return null
    }

    return findCommonModulePrefix([
      ...snapshot.packages.map((item) => item.name),
      ...snapshot.modules.map((item) => item.name),
    ])
  }, [snapshot])

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
    <main className="min-h-screen bg-slate-950 scroll-smooth">
      <div className="mx-auto max-w-6xl bg-amber-600">
        {/* ...existing header/filter/loading/error... */}

        {snapshot ? (
          <div className="space-y-8">
            <SummarySection snapshot={snapshot} />
            <section>
              <h2 className="mb-4 text-xl font-semibold text-white">3D Graph</h2>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                <ForceGraph
                  snapshot={snapshot}
                  displayPrefix={displayPrefix}
                  className="h-[700px] w-full rounded-xl"
                />
              </div>
            </section>
            <PackagesSection
              packages={filteredPackages}
              total={snapshot.packages.length}
              displayPrefix={displayPrefix}
            />
            <ModulesSection
              modules={filteredModules}
              total={snapshot.modules.length}
              displayPrefix={displayPrefix}
            />
            <EdgesSection
              edges={filteredEdges}
              total={snapshot.edges.length}
              displayPrefix={displayPrefix}
            />
          </div>
        ) : null}
      </div>
    </main>
  )
}

export default App
