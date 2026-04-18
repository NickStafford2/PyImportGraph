import { CollapsibleCard } from '../CollapsibleCard'
import { DefinitionTable } from '../DefinitionTable'
import { EmptyState } from '../EmptyState'
import { KeyValueList } from '../KeyValueList'
import { SimpleList } from '../SimpleList'
import { joinOrNone } from '../../lib/format'
import type { PackageSnapshot } from '../../types'

type PackagesSectionProps = {
  packages: PackageSnapshot[]
  total: number
}

export function PackagesSection({
  packages,
  total,
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

        {packages.length === 0 ? (
          <EmptyState label="No packages match the current filter." />
        ) : null}
      </div>
    </section>
  )
}
