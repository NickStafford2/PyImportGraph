import { useMemo, useState, useEffect } from 'react'
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

  useEffect(() => {
    if (!snapshot) {
      return
    }

    const sections = [
      { id: 'summary', label: 'Summary' },
      { id: 'graph', label: '3D Graph' },
      { id: 'packages', label: 'Packages' },
      { id: 'modules', label: 'Modules' },
      { id: 'edges', label: 'Edges' },
    ]

    function updateCurrentSection() {
      const headerOffset = 90

      let currentLabel = sections[0].label
      let bestTop = Number.NEGATIVE_INFINITY

      for (const section of sections) {
        const element = document.getElementById(section.id)
        if (element == null) {
          continue
        }

        const top = element.getBoundingClientRect().top

        if (top - headerOffset <= 0 && top > bestTop) {
          bestTop = top
          currentLabel = section.label
        }
      }

      setCurrentSection(currentLabel)
    }

    updateCurrentSection()

    window.addEventListener('scroll', updateCurrentSection, { passive: true })
    window.addEventListener('resize', updateCurrentSection)

    return () => {
      window.removeEventListener('scroll', updateCurrentSection)
      window.removeEventListener('resize', updateCurrentSection)
    }
  }, [snapshot])
  return (
    <main className="min-h-screen bg-slate-950 scroll-smooth">
      <div className="mx-auto max-w-7xl mt-4 flex flex-col gap-10">
        <div className="sticky top-0 z-40 mb-4 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
          <div className="px-1 py-3 text-sm text-slate-400">
            Viewing: <span className="font-medium text-white">{currentSection}</span>
          </div>
        </div>
        {/* ...existing header/filter/loading/error... */}

        {snapshot ? (
          <>
            <section id="summary" className="scroll-mt-20">
              <SummarySection snapshot={snapshot} />
            </section>

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
