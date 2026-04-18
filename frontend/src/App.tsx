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
      <div className="mx-auto max-w-6xl mt-4">
        {/* ...existing header/filter/loading/error... */}

        {snapshot ? (
          <>
            <SummarySection snapshot={snapshot} />
            <ForceGraph
              snapshot={snapshot}
              displayPrefix={displayPrefix}
              className="h-[700px] w-full rounded-xl"
            />
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
          </>
        ) : null}
      </div>
    </main>
  )
}

export default App
