import { forceCollide } from 'd3-force-3d'
import { useEffect, useMemo, useRef, useState } from 'react'
import ForceGraph3D, { type ForceGraphMethods } from 'react-force-graph-3d'
import type { PackageSnapshot, ProjectSnapshot } from '../../types'
import { buildGraphData } from './buildGraphData'
import { ForceGraphControls } from './ForceGraphControls'
import { ForceGraphPackagesPanel } from './ForceGraphPackagesPanel'
import {
  buildPackageInfluenceConfig,
  getEffectiveLinkDistance,
  getEffectiveLinkStrength,
  updatePackageInfluenceConfig,
} from './graphInfluence'
import { getLinkColor, getLinkWidth, getNodeColor } from './graphStyling'
import { DEFAULT_FORCE_PRESET, FORCE_PRESETS } from './presets'
import type {
  ForcePresetKey,
  GraphLink,
  GraphNode,
  PackageInfluenceConfig,
  PackageInfluenceSettings,
} from './types'

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
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)

  const packages: PackageSnapshot[] = snapshot.packages

  const packageNames = useMemo(() => {
    return packages
      .map((item) => item.name)
      .sort((left, right) => left.localeCompare(right))
  }, [packages])

  const [packageInfluenceConfig, setPackageInfluenceConfig] =
    useState<PackageInfluenceConfig>(() => buildPackageInfluenceConfig(packageNames))

  useEffect(() => {
    setPackageInfluenceConfig((currentConfig) => {
      const nextConfig = buildPackageInfluenceConfig(packageNames)

      for (const packageName of packageNames) {
        const existingSettings = currentConfig[packageName]
        if (existingSettings != null) {
          nextConfig[packageName] = existingSettings
        }
      }

      return nextConfig
    })
  }, [packageNames])

  const preset = FORCE_PRESETS[presetKey]

  const graphData = useMemo(() => {
    return buildGraphData(snapshot, displayPrefix)
  }, [snapshot, displayPrefix])

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
        getEffectiveLinkDistance(link, preset, packageInfluenceConfig),
      )

      linkForce.strength((link: GraphLink) =>
        getEffectiveLinkStrength(link, preset, packageInfluenceConfig),
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
  }, [graphData, preset, packageInfluenceConfig])

  function handlePackageSelect(packageName: string) {
    setSelectedPackage((current) =>
      current === packageName ? null : packageName,
    )
  }

  function handlePackageInfluenceChange(
    packageName: string,
    nextSettings: PackageInfluenceSettings,
  ) {
    setPackageInfluenceConfig((currentConfig) =>
      updatePackageInfluenceConfig(currentConfig, packageName, nextSettings),
    )
  }

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
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden" >
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
                nodeColor={(node) => getNodeColor(node, selectedPackage)}
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
                  getLinkColor(link, packageInfluenceConfig, selectedPackage)
                }
                linkWidth={(link) =>
                  getLinkWidth(link, packageInfluenceConfig, selectedPackage)
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

        <ForceGraphPackagesPanel
          packages={packages}
          displayPrefix={displayPrefix}
          selectedPackage={selectedPackage}
          onPackageSelect={handlePackageSelect}
          packageInfluenceConfig={packageInfluenceConfig}
          onPackageInfluenceChange={handlePackageInfluenceChange}
        />
      </div>
    </section>
  )
}
