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
                  <div className="space-y-6">
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                      <SummaryStat
                        label="Parent"
                        value={
                          item.parent == null
                            ? '(none)'
                            : trimModulePrefix(item.parent, displayPrefix)
                        }
                      />
                      <SummaryStat
                        label="Children"
                        value={item.children.length}
                      />
                      <SummaryStat
                        label="Direct modules"
                        value={item.direct_modules.length}
                      />
                      <SummaryStat
                        label="Subtree modules"
                        value={item.subtree_modules.length}
                      />
                      <SummaryStat
                        label="Imported by packages"
                        value={item.imported_by_packages.length}
                      />
                    </div>

                    <div className="grid gap-6 xl:grid-cols-2">
                      <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                        <h3 className="mb-3 text-sm font-semibold text-white">
                          Children
                        </h3>
                        <CommaList
                          items={item.children}
                          displayPrefix={displayPrefix}
                        />
                      </div>

                      <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                        <h3 className="mb-3 text-sm font-semibold text-white">
                          Imported by packages
                        </h3>
                        <CommaList
                          items={item.imported_by_packages}
                          displayPrefix={displayPrefix}
                        />
                      </div>

                      <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                        <h3 className="mb-3 text-sm font-semibold text-white">
                          Imported by modules
                        </h3>
                        {item.imported_by_modules.length === 0 ? (
                          <div className="text-sm text-slate-500">(none)</div>
                        ) : (
                          <div className="columns-1 gap-3 sm:columns-2">
                            {item.imported_by_modules.map((name) => (
                              <div
                                key={name}
                                className="mb-2 break-inside-avoid rounded-lg px-3 py-1 text-sm text-slate-300"
                              >
                                <ModuleName
                                  name={name}
                                  prefix={displayPrefix}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <SimpleList
                        title="Direct modules"
                        items={item.direct_modules}
                        formatAsModuleName
                        displayPrefix={displayPrefix}
                      />

                      <div className="xl:col-span-2">
                        <SimpleList
                          title="Subtree modules"
                          items={item.subtree_modules}
                          formatAsModuleName
                          displayPrefix={displayPrefix}
                        />
                      </div>
                    </div>

                    <DefinitionTable
                      title="Observed external interface"
                      definitions={item.external_interface}
                      displayPrefix={displayPrefix}
                    />
                  </div>
                </CollapsibleCard>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
