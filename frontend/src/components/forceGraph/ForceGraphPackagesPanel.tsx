import type { PackagePanelNodeSnapshot, PackageSnapshot } from '../../types'
import type { PackageColorMap } from './graphColors'
import { ForceGraphPackagesPanelHeader } from './ForceGraphPackagesPanelHeader'
import type {
  PackageInfluenceConfig,
  PackageInfluenceSettings,
} from './types'
import { PackageTreeNode } from './PackageTreeNode'

type ForceGraphPackagesPanelProps = {
  roots: PackagePanelNodeSnapshot[]
  packages: PackageSnapshot[]
  displayPrefix: string | null
  packageColorMap: PackageColorMap
  includedPackages: ReadonlySet<string>
  highlightedPackages: ReadonlySet<string>
  showOnlyExternallyImportedIncludedPackages: boolean
  showOnlyExternallyImportedPackages: boolean
  onIncludePackage: (packageName: string) => void
  onUnincludePackage: (packageName: string) => void
  onIncludePackageTree: (packageNames: Iterable<string>) => void
  onUnincludePackageTree: (packageNames: Iterable<string>) => void
  onShowOnlyExternallyImportedIncludedPackagesChange: (value: boolean) => void
  onShowOnlyExternallyImportedPackagesChange: (value: boolean) => void
  onHighlightPackage: (packageName: string) => void
  onUnhighlightPackage: (packageName: string) => void
  onHighlightPackageTree: (packageNames: Iterable<string>) => void
  onUnhighlightPackageTree: (packageNames: Iterable<string>) => void
  onIncludeAllPackages: () => void
  onExcludeAllPackages: () => void
  onHighlightAllPackages: () => void
  onUnhighlightAllPackages: () => void
  packageInfluenceConfig: PackageInfluenceConfig
  onPackageInfluenceChange: (
    packageName: string,
    nextSettings: PackageInfluenceSettings,
  ) => void
  collapsedPackages: ReadonlySet<string>
  onToggleCollapsedPackage: (packageName: string) => void
  onExpandAllPackages: () => void
  onCollapseAllPackages: () => void
}

export function ForceGraphPackagesPanel({
  roots,
  packages,
  displayPrefix,
  packageColorMap,
  includedPackages,
  highlightedPackages,
  showOnlyExternallyImportedIncludedPackages,
  showOnlyExternallyImportedPackages,
  onIncludePackage,
  onUnincludePackage,
  onIncludePackageTree,
  onUnincludePackageTree,
  onShowOnlyExternallyImportedIncludedPackagesChange,
  onShowOnlyExternallyImportedPackagesChange,
  onHighlightPackage,
  onUnhighlightPackage,
  onHighlightPackageTree,
  onUnhighlightPackageTree,
  onIncludeAllPackages,
  onExcludeAllPackages,
  onHighlightAllPackages,
  onUnhighlightAllPackages,
  packageInfluenceConfig,
  onPackageInfluenceChange,
  collapsedPackages,
  onToggleCollapsedPackage,
  onExpandAllPackages,
  onCollapseAllPackages,
}: ForceGraphPackagesPanelProps) {
  const includedCount = includedPackages.size
  const highlightedCount = highlightedPackages.size
  const totalCount = packages.length
  const externallyImportedCount = packages.filter(
    (item) => item.is_externally_imported,
  ).length

  return (
    <aside className="flex max-h-[700px] flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-900/70">
      <ForceGraphPackagesPanelHeader
        includedCount={includedCount}
        highlightedCount={highlightedCount}
        totalCount={totalCount}
        externallyImportedCount={externallyImportedCount}
        showOnlyExternallyImportedIncludedPackages={
          showOnlyExternallyImportedIncludedPackages
        }
        showOnlyExternallyImportedPackages={showOnlyExternallyImportedPackages}
        onShowOnlyExternallyImportedIncludedPackagesChange={
          onShowOnlyExternallyImportedIncludedPackagesChange
        }
        onShowOnlyExternallyImportedPackagesChange={
          onShowOnlyExternallyImportedPackagesChange
        }
        onIncludeAllPackages={onIncludeAllPackages}
        onExcludeAllPackages={onExcludeAllPackages}
        onHighlightAllPackages={onHighlightAllPackages}
        onUnhighlightAllPackages={onUnhighlightAllPackages}
        onExpandAllPackages={onExpandAllPackages}
        onCollapseAllPackages={onCollapseAllPackages}
      />

      <div className="flex-1 overflow-y-auto p-3 pr-2">
        <div className="space-y-3">
          {roots.map((node) => (
            <PackageTreeNode
              key={node.package_name}
              node={node}
              displayPrefix={displayPrefix}
              packageColorMap={packageColorMap}
              includedPackages={includedPackages}
              highlightedPackages={highlightedPackages}
              showOnlyExternallyImportedPackages={showOnlyExternallyImportedPackages}
              onIncludePackage={onIncludePackage}
              onUnincludePackage={onUnincludePackage}
              onIncludePackageTree={onIncludePackageTree}
              onUnincludePackageTree={onUnincludePackageTree}
              onHighlightPackage={onHighlightPackage}
              onUnhighlightPackage={onUnhighlightPackage}
              onHighlightPackageTree={onHighlightPackageTree}
              onUnhighlightPackageTree={onUnhighlightPackageTree}
              packageInfluenceConfig={packageInfluenceConfig}
              onPackageInfluenceChange={onPackageInfluenceChange}
              collapsedPackages={collapsedPackages}
              onToggleCollapsedPackage={onToggleCollapsedPackage}
              depth={0}
            />
          ))}
        </div>
      </div>
    </aside>
  )
}
