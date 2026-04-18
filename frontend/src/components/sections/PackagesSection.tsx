import { CollapsibleCard } from '../CollapsibleCard'
import { DefinitionTable } from '../DefinitionTable'
import { EmptyState } from '../EmptyState'
import { SimpleList } from '../SimpleList'
import { toAnchorId } from '../../lib/anchor'
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

                  <div className='flex flex-col gap-10 flex-wrap'>
                    <div className='flex flex-row w-full gap-10'>

                      <div className='flex flex-col w-fit gap-3'>
                        <h2 className='text-xl'>Packages</h2>
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


                      <div className='flex flex-col gap-3'>
                        <h2 className='text-xl'>Models</h2>
                        <div className='flex flex-row gap-3'>
                          <SimpleList
                            title="Imported by Modules:"
                            items={item.imported_by_modules}
                            formatAsModuleName
                            displayPrefix={displayPrefix}
                          />

                          <SimpleList
                            title="Direct Child Modules:"
                            items={item.direct_modules}
                            formatAsModuleName
                            displayPrefix={displayPrefix}
                          />

                          <div className="xl:col-span-2">
                            <SimpleList
                              title="Subtree Child Modules:"
                              items={item.subtree_modules}
                              formatAsModuleName
                              displayPrefix={displayPrefix}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className='flex flex-col gap-3'>
                      <h2 className='text-xl'>Observed External Interface</h2>
                      <DefinitionTable
                        definitions={item.external_interface}
                        displayPrefix={displayPrefix}
                      />
                    </div>
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
