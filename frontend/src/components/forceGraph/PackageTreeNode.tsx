import {
  DEFAULT_PACKAGE_INFLUENCE_SETTINGS,
  getPackageInfluenceSettings,
} from './graphInfluence'
import type {
  PackageInfluenceConfig,
  PackageInfluenceSettings,
} from './types'
import type { PackageTreeNode as PackageTreeNodeModel } from './packageTree'
import { PackageInfluenceControls } from './PackageInfluenceControls'
import { PackageTreeNodeHeader } from './PackageTreeNodeHeader'

type PackageTreeNodeProps = {
  node: PackageTreeNodeModel
  displayPrefix: string | null
  highlightedPackages: ReadonlySet<string>
  onTogglePackageHighlight: (packageName: string) => void
  onTogglePackageTreeHighlight: (packageNames: Iterable<string>) => void
  onSelectOnlyPackageHighlight: (packageNames: Iterable<string>) => void
  packageInfluenceConfig: PackageInfluenceConfig
  onPackageInfluenceChange: (
    packageName: string,
    nextSettings: PackageInfluenceSettings,
  ) => void
  collapsedPackages: ReadonlySet<string>
  onToggleCollapsedPackage: (packageName: string) => void
  depth: number
}

function getContainerClasses(depth: number, isHighlighted: boolean): string {
  const depthClass =
    depth === 0
      ? 'bg-slate-950/60'
      : depth === 1
        ? 'bg-slate-900/70'
        : 'bg-slate-900/90'

  return [
    'rounded-xl border p-2 transition',
    depthClass,
    isHighlighted
      ? 'border-sky-500 bg-sky-500/10'
      : 'border-slate-800',
  ].join(' ')
}

function hasAnyHighlightedPackage(
  packageNames: readonly string[],
  highlightedPackages: ReadonlySet<string>,
): boolean {
  return packageNames.some((packageName) => highlightedPackages.has(packageName))
}

export function PackageTreeNode({
  node,
  displayPrefix,
  highlightedPackages,
  onTogglePackageHighlight,
  onTogglePackageTreeHighlight,
  onSelectOnlyPackageHighlight,
  packageInfluenceConfig,
  onPackageInfluenceChange,
  collapsedPackages,
  onToggleCollapsedPackage,
  depth,
}: PackageTreeNodeProps) {
  const packageName = node.packageName
  const subtreePackageNames = node.subtreePackageNames
  const isHighlighted = highlightedPackages.has(packageName)
  const hasHighlights = highlightedPackages.size > 0
  const isGreyed = hasHighlights && !hasAnyHighlightedPackage(subtreePackageNames, highlightedPackages)
  const isCollapsed = collapsedPackages.has(packageName)
  const hasChildren = node.children.length > 0

  const settings = getPackageInfluenceSettings(
    packageName,
    packageInfluenceConfig,
  )

  return (
    <div className={getContainerClasses(depth, isHighlighted)}>
      <PackageTreeNodeHeader
        packageName={packageName}
        displayPrefix={displayPrefix}
        isGreyed={isGreyed}
        isHighlighted={isHighlighted}
        hasChildren={hasChildren}
        isCollapsed={isCollapsed}
        onTogglePackageHighlight={onTogglePackageHighlight}
        onTogglePackageTreeHighlight={() =>
          onTogglePackageTreeHighlight(subtreePackageNames)
        }
        onSelectOnlyPackageHighlight={() =>
          onSelectOnlyPackageHighlight([packageName])
        }
        onToggleCollapsedPackage={onToggleCollapsedPackage}
      />

      <PackageInfluenceControls
        packageName={packageName}
        settings={settings}
        onPackageInfluenceChange={onPackageInfluenceChange}
        onReset={() =>
          onPackageInfluenceChange(
            packageName,
            DEFAULT_PACKAGE_INFLUENCE_SETTINGS,
          )
        }
      />

      {hasChildren && !isCollapsed && (
        <div className="mt-3 space-y-3">
          {node.children.map((childNode) => (
            <PackageTreeNode
              key={childNode.packageName}
              node={childNode}
              displayPrefix={displayPrefix}
              highlightedPackages={highlightedPackages}
              onTogglePackageHighlight={onTogglePackageHighlight}
              onTogglePackageTreeHighlight={onTogglePackageTreeHighlight}
              onSelectOnlyPackageHighlight={onSelectOnlyPackageHighlight}
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
