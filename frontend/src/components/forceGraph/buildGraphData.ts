import type { EdgeSnapshot, ProjectSnapshot } from '../../types'
import { trimModulePrefix } from '../../lib/moduleName'
import type { GraphData, GraphLink, GraphNode } from './types'

function getRenderedEdges(edges: readonly EdgeSnapshot[]): EdgeSnapshot[] {
  return edges.filter((edge) => edge.type === 'symbol_import')
}

export function buildGraphData(
  snapshot: ProjectSnapshot,
  displayPrefix: string | null,
): GraphData {
  const renderedEdges = getRenderedEdges(snapshot.edges)

  const nodes: GraphNode[] = snapshot.modules.map((module) => {
    const importCount = module.imports.length
    const importedByCount = module.imported_by.length
    const externalInterfaceCount = module.external_interface.length

    return {
      id: module.name,
      name: module.name,
      displayName: trimModulePrefix(module.name, displayPrefix),
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

  const links: GraphLink[] = renderedEdges.map((edge) => ({
    source: edge.from,
    target: edge.to,
    type: edge.type,
    samePackage: edge.from_package === edge.to_package,
    weight: edge.from_package === edge.to_package ? 1 : 0.5,
    sourcePackage: edge.from_package,
    targetPackage: edge.to_package,
    isMutualPackageDependency: edge.is_reciprocal_package_dependency,
  }))

  return { nodes, links }
}
