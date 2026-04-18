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

export function PackageTreeNode({
  node,
  displayPrefix,
  highlightedPackages,
  onTogglePackageHighlight,
  packageInfluenceConfig,
  onPackageInfluenceChange,
  collapsedPackages,
  onToggleCollapsedPackage,
  depth,
}: PackageTreeNodeProps) {
  const packageName = node.packageName
  const isHighlighted = highlightedPackages.has(packageName)
  const hasHighlights = highlightedPackages.size > 0
  const isGreyed = hasHighlights && !isHighlighted
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
