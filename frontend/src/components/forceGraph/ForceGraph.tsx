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
    highlightPackage,
    unhighlightPackage,
    highlightPackages,
    unhighlightPackages,
    highlightOnlyPackages,
    highlightAllPackages,
    unhighlightAllPackages,
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
      <h2 className="mb-4 text-xl font-semibold text-white">Module Dependency Force Graph</h2>

      <p className="my-2 text-sm text-slate-400">
        The graph is completely interactable. Drag and Drop. Explore in 3d. Adjust edge weights to identify influence.
      </p>



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
