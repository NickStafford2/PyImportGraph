// frontend/src/components/forceGraph/ForceGraphCanvas.tsx

import { forceCollide } from 'd3-force-3d'
import { useEffect, useMemo, useRef, useState } from 'react'
import ForceGraph3D, { type ForceGraphMethods } from 'react-force-graph-3d'
import * as THREE from 'three'
import { trimModulePrefix } from '../../lib/moduleName'
import {
  getEffectiveLinkDistance,
  getEffectiveLinkStrength,
} from './graphInfluence'
import { getNodeValue } from './graphDisplay'
import type { LinkRelationshipToggles } from './graphRelationships'
import type { LinkRelationshipVisibilityMultipliers } from './graphRelationships'
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
  highlightMutualPackageDependenciesOnly: boolean
  grayscaledEdgeRelationships: LinkRelationshipToggles
  edgeRelationshipVisibilityMultipliers: LinkRelationshipVisibilityMultipliers
  displayPrefix: string | null
  className?: string
}

type Dimensions = {
  width: number
  height: number
}

type ForceGraphMethodsWithVelocityDecay = ForceGraphMethods<GraphNode, GraphLink> & {
  d3VelocityDecay?: (value: number) => ForceGraphMethods<GraphNode, GraphLink>
}

const INIT_NODE_HALO_COLOR = '#22d3ee'
const DEFAULT_NODE_REL_SIZE = 4

function isInitModuleNode(node: GraphNode): boolean {
  return node.module_name === node.package_name
}

function getNodeSphereRadius(node: GraphNode): number {
  return Math.cbrt(Math.max(0, getNodeValue(node) || 1)) * DEFAULT_NODE_REL_SIZE
}

function createInitNodeLabelSprite(label: string) {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  if (context == null) {
    return new THREE.Sprite()
  }

  const fontSize = 56
  const horizontalPadding = 24
  const verticalPadding = 16

  context.font = `600 ${fontSize}px sans-serif`
  const textWidth = Math.ceil(context.measureText(label).width)

  canvas.width = textWidth + horizontalPadding * 2
  canvas.height = fontSize + verticalPadding * 2

  context.font = `600 ${fontSize}px sans-serif`
  context.textAlign = 'left'
  context.textBaseline = 'middle'
  context.fillStyle = '#e2e8f0'
  context.fillText(label, horizontalPadding, canvas.height / 2)

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
  })

  const sprite = new THREE.Sprite(material)
  const aspectRatio = canvas.width / canvas.height
  const spriteHeight = 12
  sprite.scale.set(spriteHeight * aspectRatio, spriteHeight, 1)

  return sprite
}

export function ForceGraphCanvas({
  graphData,
  preset,
  packageInfluenceConfig,
  highlightedPackages,
  highlightMutualPackageDependenciesOnly,
  grayscaledEdgeRelationships,
  edgeRelationshipVisibilityMultipliers,
  displayPrefix,
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
  const initNodeHalo = useMemo(() => {
    return {
      geometry: new THREE.TorusGeometry(1, 0.16, 12, 48),
      material: new THREE.MeshBasicMaterial({
        color: INIT_NODE_HALO_COLOR,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    }
  }, [])

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
    return () => {
      initNodeHalo.geometry.dispose()
      initNodeHalo.material.dispose()
    }
  }, [initNodeHalo])

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
        Math.max(6, getNodeValue(node) * preset.collisionRadiusMultiplier),
      ).strength(preset.collisionStrength),
    )

    const graphWithVelocityDecay = graph as ForceGraphMethodsWithVelocityDecay
    if (typeof graphWithVelocityDecay.d3VelocityDecay === 'function') {
      graphWithVelocityDecay.d3VelocityDecay(preset.velocityDecay)
    }

    graph.d3ReheatSimulation()
  }, [graphData, packageInfluenceConfig, preset])

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
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
            nodeId="module_name"
            nodeVal={getNodeValue}
            nodeColor={(node) => getNodeColor(node, highlightedPackages)}
            nodeThreeObject={(node: GraphNode) => {
              if (!isInitModuleNode(node)) {
                return undefined
              }

              const displayName = trimModulePrefix(node.package_name, displayPrefix)
              const halo = new THREE.Mesh(
                initNodeHalo.geometry,
                initNodeHalo.material,
              )
              const nodeSphereRadius = getNodeSphereRadius(node)
              halo.rotation.x = Math.PI / 2
              halo.scale.setScalar(nodeSphereRadius)

              const label = createInitNodeLabelSprite(displayName)
              label.position.set(
                nodeSphereRadius * 1.85,
                nodeSphereRadius * -0.15,
                0,
              )

              const group = new THREE.Group()
              group.add(halo)
              group.add(label)
              return group
            }}
            nodeLabel={(node) => `
              <div style="
                max-width: 240px;
                font-size: 12px;
                line-height: 1.4;
              ">
                <div style="font-weight: 600; color: #e2e8f0; margin-bottom: 4px;">
                  ${node.module_name}
                </div>

                <div style="color: #94a3b8;">
                  <div><b>Package:</b> ${node.package_name}</div>
                  <div><b>Imports:</b> ${node.import_count}</div>
                  <div><b>Imported by:</b> ${node.imported_by_count}</div>
                  <div><b>External interface:</b> ${node.external_interface_count}</div>
                </div>
              </div>
            `}
            linkColor={(link) =>
              getLinkColor({
                link,
                packageInfluenceConfig,
                highlightedPackages,
                highlightMutualPackageDependenciesOnly,
                grayscaledEdgeRelationships,
                edgeRelationshipVisibilityMultipliers,
              })
            }
            linkWidth={(link) =>
              getLinkWidth({
                link,
                packageInfluenceConfig,
                highlightedPackages,
                highlightMutualPackageDependenciesOnly,
                edgeRelationshipVisibilityMultipliers,
              })
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
