import ForceGraph3D, {
  type ForceGraphMethods,
} from 'react-force-graph-3d'
import { forceCollide } from 'd3-force-3d'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { ProjectSnapshot } from '../types'
import { buildGraphData } from '../lib/forceGraph/buildGraphData'
import {
  DEFAULT_FORCE_PRESET,
  FORCE_PRESETS,
} from '../lib/forceGraph/presets'
import type {
  ForcePresetKey,
  GraphLink,
  GraphNode,
} from '../lib/forceGraph/types'
import { ForceGraphControls } from './ForceGraphControls'

type ForceGraphProps = {
  snapshot: ProjectSnapshot
  displayPrefix: string | null
  className?: string
}

type Dimensions = {
  width: number
  height: number
}

export function ForceGraph({
  snapshot,
  displayPrefix,
  className,
}: ForceGraphProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const graphRef = useRef<ForceGraphMethods<GraphNode, GraphLink> | undefined>(
    undefined,
  )

  const [dimensions, setDimensions] = useState<Dimensions>({
    width: 0,
    height: 700,
  })
  const [presetKey, setPresetKey] =
    useState<ForcePresetKey>(DEFAULT_FORCE_PRESET)

  const preset = FORCE_PRESETS[presetKey]

  useEffect(() => {
    function updateSize() {
      if (!containerRef.current) {
        return
      }

      const width = containerRef.current.clientWidth
      const height = containerRef.current.clientHeight

      setDimensions({
        width,
        height: height > 0 ? height : 700,
      })
    }

    updateSize()

    const observer = new ResizeObserver(() => {
      updateSize()
    })

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [])

  const graphData = useMemo(() => {
    return buildGraphData(snapshot, displayPrefix)
  }, [snapshot, displayPrefix])

  useEffect(() => {
    if (!graphRef.current) {
      return
    }

    const linkForce = graphRef.current.d3Force('link')
    if (linkForce != null) {
      linkForce.distance((link: GraphLink) =>
        link.samePackage
          ? preset.linkDistance.samePackage
          : preset.linkDistance.crossPackage,
      )

      linkForce.strength((link: GraphLink) =>
        link.samePackage
          ? preset.linkStrength.samePackage
          : preset.linkStrength.crossPackage,
      )
    }

    const chargeForce = graphRef.current.d3Force('charge')
    if (chargeForce != null) {
      chargeForce.strength(preset.chargeStrength)
    }

    graphRef.current.d3Force(
      'collision',
      forceCollide<GraphNode>((node) =>
        Math.max(6, node.val * preset.collisionRadiusMultiplier),
      ).strength(preset.collisionStrength),
    )

    graphRef.current.d3VelocityDecay(preset.velocityDecay)
    graphRef.current.d3ReheatSimulation()
  }, [graphData, preset])

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-white">3D graph</h2>
        <p className="mt-2 text-sm text-slate-400">
          Compare different layout presets to reveal package clusters,
          dependency chains, or a more spread-out architectural overview.
        </p>
      </div>

      <ForceGraphControls value={presetKey} onChange={setPresetKey} />

      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
        <div
          ref={containerRef}
          className={className ?? 'relative h-[700px] w-full overflow-hidden rounded-xl'}
        >
          {dimensions.width > 0 && (
            <ForceGraph3D<GraphNode, GraphLink>
              ref={graphRef}
              width={dimensions.width}
              height={dimensions.height}
              graphData={graphData}
              nodeId="id"
              nodeVal="val"
              nodeAutoColorBy="group"
              nodeLabel={(node) =>
                [
                  node.name,
                  `package: ${node.group}`,
                  `imports: ${node.importCount}`,
                  `imported by: ${node.importedByCount}`,
                  `external interface: ${node.externalInterfaceCount}`,
                ].join('\n')
              }
              linkDirectionalArrowLength={3.5}
              linkDirectionalArrowRelPos={1}
              linkCurvature={0.08}
              cooldownTicks={preset.cooldownTicks}
              enableNodeDrag
              showNavInfo
            />
          )}
        </div>
      </div>
    </section>
  )
}
