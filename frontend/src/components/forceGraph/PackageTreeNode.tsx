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
  selectedPackage: string | null
  onPackageSelect: (packageName: string) => void
  packageInfluenceConfig: PackageInfluenceConfig
  onPackageInfluenceChange: (
    packageName: string,
    nextSettings: PackageInfluenceSettings,
  ) => void
  depth: number
}

function getContainerClasses(depth: number, isSelected: boolean): string {
  const depthClass =
    depth === 0
      ? 'bg-slate-950/60'
      : depth === 1
        ? 'bg-slate-900/70'
        : 'bg-slate-900/90'

  return [
    'rounded-xl border p-2 transition',
    depthClass,
    isSelected
      ? 'border-sky-500 bg-sky-500/10'
      : 'border-slate-800',
  ].join(' ')
}

export function PackageTreeNode({
  node,
  displayPrefix,
  selectedPackage,
  onPackageSelect,
  packageInfluenceConfig,
  onPackageInfluenceChange,
  depth,
}: PackageTreeNodeProps) {
  const packageName = node.packageName
  const isSelected = selectedPackage === packageName
  const isGreyed =
    selectedPackage != null && selectedPackage !== packageName

  const settings = getPackageInfluenceSettings(
    packageName,
    packageInfluenceConfig,
  )

  return (
    <div className={getContainerClasses(depth, isSelected)}>
      <PackageTreeNodeHeader
        packageName={packageName}
        displayPrefix={displayPrefix}
        isGreyed={isGreyed}
        onPackageSelect={onPackageSelect}
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

      {node.children.length > 0 && (
        <div className="mt-3">
          {node.children.map((childNode) => (
            <PackageTreeNode
              key={childNode.packageName}
              node={childNode}
              displayPrefix={displayPrefix}
              selectedPackage={selectedPackage}
              onPackageSelect={onPackageSelect}
              packageInfluenceConfig={packageInfluenceConfig}
              onPackageInfluenceChange={onPackageInfluenceChange}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}
