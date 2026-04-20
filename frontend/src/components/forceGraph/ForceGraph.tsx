import { useEffect, useMemo, useState } from 'react'
import type { PackageSnapshot, ProjectSnapshot } from '../../types'
import { ForceGraphCanvas } from './ForceGraphCanvas'
import { ForceGraphControls } from './ForceGraphControls'
import { ForceGraphPackagesPanel } from './ForceGraphPackagesPanel'
import { buildGraphData } from './graphDisplay'
import {
  getLinkPackageRelationship,
  LINK_PACKAGE_RELATIONSHIPS,
  type LinkPackageRelationship,
  type LinkRelationshipToggles,
} from './graphRelationships'
import { FORCE_PRESETS } from './presets'
import { ToggleSwitch } from './ToggleSwitch'
import { useForceGraphState } from './useForceGraphState'

type ForceGraphProps = {
  snapshot: ProjectSnapshot
  displayPrefix: string | null
  className?: string
}

const DEFAULT_VISIBLE_EDGE_RELATIONSHIPS: LinkRelationshipToggles = {
  same_package: true,
  subpackage: true,
  cross_package: true,
}

const DEFAULT_GRAYSCALED_EDGE_RELATIONSHIPS: LinkRelationshipToggles = {
  same_package: false,
  subpackage: false,
  cross_package: false,
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
}

export function ForceGraph({
  snapshot,
  displayPrefix,
  className,
}: ForceGraphProps) {
  const packages: PackageSnapshot[] = snapshot.packages

  const {
    presetKey,
    setPresetKey,
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
  const [visibleEdgeRelationships, setVisibleEdgeRelationships] =
    useState<LinkRelationshipToggles>(DEFAULT_VISIBLE_EDGE_RELATIONSHIPS)
  const [grayscaledEdgeRelationships, setGrayscaledEdgeRelationships] =
    useState<LinkRelationshipToggles>(DEFAULT_GRAYSCALED_EDGE_RELATIONSHIPS)

  const packagesWithExternalImporters = useMemo(() => {
    return new Set(snapshot.package_panel.externally_imported_package_names)
  }, [snapshot.package_panel.externally_imported_package_names])

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

  const preset = FORCE_PRESETS[presetKey]
  const fullGraphData = useMemo(
    () => buildGraphData(snapshot.force_graph),
    [snapshot.force_graph],
  )
  const graphData = useMemo(() => {
    return {
      ...fullGraphData,
      links: fullGraphData.links.filter(
        (link) => visibleEdgeRelationships[getLinkPackageRelationship(link)],
      ),
    }
  }, [fullGraphData, visibleEdgeRelationships])

  function setEdgeRelationshipVisibility(
    relationship: LinkPackageRelationship,
    isVisible: boolean,
  ): void {
    setVisibleEdgeRelationships((current) => ({
      ...current,
      [relationship]: isVisible,
    }))
  }

  function setEdgeRelationshipGrayscale(
    relationship: LinkPackageRelationship,
    isGrayscaled: boolean,
  ): void {
    setGrayscaledEdgeRelationships((current) => ({
      ...current,
      [relationship]: isGrayscaled,
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
        />
      </div>

      <div className="mb-4 rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3">
        <div className="mb-3">
          <div className="text-sm font-medium text-white">Edge type display</div>
          <div className="text-xs text-slate-400">
            Show, hide, or grayscale same-package, subpackage, and cross-package edges.
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
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
                  <div className="text-xs text-slate-400">Visible</div>
                  <ToggleSwitch
                    checked={visibleEdgeRelationships[relationship]}
                    onChange={(checked) =>
                      setEdgeRelationshipVisibility(relationship, checked)
                    }
                    ariaLabel={`Toggle ${copy.label.toLowerCase()} edge visibility`}
                    title={`Toggle ${copy.label.toLowerCase()} edge visibility`}
                  />

                  <div className="text-xs text-slate-400">Grayscale</div>
                  <ToggleSwitch
                    checked={grayscaledEdgeRelationships[relationship]}
                    onChange={(checked) =>
                      setEdgeRelationshipGrayscale(relationship, checked)
                    }
                    ariaLabel={`Toggle grayscale for ${copy.label.toLowerCase()} edges`}
                    title={`Toggle grayscale for ${copy.label.toLowerCase()} edges`}
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
          preset={preset}
          packageInfluenceConfig={packageInfluenceConfig}
          highlightedPackages={highlightedPackages}
          highlightMutualPackageDependenciesOnly={
            highlightMutualPackageDependenciesOnly
          }
          grayscaledEdgeRelationships={grayscaledEdgeRelationships}
          className={className}
        />

        <ForceGraphPackagesPanel
          roots={snapshot.package_panel.roots}
          packages={packages}
          displayPrefix={displayPrefix}
          highlightedPackages={highlightedPackages}
          showOnlyExternallyImportedPackages={
            showOnlyExternallyImportedPackages
          }
          onShowOnlyExternallyImportedPackagesChange={
            setShowOnlyExternallyImportedPackages
          }
          onHighlightPackage={highlightPackage}
          onUnhighlightPackage={unhighlightPackage}
          onHighlightPackageTree={highlightPackages}
          onUnhighlightPackageTree={unhighlightPackages}
          onHighlightOnlyPackage={highlightOnlyPackages}
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

      <ForceGraphControls value={presetKey} onChange={setPresetKey} />
    </section>
  )
}
