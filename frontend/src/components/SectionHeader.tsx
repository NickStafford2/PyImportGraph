import { useEffect, useState } from 'react'

const SECTIONS = [
  { id: 'graph', label: 'Force Graph' },
  { id: 'packages', label: 'Packages' },
  { id: 'modules', label: 'Modules' },
  { id: 'edges', label: 'Edges' },
] as const

export function SectionHeader() {
  type SectionLabel = (typeof SECTIONS)[number]['label']

  const [currentSection, setCurrentSection] = useState<SectionLabel>('Force Graph')

  useEffect(() => {
    let ticking = false

    function updateCurrentSection() {
      const headerOffset = 90

      let nextLabel: SectionLabel = SECTIONS[0].label
      let bestTop = Number.NEGATIVE_INFINITY

      for (const section of SECTIONS) {
        const element = document.getElementById(section.id)
        if (element == null) {
          continue
        }

        const top = element.getBoundingClientRect().top

        if (top - headerOffset <= 0 && top > bestTop) {
          bestTop = top
          nextLabel = section.label
        }
      }

      setCurrentSection((current) =>
        current === nextLabel ? current : nextLabel,
      )
    }

    function handleScroll() {
      if (ticking) {
        return
      }

      ticking = true

      window.requestAnimationFrame(() => {
        updateCurrentSection()
        ticking = false
      })
    }

    updateCurrentSection()

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [])

  return (
    <div className="sticky top-0 z-40 mb-4 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-3 text-sm text-slate-400">
        <div className="flex flex-col">
          <h1 className="mb-4 text-6xl font-semibold text-white">
            Package Name Here
          </h1>
        </div>

        <div className="flex items-center gap-3 text-sm">
          {SECTIONS.map((section) => {
            const isActive = currentSection === section.label

            return (
              <a
                key={section.id}
                href={`#${section.id}`}
                className={[
                  'min-w-[9rem] rounded-lg px-5 py-3 text-center transition-colors',
                  isActive
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-white',
                ].join(' ')}
              >
                {section.label}
              </a>
            )
          })}
        </div>
      </div>
    </div>
  )
}
