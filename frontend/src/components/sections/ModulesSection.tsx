import { CollapsibleCard } from '../CollapsibleCard'
import { DefinitionTable } from '../DefinitionTable'
import { EmptyState } from '../EmptyState'
import { KeyValueList } from '../KeyValueList'
import { SimpleList } from '../SimpleList'
import { joinOrNone } from '../../lib/format'
import type { ModuleSnapshot } from '../../types'

type ModulesSectionProps = {
  modules: ModuleSnapshot[]
  total: number
}

export function ModulesSection({ modules, total }: ModulesSectionProps) {
  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2 className="text-xl font-semibold text-white">Modules</h2>
        <div className="text-sm text-slate-400">
          Showing {modules.length} of {total}
        </div>
      </div>

      <div className="space-y-4">
        {modules.map((item) => (
          <CollapsibleCard
            key={item.name}
            title={item.name}
            subtitle={`package=${item.package} • imports=${item.imports.length} • imported_by=${item.imported_by.length}`}
          >
            <div className="grid gap-6 xl:grid-cols-2">
              <KeyValueList
                title="Metadata"
                items={[
                  ['Package', item.package],
                  ['Imports', String(item.imports.length)],
                  ['Imported by', String(item.imported_by.length)],
                ]}
              />

              <KeyValueList
                title="Importing packages"
                items={[['Packages', joinOrNone(item.importing_packages)]]}
              />

              <SimpleList title="Imports" items={item.imports} />
              <SimpleList title="Imported by" items={item.imported_by} />
            </div>

            <div className="mt-6">
              <DefinitionTable
                title="Observed external interface"
                definitions={item.external_interface}
              />
            </div>
          </CollapsibleCard>
        ))}

        {modules.length === 0 ? (
          <EmptyState label="No modules match the current filter." />
        ) : null}
      </div>
    </section>
  )
}
