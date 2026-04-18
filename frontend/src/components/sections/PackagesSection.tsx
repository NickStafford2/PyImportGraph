import { CollapsibleCard } from '../CollapsibleCard'
import { DefinitionTable } from '../DefinitionTable'
import { EmptyState } from '../EmptyState'
import { ModuleName } from '../ModuleName'
import { SimpleList } from '../SimpleList'
import { toAnchorId } from '../../lib/anchor'
import { trimModulePrefix } from '../../lib/moduleName'
import type { PackageSnapshot } from '../../types'

type PackagesSectionProps = {
  packages: PackageSnapshot[]
  total: number
  displayPrefix: string | null
}

function SummaryStat({
  label,
  value,
}: {
  label: string
  value: string | number
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/50 px-3 py-2">
      <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
        {label}
      </div>
      <div className="mt-1 text-sm font-medium text-slate-200">{value}</div>
    </div>
  )
}

function CommaList({
  items,
  displayPrefix,
}: {
  items: string[]
  displayPrefix: string | null
}) {
  if (items.length === 0) {
    return <span className="text-slate-500">(none)</span>
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="rounded-lg border border-slate-800 bg-slate-950/60 px-2 py-1 text-xs text-slate-300"
          title={item}
        >
          {trimModulePrefix(item, displayPrefix)}
        </span>
      ))}
    </div>
  )
}

export function PackagesSection({
  packages,
  total,
  displayPrefix,
}: PackagesSectionProps) {
  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2 className="text-xl font-semibold text-white">Packages</h2>
        <div className="text-sm text-slate-400">
          Showing {packages.length} of {total}
        </div>
      </div>

      {packages.length === 0 ? (
        <EmptyState label="No packages match the current filter." />
      ) : (
        <div className="space-y-4">
          {packages.map((item) => {
            const displayName = trimModulePrefix(item.name, displayPrefix)

            return (
              <div
                key={item.name}
                id={toAnchorId('package', item.name)}
                className="scroll-mt-6"
              >
                <CollapsibleCard
                  title={displayName}
                  subtitle={[
                    `children=${item.children.length}`,
                    `direct_modules=${item.direct_modules.length}`,
                    `subtree_modules=${item.subtree_modules.length}`,
                    `imported_by_packages=${item.imported_by_packages.length}`,
                  ].join(' • ')}
                >
                  <div className="grid gap-6 xl:grid-cols-2">

                    <div className='flex flex-row w-full'>

                      <div className='flex flex-col w-full'>
                        <SimpleList
                          title="Children Packages:"
                          items={item.children}
                          formatAsModuleName
                          displayPrefix={displayPrefix}
                          className='w-full'
                        />

                        <SimpleList
                          title="Imported by Packages:"
                          items={item.imported_by_packages}
                          formatAsModuleName
                          displayPrefix={displayPrefix}
                          className='w-full'
                        />
                      </div>

                      <SimpleList
                        title="Imported by Modules:"
                        items={item.imported_by_modules}
                        formatAsModuleName
                        displayPrefix={displayPrefix}
                      />

                      <SimpleList
                        title="Direct Modules:"
                        items={item.direct_modules}
                        formatAsModuleName
                        displayPrefix={displayPrefix}
                      />

                      <div className="xl:col-span-2">
                        <SimpleList
                          title="Subtree Modules:"
                          items={item.subtree_modules}
                          formatAsModuleName
                          displayPrefix={displayPrefix}
                        />
                      </div>
                    </div>
                  </div>

                  <DefinitionTable
                    title="Observed external interface"
                    definitions={item.external_interface}
                    displayPrefix={displayPrefix}
                  />
                </CollapsibleCard>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
