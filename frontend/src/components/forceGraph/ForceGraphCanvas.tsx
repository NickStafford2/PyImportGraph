import { forceCollide } from 'd3-force-3d'
import { useEffect, useRef, useState } from 'react'
import ForceGraph3D, { type ForceGraphMethods } from 'react-force-graph-3d'
import {
  getEffectiveLinkDistance,
  getEffectiveLinkStrength,
} from './graphInfluence'
import { getLinkColor, getLinkWidth, getNodeColor } from './graphStyling'
import type {
  ForcePreset,
  GraphData,
  GraphLink,
  GraphNode,
  PackageInfluenceConfig,
} from './types'

type ForceGraphCanvasProps = {
  graphData: GraphData
  preset: ForcePreset
  packageInfluenceConfig: PackageInfluenceConfig
  highlightedPackages: ReadonlySet<string>
  className?: string
}

type Dimensions = {
  width: number
  height: number
}

type ForceGraphMethodsWithVelocityDecay = ForceGraphMethods<GraphNode, GraphLink> & {
  d3VelocityDecay?: (value: number) => ForceGraphMethods<GraphNode, GraphLink>
}

export function ForceGraphCanvas({
  graphData,
  preset,
  packageInfluenceConfig,
  highlightedPackages,
  className,
}: ForceGraphCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const graphRef = useRef<ForceGraphMethods<GraphNode, GraphLink> | undefined>(
    undefined,
  )

  const [dimensions, setDimensions] = useState<Dimensions>({
    width: 0,
    height: 700,
  })

  useEffect(() => {
    if (!containerRef.current) {
      return
    }

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) {
        return
      }

      setDimensions({
        width: entry.contentRect.width,
        height: 700,
      })
    })

    resizeObserver.observe(containerRef.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  useEffect(() => {
    const graph = graphRef.current
    if (!graph) {
      return
    }

    const linkForce = graph.d3Force('link')
    if (linkForce != null) {
      linkForce.distance((link: GraphLink) =>
        getEffectiveLinkDistance(link, preset, packageInfluenceConfig),
      )

      linkForce.strength((link: GraphLink) =>
        getEffectiveLinkStrength(link, preset, packageInfluenceConfig),
      )
    }

    const chargeForce = graph.d3Force('charge')
    if (chargeForce != null) {
      chargeForce.strength(preset.chargeStrength)
    }

    graph.d3Force(
      'collision',
      forceCollide<GraphNode>((node: GraphNode) =>
        Math.max(6, node.val * preset.collisionRadiusMultiplier),
      ).strength(preset.collisionStrength),
    )

    const graphWithVelocityDecay = graph as ForceGraphMethodsWithVelocityDecay
    if (typeof graphWithVelocityDecay.d3VelocityDecay === 'function') {
      graphWithVelocityDecay.d3VelocityDecay(preset.velocityDecay)
    }

    graph.d3ReheatSimulation()
  }, [graphData, packageInfluenceConfig, preset])

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden">
      <div
        ref={containerRef}
        className={
          className ?? 'relative h-[700px] w-full overflow-hidden rounded-xl'
        }
      >
        {dimensions.width > 0 && (
          <ForceGraph3D<GraphNode, GraphLink>
            ref={graphRef}
            width={dimensions.width}
            height={dimensions.height}
            graphData={graphData}
            nodeId="id"
            nodeVal="val"
            nodeColor={(node) => getNodeColor(node, highlightedPackages)}
            nodeLabel={(node) => `
              <div style="
                max-width: 240px;
                font-size: 12px;
                line-height: 1.4;
              ">
                <div style="font-weight: 600; color: #e2e8f0; margin-bottom: 4px;">
                  ${node.displayName}
                </div>

                <div style="color: #94a3b8;">
                  <div><b>Package:</b> ${node.group}</div>
                  <div><b>Imports:</b> ${node.importCount}</div>
                  <div><b>Imported by:</b> ${node.importedByCount}</div>
                  <div><b>External interface:</b> ${node.externalInterfaceCount}</div>
                </div>
              </div>
            `}
            linkColor={(link) =>
              getLinkColor(link, packageInfluenceConfig, highlightedPackages)
            }
            linkWidth={(link) =>
              getLinkWidth(link, packageInfluenceConfig, highlightedPackages)
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
  )
}
