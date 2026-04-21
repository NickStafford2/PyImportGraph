import { useEffect, useMemo, useState } from 'react'
import type { PackageSnapshot, ProjectSnapshot } from '../../types'
import { ForceGraphCanvas } from './ForceGraphCanvas'
import { ForceGraphPackagesPanel } from './ForceGraphPackagesPanel'
import { buildPackageColorMap } from './graphColors'
import { buildGraphData } from './graphDisplay'
import {
  getLinkPackageRelationship,
  LINK_PACKAGE_RELATIONSHIPS,
  type LinkPackageRelationship,
  type LinkRelationshipStrengthMultipliers,
  type LinkRelationshipToggles,
  type LinkRelationshipVisibilityMultipliers,
} from './graphRelationships'
import { MultiplierSlider } from './MultiplierSlider'
import { FORCE_GRAPH_CONFIG } from './presets'
import { ToggleSwitch } from './ToggleSwitch'
import { useForceGraphState } from './useForceGraphState'

type ForceGraphProps = {
  snapshot: ProjectSnapshot
  displayPrefix: string | null
  className?: string
}

const DEFAULT_INCLUDED_EDGE_RELATIONSHIPS: LinkRelationshipToggles = {
  same_package: true,
  subpackage: true,
  cross_package: true,
  direct_child_package: true,
}

const DEFAULT_HIGHLIGHTED_EDGE_RELATIONSHIPS: LinkRelationshipToggles = {
  same_package: true,
  subpackage: true,
  cross_package: true,
  direct_child_package: true,
}

const EDGE_RELATIONSHIP_MULTIPLIER_OPTIONS = [
  0,
  0.25,
  0.5,
  1,
  1.5,
  2,
  3,
] as const

const DEFAULT_EDGE_RELATIONSHIP_VISIBILITY_MULTIPLIERS: LinkRelationshipVisibilityMultipliers =
{
  same_package: 1,
  subpackage: 1,
  cross_package: 1,
  direct_child_package: 1,
}

const DEFAULT_EDGE_RELATIONSHIP_STRENGTH_MULTIPLIERS: LinkRelationshipStrengthMultipliers =
{
  same_package: 1,
  subpackage: 1,
  cross_package: 1,
  direct_child_package: 1,
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
  const [includedEdgeRelationships, setIncludedEdgeRelationships] =
    useState<LinkRelationshipToggles>(DEFAULT_INCLUDED_EDGE_RELATIONSHIPS)
  const [highlightedEdgeRelationships, setHighlightedEdgeRelationships] =
    useState<LinkRelationshipToggles>(DEFAULT_HIGHLIGHTED_EDGE_RELATIONSHIPS)
  const [edgeRelationshipVisibilityMultipliers, setEdgeRelationshipVisibilityMultipliers] =
    useState<LinkRelationshipVisibilityMultipliers>(
      DEFAULT_EDGE_RELATIONSHIP_VISIBILITY_MULTIPLIERS,
    )
  const [edgeRelationshipStrengthMultipliers, setEdgeRelationshipStrengthMultipliers] =
    useState<LinkRelationshipStrengthMultipliers>(
      DEFAULT_EDGE_RELATIONSHIP_STRENGTH_MULTIPLIERS,
    )

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

    return {
      nodes,
      links: fullGraphData.links.filter(
        (link) =>
          includedPackages.has(link.source_package_name) &&
          includedPackages.has(link.target_package_name) &&
          includedEdgeRelationships[getLinkPackageRelationship(link)],
      ),
    }
  }, [fullGraphData, includedEdgeRelationships, includedPackages])

  function setEdgeRelationshipIncluded(
    relationship: LinkPackageRelationship,
    isIncluded: boolean,
  ): void {
    setIncludedEdgeRelationships((current) => ({
      ...current,
      [relationship]: isIncluded,
    }))
  }

  function setEdgeRelationshipHighlighted(
    relationship: LinkPackageRelationship,
    isHighlighted: boolean,
  ): void {
    setHighlightedEdgeRelationships((current) => ({
      ...current,
      [relationship]: isHighlighted,
    }))
  }

  function setEdgeRelationshipVisibilityMultiplier(
    relationship: LinkPackageRelationship,
    multiplier: number,
  ): void {
    setEdgeRelationshipVisibilityMultipliers((current) => ({
      ...current,
      [relationship]: multiplier,
    }))
  }

  function setEdgeRelationshipStrengthMultiplier(
    relationship: LinkPackageRelationship,
    multiplier: number,
  ): void {
    setEdgeRelationshipStrengthMultipliers((current) => ({
      ...current,
      [relationship]: multiplier,
    }))
  }

  return (
    <section>
      <h2 className="mb-4 text-3xl font-semibold text-white">
        Module Dependency Force Graph
      </h2>

      <p className="my-2 text-sm text-slate-400">
        The graph is completely interactable. Drag and Drop. Explore in 3d.
        Adjust edge weights to identify influence.
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
            Include or highlight same-package, structural parent-child, subpackage, and cross-package edges.
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          {LINK_PACKAGE_RELATIONSHIPS.map((relationship) => {
            const copy = EDGE_RELATIONSHIP_COPY[relationship]

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
                    checked={includedEdgeRelationships[relationship]}
                    onChange={(checked) =>
                      setEdgeRelationshipIncluded(relationship, checked)
                    }
                    ariaLabel={`Toggle ${copy.label.toLowerCase()} edge inclusion`}
                    title={`Toggle ${copy.label.toLowerCase()} edge inclusion`}
                    color="visibility"
                  />

                  <div className="text-xs text-slate-400">Highlighted</div>
                  <ToggleSwitch
                    checked={highlightedEdgeRelationships[relationship]}
                    onChange={(checked) =>
                      setEdgeRelationshipHighlighted(relationship, checked)
                    }
                    ariaLabel={`Toggle ${copy.label.toLowerCase()} edge highlighting`}
                    title={`Toggle ${copy.label.toLowerCase()} edge highlighting`}
                    color="selection"
                  />
                </div>

                <div className="mt-3">
                  <MultiplierSlider
                    label="Emphasis"
                    value={edgeRelationshipVisibilityMultipliers[relationship]}
                    options={EDGE_RELATIONSHIP_MULTIPLIER_OPTIONS}
                    onChange={(multiplier) =>
                      setEdgeRelationshipVisibilityMultiplier(
                        relationship,
                        multiplier,
                      )
                    }
                    ariaLabel={`${copy.label} edge emphasis`}
                  />
                  <MultiplierSlider
                    label="Edge weight"
                    value={edgeRelationshipStrengthMultipliers[relationship]}
                    options={EDGE_RELATIONSHIP_MULTIPLIER_OPTIONS}
                    onChange={(multiplier) =>
                      setEdgeRelationshipStrengthMultiplier(
                        relationship,
                        multiplier,
                      )
                    }
                    ariaLabel={`${copy.label} edge weight`}
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
          forceGraphConfig={FORCE_GRAPH_CONFIG}
          packageInfluenceConfig={packageInfluenceConfig}
          packageColorMap={packageColorMap}
          highlightedPackages={highlightedPackages}
          highlightMutualPackageDependenciesOnly={
            highlightMutualPackageDependenciesOnly
          }
          highlightedEdgeRelationships={highlightedEdgeRelationships}
          edgeRelationshipStrengthMultipliers={
            edgeRelationshipStrengthMultipliers
          }
          edgeRelationshipVisibilityMultipliers={
            edgeRelationshipVisibilityMultipliers
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
