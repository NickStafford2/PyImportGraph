import { CollapsibleCard } from '../CollapsibleCard'
import { DefinitionTable } from '../DefinitionTable'
import { EmptyState } from '../EmptyState'
import { KeyValueList } from '../KeyValueList'
import { ModuleName } from '../ModuleName'
import { SimpleList } from '../SimpleList'
import { trimModulePrefix } from '../../lib/moduleName'
import type { PackageSnapshot } from '../../types'

type PackagesSectionProps = {
  packages: PackageSnapshot[]
  total: number
  displayPrefix: string | null
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

      <div className="space-y-4">
        {packages.map((item) => (
          <CollapsibleCard
            key={item.name}
            title={trimModulePrefix(item.name, displayPrefix)}
            subtitle={`children=${item.children.length} • direct_modules=${item.direct_modules.length} • subtree_modules=${item.subtree_modules.length}`}
          >

            <div className="grid gap-6 xl:grid-cols-2">
              <KeyValueList
                title="Metadata"
                items={[
                  [
                    'Parent',
                    item.parent == null
                      ? '(none)'
                      : trimModulePrefix(item.parent, displayPrefix),
                  ],
                  [
                    'Children',
                    item.children.length === 0
                      ? '(none)'
                      : item.children
                        .map((child) =>
                          trimModulePrefix(child, displayPrefix),
                        )
                        .join(', '),
                  ],
                  ['Direct modules', String(item.direct_modules.length)],
                  ['Subtree modules', String(item.subtree_modules.length)],
                ]}
              />

              <KeyValueList
                title="Imported by"
                items={[
                  [
                    'Modules',
                    item.imported_by_modules.length === 0
                      ? '(none)'
                      : item.imported_by_modules
                        .map((name) => trimModulePrefix(name, displayPrefix))
                        .join(', '),
                  ],
                  [
                    'Packages',
                    item.imported_by_packages.length === 0
                      ? '(none)'
                      : item.imported_by_packages
                        .map((name) => trimModulePrefix(name, displayPrefix))
                        .join(', '),
                  ],
                ]}
              />

              <SimpleList
                title="Direct modules"
                items={item.direct_modules}
                formatAsModuleName
                displayPrefix={displayPrefix}
              />
              <SimpleList
                title="Subtree modules"
                items={item.subtree_modules}
                formatAsModuleName
                displayPrefix={displayPrefix}
              />
            </div>

            <div className="mt-6">
              <DefinitionTable
                title="Observed external interface"
                definitions={item.external_interface}
                displayPrefix={displayPrefix}
              />
            </div>
          </CollapsibleCard>
        ))}

        {packages.length === 0 ? (
          <EmptyState label="No packages match the current filter." />
        ) : null}
      </div>
    </section>
  )
}
