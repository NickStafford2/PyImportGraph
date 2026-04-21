import { useEffect, useMemo, useState } from 'react'
import type { PackageSnapshot, ProjectSnapshot } from '../../types'
import { ForceGraphCanvas } from './ForceGraphCanvas'
import { ForceGraphEdgeControls } from './ForceGraphEdgeControls'
import { ForceGraphPackagesPanel } from './ForceGraphPackagesPanel'
import { buildPackageColorMap } from './graphColors'
import { buildGraphData } from './graphDisplay'
import {
  buildDefaultEdgeRelationshipConfig,
  type EdgeRelationshipConfig,
  type EdgeRelationshipSettings,
  getLinkPackageRelationship,
  type LinkPackageRelationship,
} from './graphRelationships'
import { useForceGraphState } from './useForceGraphState'

type ForceGraphProps = {
  snapshot: ProjectSnapshot
  displayPrefix: string | null
  className?: string
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

      <ForceGraphEdgeControls
        edgeRelationshipConfig={edgeRelationshipConfig}
        highlightMutualPackageDependenciesOnly={
          highlightMutualPackageDependenciesOnly
        }
        onHighlightMutualPackageDependenciesOnlyChange={
          setHighlightMutualPackageDependenciesOnly
        }
        onEdgeRelationshipChange={updateEdgeRelationship}
      />

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
