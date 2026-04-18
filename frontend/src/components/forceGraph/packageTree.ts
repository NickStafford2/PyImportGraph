import type { PackageSnapshot } from '../../types'

export type PackageTreeNode = {
  packageName: string
  children: PackageTreeNode[]
  subtreePackageNames: string[]
}

export function buildPackageTree(
  packages: PackageSnapshot[],
): PackageTreeNode[] {
  const nodesByName = new Map<string, PackageTreeNode>()

  for (const item of packages) {
    nodesByName.set(item.name, {
      packageName: item.name,
      children: [],
      subtreePackageNames: [],
    })
  }

  const roots: PackageTreeNode[] = []

  for (const item of packages) {
    const node = nodesByName.get(item.name)
    if (node == null) {
      continue
    }

    if (item.parent == null) {
      roots.push(node)
      continue
    }

    const parentNode = nodesByName.get(item.parent)
    if (parentNode == null) {
      roots.push(node)
      continue
    }

    parentNode.children.push(node)
  }

  sortTree(roots)

  for (const root of roots) {
    populateSubtreePackageNames(root)
  }

  return roots
}

function sortTree(nodes: PackageTreeNode[]): void {
  nodes.sort((left, right) => left.packageName.localeCompare(right.packageName))

  for (const node of nodes) {
    sortTree(node.children)
  }
}

function populateSubtreePackageNames(node: PackageTreeNode): string[] {
  const subtree = [node.packageName]

  for (const child of node.children) {
    subtree.push(...populateSubtreePackageNames(child))
  }

  node.subtreePackageNames = subtree
  return subtree
}
