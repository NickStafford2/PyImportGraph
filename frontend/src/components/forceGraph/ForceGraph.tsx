import { forceCollide } from 'd3-force-3d'
import { useEffect, useMemo, useRef, useState } from 'react'
import ForceGraph3D, {
  type ForceGraphMethods,
} from 'react-force-graph-3d'
import type { ProjectSnapshot } from '../../types'
import { buildGraphData } from './buildGraphData'
import { ForceGraphControls } from './ForceGraphControls'
import { ForceGraphLegend } from './ForceGraphLegend'
import { getPackageColor } from './graphColors'
import { DEFAULT_FORCE_PRESET, FORCE_PRESETS } from './presets'
import type { ForcePresetKey, GraphLink, GraphNode } from './types'

type ForceGraphProps = {
  snapshot: ProjectSnapshot
  displayPrefix: string | null
  className?: string
}

type Dimensions = {
  width: number
  height: number
}

const GREYED_NODE_COLOR = '#475569'
const GREYED_LINK_COLOR = 'rgba(100, 116, 139, 0.35)'
const ACTIVE_SAME_PACKAGE_LINK_COLOR = 'rgba(148, 163, 184, 0.7)'
const ACTIVE_CROSS_PACKAGE_LINK_COLOR = 'rgba(148, 163, 184, 0.35)'
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
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)

  const preset = FORCE_PRESETS[presetKey]

  const graphData = useMemo(() => {
    return buildGraphData(snapshot, displayPrefix)
  }, [snapshot, displayPrefix])

  const packageNames = useMemo(() => {
    return Array.from(new Set(snapshot.modules.map((module) => module.package)))
  }, [snapshot])

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
      forceCollide<GraphNode>((node: GraphNode) =>
        Math.max(6, node.val * preset.collisionRadiusMultiplier),
      ).strength(preset.collisionStrength),
    )

    graphRef.current.d3ReheatSimulation()
  }, [graphData, preset])

  function handlePackageSelect(packageName: string) {
    setSelectedPackage((current) =>
      current === packageName ? null : packageName,
    )
  }

  function getNodeColor(node: GraphNode): string {
    if (selectedPackage == null) {
      return getPackageColor(node.group)
    }

    if (node.group === selectedPackage) {
      return getPackageColor(node.group)
    }

    return GREYED_NODE_COLOR
  }

  function getLinkColor(link: GraphLink): string {
    if (selectedPackage == null) {
      return link.samePackage
        ? ACTIVE_SAME_PACKAGE_LINK_COLOR
        : ACTIVE_CROSS_PACKAGE_LINK_COLOR
    }

    const sourceGroup =
      typeof link.source === 'object' ? link.source.group : null
    const targetGroup =
      typeof link.target === 'object' ? link.target.group : null

    const isSelectedEdge =
      sourceGroup === selectedPackage || targetGroup === selectedPackage

    if (!isSelectedEdge) {
      return GREYED_LINK_COLOR
    }

    return link.samePackage
      ? ACTIVE_SAME_PACKAGE_LINK_COLOR
      : ACTIVE_CROSS_PACKAGE_LINK_COLOR
  }

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

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
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
                nodeColor={getNodeColor}
                nodeLabel={(node) =>
                  [
                    node.name,
                    `package: ${node.group}`,
                    `imports: ${node.importCount}`,
                    `imported by: ${node.importedByCount}`,
                    `external interface: ${node.externalInterfaceCount}`,
                  ].join('\n')
                }
                linkColor={getLinkColor}
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

        <ForceGraphLegend
          packageNames={packageNames}
          selectedPackage={selectedPackage}
          onPackageSelect={handlePackageSelect}
        />
      </div>
    </section>
  )
}
