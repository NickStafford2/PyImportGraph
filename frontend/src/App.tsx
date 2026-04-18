import { useMemo, useState } from 'react'
import { EdgesSection } from './components/sections/EdgesSection'
import { ModulesSection } from './components/sections/ModulesSection'
import { PackagesSection } from './components/sections/PackagesSection'
// import { SummarySection } from './components/sections/SummarySection'
import { useSnapshot } from './hooks/useSnapshot'
import { matchesEdge, matchesModule, matchesPackage } from './lib/filters'
import { findCommonModulePrefix } from './lib/moduleName'
import { ForceGraph } from './components/forceGraph/ForceGraph'
import { SectionHeader } from './components/SectionHeader'


function App() {
  const [query, setQuery] = useState('')
  const { snapshot, error, loading } = useSnapshot()
  const [currentSection, setCurrentSection] = useState('Summary')

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
      <div className="mx-auto mt-4 flex max-w-7xl flex-col gap-10">
        <SectionHeader />

        {snapshot ? (
          <>

            <section id="graph" className="scroll-mt-20">
              <ForceGraph
                snapshot={snapshot}
                displayPrefix={displayPrefix}
                className="h-[700px] w-full rounded-xl"
              />
            </section>

            <section id="packages" className="scroll-mt-20">
              <PackagesSection
                packages={filteredPackages}
                total={snapshot.packages.length}
                displayPrefix={displayPrefix}
              />
            </section>

            <section id="modules" className="scroll-mt-20">
              <ModulesSection
                modules={filteredModules}
                total={snapshot.modules.length}
                displayPrefix={displayPrefix}
              />
            </section>

            <section id="edges" className="scroll-mt-20">
              <EdgesSection
                edges={filteredEdges}
                total={snapshot.edges.length}
                displayPrefix={displayPrefix}
              />
            </section>
          </>
        ) : null}
      </div>
    </main>
  )
}

export default App
