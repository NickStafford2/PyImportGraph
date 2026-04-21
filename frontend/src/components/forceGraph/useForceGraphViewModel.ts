import type { ComponentProps } from 'react'
import type { PackageSnapshot, ProjectSnapshot } from '../../types'
import { ForceGraphCanvas } from './ForceGraphCanvas'
import { ForceGraphEdgeControls } from './ForceGraphEdgeControls'
import { ForceGraphPackagesPanel } from './ForceGraphPackagesPanel'
import { useForceGraphDisplay } from './useForceGraphDisplay'
import { useForceGraphEdgeRelationshipConfig } from './useForceGraphEdgeRelationshipConfig'
import { useForceGraphState } from './useForceGraphState'

type UseForceGraphViewModelArgs = {
  snapshot: ProjectSnapshot
  displayPrefix: string | null
  className?: string
}

type UseForceGraphViewModelResult = {
  edgeControlsProps: ComponentProps<typeof ForceGraphEdgeControls>
  canvasProps: ComponentProps<typeof ForceGraphCanvas>
  packagesPanelProps: ComponentProps<typeof ForceGraphPackagesPanel>
}

export function useForceGraphViewModel({
  snapshot,
  displayPrefix,
  className,
}: UseForceGraphViewModelArgs): UseForceGraphViewModelResult {
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

  return {
    edgeControlsProps: {
      edgeRelationshipConfig,
      highlightMutualPackageDependenciesOnly,
      onHighlightMutualPackageDependenciesOnlyChange:
        setHighlightMutualPackageDependenciesOnly,
      onEdgeRelationshipChange: updateEdgeRelationship,
    },
    canvasProps: {
      graphData,
      edgeRelationshipConfig,
      packageInfluenceConfig,
      packageColorMap,
      highlightedPackages,
      highlightMutualPackageDependenciesOnly,
      displayPrefix,
      className,
    },
    packagesPanelProps: {
      roots: snapshot.package_panel.roots,
      packages,
      displayPrefix,
      packageColorMap,
      includedPackages,
      highlightedPackages,
      showOnlyExternallyImportedIncludedPackages,
      showOnlyExternallyImportedPackages,
      onIncludePackage: includePackage,
      onUnincludePackage: unincludePackage,
      onIncludePackageTree: includePackages,
      onUnincludePackageTree: unincludePackages,
      onShowOnlyExternallyImportedIncludedPackagesChange:
        setShowOnlyExternallyImportedIncludedPackages,
      onShowOnlyExternallyImportedPackagesChange:
        setShowOnlyExternallyImportedPackages,
      onHighlightPackage: highlightPackage,
      onUnhighlightPackage: unhighlightPackage,
      onHighlightPackageTree: highlightPackages,
      onUnhighlightPackageTree: unhighlightPackages,
      onIncludeAllPackages: includeAllPackages,
      onExcludeAllPackages: excludeAllPackages,
      onHighlightAllPackages: highlightAllPackages,
      onUnhighlightAllPackages: unhighlightAllPackages,
      packageInfluenceConfig,
      onPackageInfluenceChange: updatePackageInfluence,
      collapsedPackages,
      onToggleCollapsedPackage: toggleCollapsedPackage,
      onExpandAllPackages: expandAllPackages,
      onCollapseAllPackages: collapseAllPackages,
    },
  }
}
