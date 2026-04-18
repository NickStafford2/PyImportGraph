import type { PackageSnapshot } from '../../types'
import type {
  PackageInfluenceConfig,
  PackageInfluenceSettings,
} from './types'
import { buildPackageTree } from './packageTree'
import { PackageTreeNode } from './PackageTreeNode'

type ForceGraphPackagesPanelProps = {
  packages: PackageSnapshot[]
  displayPrefix: string | null
  selectedPackage: string | null
  onPackageSelect: (packageName: string) => void
  packageInfluenceConfig: PackageInfluenceConfig
  onPackageInfluenceChange: (
    packageName: string,
    nextSettings: PackageInfluenceSettings,
  ) => void
}

export function ForceGraphPackagesPanel({
  packages,
  displayPrefix,
  selectedPackage,
  onPackageSelect,
  packageInfluenceConfig,
  onPackageInfluenceChange,
}: ForceGraphPackagesPanelProps) {
  const packageTree = buildPackageTree(packages)

  return (
    <aside className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
      <h3 className="text-sm font-semibold text-white">Packages</h3>

      <div className="mt-3 space-y-2 text-xs text-slate-400">
        <div>
          <span className="text-slate-200">Click package name</span> = highlight
        </div>
        <div>
          <span className="text-slate-200">Influence buttons</span> = change edge pull and visual weight
        </div>
        <div>
          <span className="text-slate-200">Nested cards</span> = real package containment
        </div>
      </div>

      <div className="mt-4 border-t border-slate-800 pt-4">
        <div className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
          Package controls
        </div>

        <div className="flex max-h-[620px] flex-col gap-3 overflow-y-auto pr-1">
          {packageTree.map((node) => (
            <PackageTreeNode
              key={node.packageName}
              node={node}
              displayPrefix={displayPrefix}
              selectedPackage={selectedPackage}
              onPackageSelect={onPackageSelect}
              packageInfluenceConfig={packageInfluenceConfig}
              onPackageInfluenceChange={onPackageInfluenceChange}
              depth={0}
            />
          ))}
        </div>
      </div>
    </aside>
  )
}
