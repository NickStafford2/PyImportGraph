import { useEffect, useMemo, useState } from 'react'
import type { PackageSnapshot, ProjectSnapshot } from '../../types'
import { buildPackageColorMap } from './graphColors'
import { buildGraphData } from './graphDisplay'
import {
  getLinkPackageRelationship,
  type EdgeRelationshipConfig,
} from './graphRelationships'
import type { GraphData } from './types'

type UseForceGraphDisplayArgs = {
  snapshot: ProjectSnapshot
  packages: PackageSnapshot[]
  includedPackages: ReadonlySet<string>
  includeOnlyPackages: (packageNames: Iterable<string>) => void
  includeAllPackages: () => void
  highlightOnlyPackages: (packageNames: Iterable<string>) => void
  highlightAllPackages: () => void
  edgeRelationshipConfig: EdgeRelationshipConfig
}

type UseForceGraphDisplayResult = {
  graphData: GraphData
  packageColorMap: ReturnType<typeof buildPackageColorMap>
  showOnlyExternallyImportedPackages: boolean
  setShowOnlyExternallyImportedPackages: (value: boolean) => void
  showOnlyExternallyImportedIncludedPackages: boolean
  setShowOnlyExternallyImportedIncludedPackages: (value: boolean) => void
}

export function useForceGraphDisplay({
  snapshot,
  packages,
  includedPackages,
  includeOnlyPackages,
  includeAllPackages,
  highlightOnlyPackages,
  highlightAllPackages,
  edgeRelationshipConfig,
}: UseForceGraphDisplayArgs): UseForceGraphDisplayResult {
  const [showOnlyExternallyImportedPackages, setShowOnlyExternallyImportedPackages] =
    useState(false)
  const [showOnlyExternallyImportedIncludedPackages, setShowOnlyExternallyImportedIncludedPackages] =
    useState(false)

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

  return {
    graphData,
    packageColorMap,
    showOnlyExternallyImportedPackages,
    setShowOnlyExternallyImportedPackages,
    showOnlyExternallyImportedIncludedPackages,
    setShowOnlyExternallyImportedIncludedPackages,
  }
}
