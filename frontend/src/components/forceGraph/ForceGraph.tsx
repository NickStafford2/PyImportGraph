import type { PackageSnapshot, ProjectSnapshot } from '../../types'
import { ForceGraphCanvas } from './ForceGraphCanvas'
import { ForceGraphEdgeControls } from './ForceGraphEdgeControls'
import { ForceGraphPackagesPanel } from './ForceGraphPackagesPanel'
import { useForceGraphDisplay } from './useForceGraphDisplay'
import { useForceGraphEdgeRelationshipConfig } from './useForceGraphEdgeRelationshipConfig'
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

  const { edgeRelationshipConfig, updateEdgeRelationship } =
    useForceGraphEdgeRelationshipConfig()

  const {
    graphData,
    packageColorMap,
    showOnlyExternallyImportedPackages,
    setShowOnlyExternallyImportedPackages,
    showOnlyExternallyImportedIncludedPackages,
    setShowOnlyExternallyImportedIncludedPackages,
  } = useForceGraphDisplay({
    snapshot,
    packages,
    includedPackages,
    includeOnlyPackages,
    includeAllPackages,
    highlightOnlyPackages,
    highlightAllPackages,
    edgeRelationshipConfig,
  })

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
