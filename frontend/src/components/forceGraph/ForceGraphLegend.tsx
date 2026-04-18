import type { ReactNode } from 'react'
import type { PackageSnapshot } from '../../types'
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

type ForceGraphLegendProps = {
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

type PackageTreeNode = {
  packageName: string
  children: PackageTreeNode[]
}

const GREYED_LEGEND_COLOR = '#475569'
const INDENT_PER_LEVEL_PX = 14

function formatMultiplierLabel(multiplier: number): string {
  return `${Math.round(multiplier * 100)}%`
}

function buildPackageTree(packages: PackageSnapshot[]): PackageTreeNode[] {
  const nodesByName = new Map<string, PackageTreeNode>()

  for (const item of packages) {
    nodesByName.set(item.name, {
      packageName: item.name,
      children: [],
    })
  }

  const roots: PackageTreeNode[] = []

  for (const item of packages) {
    const node = nodesByName.get(item.name)
    if (node == null) {
      continue
    }

    if (item.parent == null) {
      roots.push(node)
      continue
    }

    const parentNode = nodesByName.get(item.parent)
    if (parentNode == null) {
      roots.push(node)
      continue
    }

    parentNode.children.push(node)
  }

  sortPackageTreeNodes(roots)
  return roots
}

function sortPackageTreeNodes(nodes: PackageTreeNode[]): void {
  nodes.sort((left, right) => left.packageName.localeCompare(right.packageName))

  for (const node of nodes) {
    sortPackageTreeNodes(node.children)
  }
}

export function ForceGraphLegend({
  packages,
  selectedPackage,
  onPackageSelect,
  displayPrefix,
  packageInfluenceConfig,
  onPackageInfluenceChange,
}: ForceGraphLegendProps) {
  const packageTree = buildPackageTree(packages)

  function renderPackageNode(
    node: PackageTreeNode,
    depth: number,
  ): ReactNode {
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
      <div key={packageName} className="flex flex-col gap-2">
        <div
          className={[
            'rounded-xl border px-3 py-3 transition',
            isSelected
              ? 'border-sky-500 bg-sky-500/10'
              : 'border-slate-800 bg-slate-950/60',
          ].join(' ')}
          style={{ marginLeft: `${depth * INDENT_PER_LEVEL_PX}px` }}
        >
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
            <span className="truncate" title={packageName}>
              {displayName}
            </span>
          </button>

          <div className="mt-3 space-y-2">
            <div className="text-[11px] uppercase tracking-wide text-slate-500">
              Edge influence
            </div>

            <div className="flex flex-wrap gap-2">
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
                      'rounded-lg border px-2 py-1 text-[11px] transition',
                      isActive
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-200'
                        : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500',
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
                className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] text-slate-300 transition hover:border-slate-500"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {node.children.length > 0 && (
          <div className="flex flex-col gap-2">
            {node.children.map((childNode) =>
              renderPackageNode(childNode, depth + 1),
            )}
          </div>
        )}
      </div>
    )
  }

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
          <span className="text-slate-200">Nesting</span> = subpackages grouped under parents
        </div>
      </div>

      <div className="mt-4 border-t border-slate-800 pt-4">
        <div className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
          Package controls
        </div>

        <div className="flex max-h-[500px] flex-col gap-2 overflow-y-auto pr-1">
          {packageTree.map((node) => renderPackageNode(node, 0))}
        </div>
      </div>
    </aside>
  )
}
