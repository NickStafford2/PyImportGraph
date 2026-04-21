import type { ProjectSnapshot } from '../../types'
import { ForceGraphCanvas } from './ForceGraphCanvas'
import { ForceGraphEdgeControls } from './ForceGraphEdgeControls'
import { ForceGraphPackagesPanel } from './ForceGraphPackagesPanel'
import { useForceGraphViewModel } from './useForceGraphViewModel'

type ForceGraphProps = {
  snapshot: ProjectSnapshot
  displayPrefix: string | null
  className?: string
}

export function ForceGraph({ snapshot, displayPrefix, className }: ForceGraphProps) {
  const { edgeControlsProps, canvasProps, packagesPanelProps } =
    useForceGraphViewModel({ snapshot, displayPrefix, className })

  return (
    <section>
      <h2 className="mb-4 text-3xl font-semibold text-white">
        Module Dependency Force Graph
      </h2>

      <p className="my-2 text-sm text-slate-400">
        The graph is completely interactable. Drag and Drop. Explore in 3d.
        Adjust edge visibility, weight, and spacing to identify influence.
      </p>

      <ForceGraphEdgeControls {...edgeControlsProps} />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <ForceGraphCanvas {...canvasProps} />
        <ForceGraphPackagesPanel {...packagesPanelProps} />
      </div>

    </section>
  )
}
