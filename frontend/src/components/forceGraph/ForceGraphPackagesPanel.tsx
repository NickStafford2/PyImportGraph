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
    <aside className="rounded-2xl border border-slate-700 bg-slate-900/70 flex max-h-[700px] flex-col gap-3 overflow-y-auto pr-1">
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
    </aside>
  )
}
