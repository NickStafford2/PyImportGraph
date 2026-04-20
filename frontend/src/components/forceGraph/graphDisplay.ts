import type { ForceGraphSnapshot } from '../../types'
import type { GraphData, GraphNode } from './types'

export function getNodeValue(node: GraphNode): number {
  return Math.max(
    2,
    1 +
      node.import_count +
      node.imported_by_count +
      node.external_interface_count,
  )
}

export function buildGraphData(snapshot: ForceGraphSnapshot): GraphData {
  return {
    nodes: snapshot.nodes,
    links: snapshot.links.map((link) => ({
      ...link,
      source: link.source_module_name,
      target: link.target_module_name,
    })),
  }
}
