// frontend/src/components/forceGraph/ForceGraphPackagesPanel.tsx

import type { PackageSnapshot } from '../../types'
import { ToggleSwitch } from './ToggleSwitch'
import type {
  PackageInfluenceConfig,
  PackageInfluenceSettings,
} from './types'
import { buildPackageTree } from './packageTree'
import { PackageTreeNode } from './PackageTreeNode'

type ForceGraphPackagesPanelProps = {
  packages: PackageSnapshot[]
  displayPrefix: string | null
  highlightedPackages: ReadonlySet<string>
  packagesWithExternalImporters: ReadonlySet<string>
  showOnlyExternallyImportedPackages: boolean
  onShowOnlyExternallyImportedPackagesChange: (value: boolean) => void
  onHighlightPackage: (packageName: string) => void
  onUnhighlightPackage: (packageName: string) => void
  onHighlightPackageTree: (packageNames: Iterable<string>) => void
  onUnhighlightPackageTree: (packageNames: Iterable<string>) => void
  onHighlightOnlyPackage: (packageNames: Iterable<string>) => void
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
  packages,
  displayPrefix,
  highlightedPackages,
  packagesWithExternalImporters,
  showOnlyExternallyImportedPackages,
  onShowOnlyExternallyImportedPackagesChange,
  onHighlightPackage,
  onUnhighlightPackage,
  onHighlightPackageTree,
  onUnhighlightPackageTree,
  onHighlightOnlyPackage,
  onHighlightAllPackages,
  onUnhighlightAllPackages,
  packageInfluenceConfig,
  onPackageInfluenceChange,
  collapsedPackages,
  onToggleCollapsedPackage,
  onExpandAllPackages,
  onCollapseAllPackages,
}: ForceGraphPackagesPanelProps) {
  const packageTree = buildPackageTree(packages)
  const highlightedCount = highlightedPackages.size
  const totalCount = packages.length
  const externallyImportedCount = packagesWithExternalImporters.size

  return (
    <aside className="flex max-h-[700px] flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-900/70">
      <div className="border-b border-slate-800 px-3 py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex w-full flex-row justify-between">
            <h3 className="text-md font-semibold text-white">Packages</h3>
            <span className="mt-1 text-xs text-slate-400">
              {highlightedCount} of {totalCount} highlighted
            </span>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950/60 px-2 py-2">
          <div className="min-w-0">
            <div className="text-[11px] font-medium uppercase tracking-wide text-slate-300">
              Only highlight externally imported
            </div>
            <div className="text-[11px] text-slate-500">
              Keeps {externallyImportedCount} package
              {externallyImportedCount === 1 ? '' : 's'} highlighted
            </div>
          </div>

          <ToggleSwitch
            checked={showOnlyExternallyImportedPackages}
            onChange={onShowOnlyExternallyImportedPackagesChange}
            ariaLabel="Only highlight packages imported outside their own package"
            title="Only highlight packages imported outside their own package"
          />
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onHighlightAllPackages}
            disabled={highlightedCount === totalCount}
            className="rounded-lg border border-slate-700 bg-slate-950/70 px-2 py-1 text-[11px] text-slate-300 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Highlight all
          </button>
          <button
            type="button"
            onClick={onUnhighlightAllPackages}
            disabled={highlightedCount === 0}
            className="rounded-lg border border-slate-700 bg-slate-950/70 px-2 py-1 text-[11px] text-slate-300 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Unhighlight all
          </button>
          <button
            type="button"
            onClick={onExpandAllPackages}
            className="rounded-lg border border-slate-700 bg-slate-950/70 px-2 py-1 text-[11px] text-slate-300 transition hover:border-slate-500"
          >
            Expand all
          </button>
          <button
            type="button"
            onClick={onCollapseAllPackages}
            className="rounded-lg border border-slate-700 bg-slate-950/70 px-2 py-1 text-[11px] text-slate-300 transition hover:border-slate-500"
          >
            Collapse all
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 pr-2">
        <div className="space-y-3">
          {packageTree.map((node) => (
            <PackageTreeNode
              key={node.packageName}
              node={node}
              displayPrefix={displayPrefix}
              highlightedPackages={highlightedPackages}
              packagesWithExternalImporters={packagesWithExternalImporters}
              showOnlyExternallyImportedPackages={showOnlyExternallyImportedPackages}
              onHighlightPackage={onHighlightPackage}
              onUnhighlightPackage={onUnhighlightPackage}
              onHighlightPackageTree={onHighlightPackageTree}
              onUnhighlightPackageTree={onUnhighlightPackageTree}
              onHighlightOnlyPackage={onHighlightOnlyPackage}
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
