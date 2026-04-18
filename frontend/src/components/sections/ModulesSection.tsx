import { CollapsibleCard } from '../CollapsibleCard'
import { DefinitionTable } from '../DefinitionTable'
import { EmptyState } from '../EmptyState'
import { KeyValueList } from '../KeyValueList'
import { SimpleList } from '../SimpleList'
import type { ModuleSnapshot } from '../../types'
import { toAnchorId } from '../../lib/anchor'

type ModulesSectionProps = {
  modules: ModuleSnapshot[]
  total: number
  displayPrefix: string | null
}

export function ModulesSection({ modules, total, displayPrefix }: ModulesSectionProps) {
  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2 className="text-xl font-semibold text-white">Modules</h2>
        <div className="text-sm text-slate-400">
          Showing {modules.length} of {total}
        </div>
      </div>

      <div className="space-y-2">
        {modules.map((item) => (
          <div
            id={toAnchorId('module', item.name)}
            className="scroll-mt-6"
          >
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

                <SimpleList
                  title="Imports packages"
                  items={item.importing_packages}
                  formatAsModuleName
                  displayPrefix={displayPrefix}
                  anchorKind='package'
                />

                todo: what kind of imports are these?
                <SimpleList
                  title="Imports"
                  items={item.imports}
                  formatAsModuleName
                  displayPrefix={displayPrefix}
                />

                todo: what kind of imports are these?
                <SimpleList
                  title="Imported by"
                  items={item.imported_by}
                  formatAsModuleName
                  displayPrefix={displayPrefix}
                />
              </div>

              <h1>Observed External Interface</h1>
              <div className="mt-6">
                <DefinitionTable
                  definitions={item.external_interface}
                  displayPrefix={displayPrefix}
                />
              </div>
            </CollapsibleCard>
          </div>
        ))}

        {modules.length === 0 ? (
          <EmptyState label="No modules match the current filter." />
        ) : null}
      </div>
    </section>
  )
}
