import type { PackagePanelNodeSnapshot } from '../../types'
import { PackageInfluenceControls } from './PackageInfluenceControls'
import { PackageTreeNodeHeader } from './PackageTreeNodeHeader'
import { getPackageColor } from './graphColors'
import {
  getPackageInfluenceSettings
} from './graphInfluence'
import type { PackageInfluenceConfig, PackageInfluenceSettings } from './types'

type PackageTreeNodeProps = {
  node: PackagePanelNodeSnapshot
  displayPrefix: string | null
  includedPackages: ReadonlySet<string>
  highlightedPackages: ReadonlySet<string>
  showOnlyExternallyImportedPackages: boolean
  onIncludePackage: (packageName: string) => void
  onUnincludePackage: (packageName: string) => void
  onHighlightPackage: (packageName: string) => void
  onUnhighlightPackage: (packageName: string) => void
  onHighlightPackageTree: (packageNames: Iterable<string>) => void
  onUnhighlightPackageTree: (packageNames: Iterable<string>) => void
  packageInfluenceConfig: PackageInfluenceConfig
  onPackageInfluenceChange: (
    packageName: string,
    nextSettings: PackageInfluenceSettings,
  ) => void
  collapsedPackages: ReadonlySet<string>
  onToggleCollapsedPackage: (packageName: string) => void
  depth: number
}

function getContainerClasses(depth: number): string {
  const depthClass =
    depth === 0
      ? 'bg-slate-950/60'
      : depth === 1
        ? 'bg-slate-900/70'
        : 'bg-slate-900/90'

  return [
    'rounded-xl border px-1 py-2 transition',
    depthClass,
    'border-slate-800',
  ].join(' ')
}

function hasAnyHighlightedPackage(
  packageNames: readonly string[],
  highlightedPackages: ReadonlySet<string>,
): boolean {
  return packageNames.some((packageName) => highlightedPackages.has(packageName))
}

function areAllPackagesHighlighted(
  packageNames: readonly string[],
  highlightedPackages: ReadonlySet<string>,
): boolean {
  return packageNames.length > 0
    && packageNames.every((packageName) => highlightedPackages.has(packageName))
}

export function PackageTreeNode({
  node,
  displayPrefix,
  includedPackages,
  highlightedPackages,
  showOnlyExternallyImportedPackages,
  onIncludePackage,
  onUnincludePackage,
  onHighlightPackage,
  onUnhighlightPackage,
  onHighlightPackageTree,
  onUnhighlightPackageTree,
  packageInfluenceConfig,
  onPackageInfluenceChange,
  collapsedPackages,
  onToggleCollapsedPackage,
  depth,
}: PackageTreeNodeProps) {
  const packageName = node.package_name
  const isIncluded = includedPackages.has(packageName)
  const isCollapsed = collapsedPackages.has(packageName)
  const hasChildren = node.children.length > 0

  const eligibleSubtreePackageNames = (
    showOnlyExternallyImportedPackages
      ? node.externally_imported_subtree_package_names
      : node.subtree_package_names
  ).filter((candidate) => includedPackages.has(candidate))

  const packageCanBeHighlighted =
    isIncluded && (
      !showOnlyExternallyImportedPackages || node.is_externally_imported
    )

  const isHighlighted =
    packageCanBeHighlighted && highlightedPackages.has(packageName)

  const isSubtreeHighlighted = areAllPackagesHighlighted(
    eligibleSubtreePackageNames,
    highlightedPackages,
  )

  const isGreyed = !hasAnyHighlightedPackage(
    eligibleSubtreePackageNames,
    highlightedPackages,
  )

  const settings = getPackageInfluenceSettings(
    packageName,
    packageInfluenceConfig,
  )

  function handlePackageHighlightChange(nextChecked: boolean) {
    if (!packageCanBeHighlighted) {
      return
    }

    if (nextChecked) {
      onHighlightPackage(packageName)
      return
    }

    onUnhighlightPackage(packageName)
  }

  function handlePackageIncludeChange(nextChecked: boolean) {
    if (nextChecked) {
      onIncludePackage(packageName)
      return
    }

    onUnincludePackage(packageName)
  }

  function handleSubtreeHighlightChange(nextChecked: boolean) {
    if (eligibleSubtreePackageNames.length === 0) {
      return
    }

    if (nextChecked) {
      onHighlightPackageTree(eligibleSubtreePackageNames)
      return
    }

    onUnhighlightPackageTree(eligibleSubtreePackageNames)
  }

  const packageColor = getPackageColor(packageName)

  return (
    <div
      className={getContainerClasses(depth)}
      style={
        isHighlighted
          ? {
            borderColor: packageColor,
          }
          : undefined
      }
    >
      <PackageTreeNodeHeader
        packageName={packageName}
        displayPrefix={displayPrefix}
        isIncluded={isIncluded}
        isGreyed={isGreyed}
        isHighlighted={isHighlighted}
        isSubtreeHighlighted={isSubtreeHighlighted}
        hasChildren={hasChildren}
        isCollapsed={isCollapsed}
        isHighlightDisabled={!packageCanBeHighlighted}
        isSubtreeHighlightDisabled={eligibleSubtreePackageNames.length === 0}
        onPackageIncludeChange={handlePackageIncludeChange}
        onPackageHighlightChange={handlePackageHighlightChange}
        onSubtreeHighlightChange={handleSubtreeHighlightChange}
        onToggleCollapsedPackage={onToggleCollapsedPackage}
      />

      <PackageInfluenceControls
        packageName={packageName}
        settings={settings}
        onPackageInfluenceChange={onPackageInfluenceChange}
      />

      {hasChildren && !isCollapsed && (
        <div className="mt-3 space-y-3">
          {node.children.map((childNode) => (
            <PackageTreeNode
              key={childNode.package_name}
              node={childNode}
              displayPrefix={displayPrefix}
              includedPackages={includedPackages}
              highlightedPackages={highlightedPackages}
              showOnlyExternallyImportedPackages={
                showOnlyExternallyImportedPackages
              }
              onIncludePackage={onIncludePackage}
              onUnincludePackage={onUnincludePackage}
              onHighlightPackage={onHighlightPackage}
              onUnhighlightPackage={onUnhighlightPackage}
              onHighlightPackageTree={onHighlightPackageTree}
              onUnhighlightPackageTree={onUnhighlightPackageTree}
              packageInfluenceConfig={packageInfluenceConfig}
              onPackageInfluenceChange={onPackageInfluenceChange}
              collapsedPackages={collapsedPackages}
              onToggleCollapsedPackage={onToggleCollapsedPackage}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}
