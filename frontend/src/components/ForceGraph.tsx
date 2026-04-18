import ForceGraph3D from 'react-force-graph-3d'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { ProjectSnapshot } from '../types'

type ForceGraphProps = {
  snapshot: ProjectSnapshot
  className?: string
}

type GraphNode = {
  id: string
  name: string
  group: string
  val: number
  importCount: number
  importedByCount: number
  externalInterfaceCount: number
}

type GraphLink = {
  source: string
  target: string
  type: string
}

type Dimensions = {
  width: number
  height: number
}

export function ForceGraph({ snapshot, className }: ForceGraphProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [dimensions, setDimensions] = useState<Dimensions>({
    width: 0,
    height: 600,
  })

  useEffect(() => {
    function updateSize() {
      if (!containerRef.current) {
        return
      }

      const width = containerRef.current.clientWidth
      const height = containerRef.current.clientHeight

      setDimensions({
        width,
        height: height > 0 ? height : 600,
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
    const nodes: GraphNode[] = snapshot.modules.map((module) => {
      const importCount = module.imports.length
      const importedByCount = module.imported_by.length
      const externalInterfaceCount = module.external_interface.length

      return {
        id: module.name,
        name: module.name,
        group: module.package,
        val: Math.max(
          2,
          1 + importCount + importedByCount + externalInterfaceCount,
        ),
        importCount,
        importedByCount,
        externalInterfaceCount,
      }
    })

    const links: GraphLink[] = snapshot.edges
      .filter((edge) => edge.type === 'module_import')
      .map((edge) => ({
        source: edge.from,
        target: edge.to,
        type: edge.type,
      }))

    return { nodes, links }
  }, [snapshot])

  return (
    <div
      ref={containerRef}
      className={className ?? 'relative h-[700px] w-full overflow-hidden rounded-2xl'}
    >
      {dimensions.width > 0 && (
        <ForceGraph3D
          width={dimensions.width}
          height={dimensions.height}
          graphData={graphData}
          nodeId="id"
          nodeLabel={(node) => {
            const graphNode = node as GraphNode
            return [
              graphNode.name,
              `package: ${graphNode.group}`,
              `imports: ${graphNode.importCount}`,
              `imported by: ${graphNode.importedByCount}`,
              `external interface: ${graphNode.externalInterfaceCount}`,
            ].join('\n')
          }}
          nodeAutoColorBy="group"
          nodeVal="val"
          linkDirectionalArrowLength={3.5}
          linkDirectionalArrowRelPos={1}
          linkCurvature={0.08}
          cooldownTicks={100}
          d3VelocityDecay={0.25}
          enableNodeDrag
          showNavInfo
        />
      )}
    </div>
  )
}
