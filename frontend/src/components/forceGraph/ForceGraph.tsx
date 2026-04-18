import { useMemo } from 'react'
import type { PackageSnapshot, ProjectSnapshot } from '../../types'
import { buildGraphData } from './buildGraphData'
import { ForceGraphCanvas } from './ForceGraphCanvas'
import { ForceGraphControls } from './ForceGraphControls'
import { ForceGraphPackagesPanel } from './ForceGraphPackagesPanel'
import { FORCE_PRESETS } from './presets'
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
    presetKey,
    setPresetKey,
    highlightedPackages,
    toggleHighlightedPackage,
    toggleHighlightedPackages,
    selectOnlyHighlightedPackages,
    clearHighlightedPackages,
    packageInfluenceConfig,
    updatePackageInfluence,
    collapsedPackages,
    toggleCollapsedPackage,
    expandAllPackages,
    collapseAllPackages,
  } = useForceGraphState({ packages })

  const preset = FORCE_PRESETS[presetKey]

  const graphData = useMemo(() => {
    return buildGraphData(snapshot, displayPrefix)
  }, [snapshot, displayPrefix])

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-white">3D graph</h2>
        <p className="mt-2 text-sm text-slate-400">
          Compare layout presets, highlight packages, and downweight noisy utility
          packages without removing them from the graph.
        </p>
      </div>

      <ForceGraphControls value={presetKey} onChange={setPresetKey} />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <ForceGraphCanvas
          graphData={graphData}
          preset={preset}
          packageInfluenceConfig={packageInfluenceConfig}
          highlightedPackages={highlightedPackages}
          className={className}
        />

        <ForceGraphPackagesPanel
          packages={packages}
          displayPrefix={displayPrefix}
          highlightedPackages={highlightedPackages}
          onTogglePackageHighlight={toggleHighlightedPackage}
          onTogglePackageTreeHighlight={toggleHighlightedPackages}
          onSelectOnlyPackageHighlight={selectOnlyHighlightedPackages}
          onClearPackageHighlights={clearHighlightedPackages}
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
