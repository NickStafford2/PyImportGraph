import { useEffect, useMemo, useState } from 'react'
import type { PackageSnapshot, ProjectSnapshot } from '../../types'
import { ForceGraphCanvas } from './ForceGraphCanvas'
import { ForceGraphPackagesPanel } from './ForceGraphPackagesPanel'
import { buildPackageColorMap } from './graphColors'
import { buildGraphData } from './graphDisplay'
import {
  buildDefaultEdgeRelationshipConfig,
  EDGE_RELATIONSHIP_BASE_DISTANCE_OPTIONS,
  EDGE_RELATIONSHIP_BASE_STRENGTH_OPTIONS,
  EDGE_RELATIONSHIP_MULTIPLIER_OPTIONS,
  type EdgeRelationshipConfig,
  type EdgeRelationshipSettings,
  getLinkPackageRelationship,
  LINK_PACKAGE_RELATIONSHIPS,
  type LinkPackageRelationship,
} from './graphRelationships'
import { MultiplierSlider } from './MultiplierSlider'
import { ToggleSwitch } from './ToggleSwitch'
import { useForceGraphState } from './useForceGraphState'

type ForceGraphProps = {
  snapshot: ProjectSnapshot
  displayPrefix: string | null
  className?: string
}

const EDGE_RELATIONSHIP_COPY: Record<
  LinkPackageRelationship,
  { label: string; description: string }
> = {
  same_package: {
    label: 'Same package',
    description: 'Imports between modules in the exact same package.',
  },
  subpackage: {
    label: 'Subpackage',
    description: 'Imports between a package and one of its descendants.',
  },
  cross_package: {
    label: 'Cross package',
    description: 'Imports between separate package branches.',
  },
  direct_child_package: {
    label: 'Direct child package',
    description:
      'Structural edges from a package root to its immediate child package root.',
  },
  sibling_package: {
    label: 'Sibling package',
    description:
      'Structural edges between packages that share the same direct parent.',
  },
  sibling_module: {
    label: 'Sibling module',
    description:
      'Structural edges between direct peer modules in the same package.',
  },
}

function formatStrengthValue(value: number): string {
  return value.toFixed(2).replace(/\.?0+$/, '')
}

function formatDistanceValue(value: number): string {
  return `${Math.round(value)}`
}

