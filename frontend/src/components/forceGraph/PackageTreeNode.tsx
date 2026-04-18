import { trimModulePrefix } from '../../lib/moduleName'
import { getPackageColor } from './graphColors'
import {
  DEFAULT_PACKAGE_INFLUENCE_SETTINGS,
  PACKAGE_INFLUENCE_MULTIPLIER_OPTIONS,
  getPackageInfluenceSettings,
} from './graphInfluence'
import type {
  PackageInfluenceConfig,
  PackageInfluenceSettings,
} from './types'
import type { PackageTreeNode as PackageTreeNodeModel } from './packageTree'

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

const GREYED_LEGEND_COLOR = '#475569'

function formatMultiplierLabel(multiplier: number): string {
  return `${Math.round(multiplier * 100)}%`
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
  const displayName = trimModulePrefix(packageName, displayPrefix)
  const settings = getPackageInfluenceSettings(
    packageName,
    packageInfluenceConfig,
  )

  return (
    <div className={getContainerClasses(depth, isSelected)}>
      <button
        type="button"
        onClick={() => onPackageSelect(packageName)}
        className={[
          'flex w-full items-center gap-2 text-left text-xs',
          isGreyed ? 'text-slate-500' : 'text-slate-200',
        ].join(' ')}
        title={packageName}
      >
        <span
          className="h-3 w-3 shrink-0 rounded-full"
          style={{
            backgroundColor: isGreyed
              ? GREYED_LEGEND_COLOR
              : getPackageColor(packageName),
          }}
        />
        <span className="truncate font-medium" title={packageName}>
          {displayName}
        </span>
      </button>

      <div className="mt-3 space-y-2">
        <div className="text-[11px] uppercase tracking-wide text-slate-500">
          Edge influence
        </div>

        <div className="flex flex-wrap gap-1">
          {PACKAGE_INFLUENCE_MULTIPLIER_OPTIONS.map((multiplier) => {
            const isActive =
              settings.edgeStrengthMultiplier === multiplier &&
              settings.edgeVisibilityMultiplier === multiplier

            return (
              <button
                key={multiplier}
                type="button"
                onClick={() =>
                  onPackageInfluenceChange(packageName, {
                    edgeStrengthMultiplier: multiplier,
                    edgeVisibilityMultiplier: multiplier,
                  })
                }
                className={[
                  'rounded-lg border px-1 py-1 text-[10px] transition',
                  isActive
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-200'
                    : 'border-slate-700 bg-slate-950/70 text-slate-300 hover:border-slate-500',
                ].join(' ')}
              >
                {formatMultiplierLabel(multiplier)}
              </button>
            )
          })}

          <button
            type="button"
            onClick={() =>
              onPackageInfluenceChange(
                packageName,
                DEFAULT_PACKAGE_INFLUENCE_SETTINGS,
              )
            }
            className="rounded-lg border border-slate-700 bg-slate-950/70 px-2 py-1 text-[11px] text-slate-300 transition hover:border-slate-500"
          >
            Reset
          </button>
        </div>
      </div>

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
