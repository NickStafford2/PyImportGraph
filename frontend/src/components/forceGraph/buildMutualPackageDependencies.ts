import type { EdgeSnapshot } from '../../types'

function makeDirectedPackageKey(fromPackage: string, toPackage: string): string {
  return `${fromPackage}→${toPackage}`
}

export function buildMutualPackageDependencySet(
  edges: readonly EdgeSnapshot[],
): Set<string> {
  const directedPairs = new Set<string>()

  for (const edge of edges) {
    if (edge.from_package === edge.to_package) {
      continue
    }

    directedPairs.add(makeDirectedPackageKey(edge.from_package, edge.to_package))
  }

  const mutualPairs = new Set<string>()

  for (const key of directedPairs) {
    const [fromPackage, toPackage] = key.split('→')
    const reverseKey = makeDirectedPackageKey(toPackage, fromPackage)

    if (directedPairs.has(reverseKey)) {
      mutualPairs.add(key)
      mutualPairs.add(reverseKey)
    }
  }

  return mutualPairs
}

export function isMutualPackageDependency(
  mutualPairs: ReadonlySet<string>,
  sourcePackage: string,
  targetPackage: string,
): boolean {
  return mutualPairs.has(makeDirectedPackageKey(sourcePackage, targetPackage))
}