export function ForceGraph({
  snapshot,
  displayPrefix,
  className,
}: ForceGraphProps) {
  const packages: PackageSnapshot[] = snapshot.packages

  const {
    includedPackages,
    includePackage,
    unincludePackage,
    includePackages,
    unincludePackages,
    includeOnlyPackages,
    includeAllPackages,
    excludeAllPackages,
    highlightedPackages,
    highlightPackage,
    unhighlightPackage,
    highlightPackages,
    unhighlightPackages,
    highlightOnlyPackages,
    highlightAllPackages,
    unhighlightAllPackages,
    highlightMutualPackageDependenciesOnly,
    setHighlightMutualPackageDependenciesOnly,
    packageInfluenceConfig,
    updatePackageInfluence,
    collapsedPackages,
    toggleCollapsedPackage,
    expandAllPackages,
    collapseAllPackages,
  } = useForceGraphState({ packages })

  const [showOnlyExternallyImportedPackages, setShowOnlyExternallyImportedPackages] =
    useState(false)
  const [showOnlyExternallyImportedIncludedPackages, setShowOnlyExternallyImportedIncludedPackages] =
    useState(false)
  const [edgeRelationshipConfig, setEdgeRelationshipConfig] =
    useState<EdgeRelationshipConfig>(buildDefaultEdgeRelationshipConfig)

  const packagesWithExternalImporters = useMemo(() => {
    return new Set(snapshot.package_panel.externally_imported_package_names)
  }, [snapshot.package_panel.externally_imported_package_names])
  const rootPackageNames = useMemo(
    () => snapshot.package_panel.roots.map((root) => root.package_name),
    [snapshot.package_panel.roots],
  )
  const packageColorMap = useMemo(
    () => buildPackageColorMap(packages, rootPackageNames),
    [packages, rootPackageNames],
  )

  useEffect(() => {
    if (showOnlyExternallyImportedIncludedPackages) {
      includeOnlyPackages(packagesWithExternalImporters)
      return
    }

    includeAllPackages()
  }, [
    showOnlyExternallyImportedIncludedPackages,
    packagesWithExternalImporters,
    includeOnlyPackages,
    includeAllPackages,
  ])

  useEffect(() => {
    if (showOnlyExternallyImportedPackages) {
      highlightOnlyPackages(packagesWithExternalImporters)
      return
    }

    highlightAllPackages()
  }, [
    showOnlyExternallyImportedPackages,
    packagesWithExternalImporters,
    highlightOnlyPackages,
    highlightAllPackages,
  ])

  const fullGraphData = useMemo(
    () => buildGraphData(snapshot.force_graph),
    [snapshot.force_graph],
  )
  const graphData = useMemo(() => {
    const nodes = fullGraphData.nodes.filter((node) =>
      includedPackages.has(node.package_name),
    )
    const includedNodeIds = new Set(nodes.map((node) => node.module_name))

    return {
      nodes,
      links: fullGraphData.links.filter(
        (link) =>
          includedPackages.has(link.source_package_name) &&
          includedPackages.has(link.target_package_name) &&
          includedNodeIds.has(link.source_module_name) &&
          includedNodeIds.has(link.target_module_name) &&
          edgeRelationshipConfig[getLinkPackageRelationship(link)].included,
      ),
    }
  }, [edgeRelationshipConfig, fullGraphData, includedPackages])

  function updateEdgeRelationship(
    relationship: LinkPackageRelationship,
    updates: Partial<EdgeRelationshipSettings>,
  ): void {
    setEdgeRelationshipConfig((current) => ({
      ...current,
      [relationship]: {
        ...current[relationship],
        ...updates,
      },
    }))
  }

  return (
    <section>
      <h2 className="mb-4 text-3xl font-semibold text-white">
        Module Dependency Force Graph
      </h2>

      <p className="my-2 text-sm text-slate-400">
        The graph is completely interactable. Drag and Drop. Explore in 3d.
        Adjust edge visibility, weight, and spacing to identify influence.
      </p>

      <div className="mb-4 flex items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3">
        <div>
          <div className="text-sm font-medium text-white">
            Mutual package dependency edges
          </div>
          <div className="text-xs text-slate-400">
            Highlight edges when package A imports package B and package B imports package A.
          </div>
        </div>

        <ToggleSwitch
          checked={highlightMutualPackageDependenciesOnly}
          onChange={setHighlightMutualPackageDependenciesOnly}
          ariaLabel="Highlight mutual package dependency edges"
          title="Highlight mutual package dependency edges"
          color="selection"
        />
      </div>

      <div className="mb-4 rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3">
        <div className="mb-3">
          <div className="text-sm font-medium text-white">Edge type display</div>
          <div className="text-xs text-slate-400">
            Include or highlight same-package, subpackage, cross-package, and structural package-tree edges.
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-6">
          {LINK_PACKAGE_RELATIONSHIPS.map((relationship) => {
            const copy = EDGE_RELATIONSHIP_COPY[relationship]
            const settings = edgeRelationshipConfig[relationship]

            return (
              <div
                key={relationship}
                className="rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2"
              >
                <div className="mb-3">
                  <div className="text-sm font-medium text-white">
                    {copy.label}
                  </div>
                  <div className="text-xs text-slate-400">
                    {copy.description}
                  </div>
                </div>

                <div className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-2">
                  <div className="text-xs text-slate-400">Included</div>
                  <ToggleSwitch
                    checked={settings.included}
                    onChange={(checked) =>
                      updateEdgeRelationship(relationship, { included: checked })
                    }
                    ariaLabel={`Toggle ${copy.label.toLowerCase()} edge inclusion`}
                    title={`Toggle ${copy.label.toLowerCase()} edge inclusion`}
                    color="visibility"
                  />

                  <div className="text-xs text-slate-400">Highlighted</div>
                  <ToggleSwitch
                    checked={settings.highlighted}
                    onChange={(checked) =>
                      updateEdgeRelationship(relationship, { highlighted: checked })
                    }
                    ariaLabel={`Toggle ${copy.label.toLowerCase()} edge highlighting`}
                    title={`Toggle ${copy.label.toLowerCase()} edge highlighting`}
                    color="selection"
                  />
                </div>

                <div className="mt-3">
                  <MultiplierSlider
                    label="Visibility"
                    value={settings.visibilityMultiplier}
                    options={EDGE_RELATIONSHIP_MULTIPLIER_OPTIONS}
                    onChange={(multiplier) =>
                      updateEdgeRelationship(relationship, {
                        visibilityMultiplier: multiplier,
                      })
                    }
                    ariaLabel={`${copy.label} edge visibility`}
                  />
                  <MultiplierSlider
                    label="Weight"
                    value={settings.strengthMultiplier}
                    options={EDGE_RELATIONSHIP_MULTIPLIER_OPTIONS}
                    onChange={(multiplier) =>
                      updateEdgeRelationship(relationship, {
                        strengthMultiplier: multiplier,
                      })
                    }
                    ariaLabel={`${copy.label} edge weight`}
                  />
                  <MultiplierSlider
                    label="Base strength"
                    value={settings.baseStrength}
                    options={EDGE_RELATIONSHIP_BASE_STRENGTH_OPTIONS}
                    onChange={(value) =>
                      updateEdgeRelationship(relationship, { baseStrength: value })
                    }
                    ariaLabel={`${copy.label} base edge strength`}
                    formatValue={formatStrengthValue}
                  />
                  <MultiplierSlider
                    label="Base distance"
                    value={settings.baseDistance}
                    options={EDGE_RELATIONSHIP_BASE_DISTANCE_OPTIONS}
                    onChange={(value) =>
                      updateEdgeRelationship(relationship, { baseDistance: value })
                    }
                    ariaLabel={`${copy.label} base edge distance`}
                    formatValue={formatDistanceValue}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <ForceGraphCanvas
          graphData={graphData}
          edgeRelationshipConfig={edgeRelationshipConfig}
          packageInfluenceConfig={packageInfluenceConfig}
          packageColorMap={packageColorMap}
          highlightedPackages={highlightedPackages}
          highlightMutualPackageDependenciesOnly={
            highlightMutualPackageDependenciesOnly
          }
          displayPrefix={displayPrefix}
          className={className}
        />

        <ForceGraphPackagesPanel
          roots={snapshot.package_panel.roots}
          packages={packages}
          displayPrefix={displayPrefix}
          packageColorMap={packageColorMap}
          includedPackages={includedPackages}
          highlightedPackages={highlightedPackages}
          showOnlyExternallyImportedIncludedPackages={
            showOnlyExternallyImportedIncludedPackages
          }
          showOnlyExternallyImportedPackages={
            showOnlyExternallyImportedPackages
          }
          onIncludePackage={includePackage}
          onUnincludePackage={unincludePackage}
          onIncludePackageTree={includePackages}
          onUnincludePackageTree={unincludePackages}
          onShowOnlyExternallyImportedIncludedPackagesChange={
            setShowOnlyExternallyImportedIncludedPackages
          }
          onShowOnlyExternallyImportedPackagesChange={
            setShowOnlyExternallyImportedPackages
          }
          onHighlightPackage={highlightPackage}
          onUnhighlightPackage={unhighlightPackage}
          onHighlightPackageTree={highlightPackages}
          onUnhighlightPackageTree={unhighlightPackages}
          onIncludeAllPackages={includeAllPackages}
          onExcludeAllPackages={excludeAllPackages}
          onHighlightAllPackages={highlightAllPackages}
          onUnhighlightAllPackages={unhighlightAllPackages}
          packageInfluenceConfig={packageInfluenceConfig}
          onPackageInfluenceChange={updatePackageInfluence}
          collapsedPackages={collapsedPackages}
          onToggleCollapsedPackage={toggleCollapsedPackage}
          onExpandAllPackages={expandAllPackages}
          onCollapseAllPackages={collapseAllPackages}
        />
      </div>

    </section>
  )
}
