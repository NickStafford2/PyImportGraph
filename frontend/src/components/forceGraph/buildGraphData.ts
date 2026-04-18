import type { ProjectSnapshot } from '../../types'
import { trimModulePrefix } from '../../lib/moduleName'
import type { GraphData, GraphLink, GraphNode } from './types'

export function buildGraphData(
  snapshot: ProjectSnapshot,
  displayPrefix: string | null,
): GraphData {
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

  const links: GraphLink[] = snapshot.edges
    .filter((edge) => edge.type === 'module_import')
    .map((edge) => ({
      source: edge.from,
      target: edge.to,
      type: edge.type,
      samePackage: edge.from_package === edge.to_package,
      weight: edge.from_package === edge.to_package ? 1 : 0.5,
    }))

  return { nodes, links }
}
