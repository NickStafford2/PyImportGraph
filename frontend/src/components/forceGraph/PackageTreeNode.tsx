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
  onHighlightPackage: (packageName: string) => void
  onUnhighlightPackage: (packageName: string) => void
  onHighlightPackageTree: (packageNames: Iterable<string>) => void
  onUnhighlightPackageTree: (packageNames: Iterable<string>) => void
  onHighlightOnlyPackage: (packageNames: Iterable<string>) => void
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
  onHighlightPackage,
  onUnhighlightPackage,
  onHighlightPackageTree,
  onUnhighlightPackageTree,
  onHighlightOnlyPackage,
  packageInfluenceConfig,
  onPackageInfluenceChange,
  collapsedPackages,
  onToggleCollapsedPackage,
  depth,
}: PackageTreeNodeProps) {
  const packageName = node.packageName
  const subtreePackageNames = node.subtreePackageNames
  const isHighlighted = highlightedPackages.has(packageName)
  const isGreyed = !hasAnyHighlightedPackage(
    subtreePackageNames,
    highlightedPackages,
  )
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
        onHighlightPackage={onHighlightPackage}
        onUnhighlightPackage={onUnhighlightPackage}
        onHighlightPackageTree={() => onHighlightPackageTree(subtreePackageNames)}
        onUnhighlightPackageTree={() =>
          onUnhighlightPackageTree(subtreePackageNames)
        }
        onHighlightOnlyPackage={() => onHighlightOnlyPackage([packageName])}
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
              onHighlightPackage={onHighlightPackage}
              onUnhighlightPackage={onUnhighlightPackage}
              onHighlightPackageTree={onHighlightPackageTree}
              onUnhighlightPackageTree={onUnhighlightPackageTree}
              onHighlightOnlyPackage={onHighlightOnlyPackage}
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
