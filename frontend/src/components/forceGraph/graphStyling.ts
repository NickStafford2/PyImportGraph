import { getPackageColor } from './graphColors'
import { getLinkPackageInfluence } from './graphInfluence'
import type { GraphLink, GraphNode, PackageInfluenceConfig } from './types'

const GREYED_NODE_COLOR = '#475569'
const INACTIVE_LINK_RGB = '100, 116, 139'
const ACTIVE_LINK_RGB = '148, 163, 184'
const MUTUAL_LINK_RGB = '244, 114, 182'

function isPackageHighlighted(
  packageName: string,
  highlightedPackages: ReadonlySet<string>,
): boolean {
  return highlightedPackages.has(packageName)
}

function getLinkHighlightMultiplier(
  link: GraphLink,
  highlightedPackages: ReadonlySet<string>,
): number {
  const touchesHighlightedPackage =
    isPackageHighlighted(link.source_package_name, highlightedPackages) ||
    isPackageHighlighted(link.target_package_name, highlightedPackages)

  return touchesHighlightedPackage ? 1 : 0.2
}

export function getNodeColor(
  node: GraphNode,
  highlightedPackages: ReadonlySet<string>,
): string {
  if (isPackageHighlighted(node.package_name, highlightedPackages)) {
    return getPackageColor(node.package_name)
  }

  return GREYED_NODE_COLOR
}

type GetLinkColorArgs = {
  link: GraphLink
  packageInfluenceConfig: PackageInfluenceConfig
  highlightedPackages: ReadonlySet<string>
  highlightMutualPackageDependenciesOnly: boolean
}

export function getLinkColor({
  link,
  packageInfluenceConfig,
  highlightedPackages,
  highlightMutualPackageDependenciesOnly,
}: GetLinkColorArgs): string {
  const influence = getLinkPackageInfluence(link, packageInfluenceConfig)
  const highlightMultiplier = getLinkHighlightMultiplier(
    link,
    highlightedPackages,
  )

  if (highlightMutualPackageDependenciesOnly) {
    if (!link.is_mutual_package_dependency) {
      return `rgba(${INACTIVE_LINK_RGB}, 0.06)`
    }

    const opacity = Math.max(
      0.3,
      0.8 * influence.edgeVisibilityMultiplier * highlightMultiplier,
    )

    return `rgba(${MUTUAL_LINK_RGB}, ${opacity})`
  }

  const baseOpacity = link.is_same_package ? 0.7 : 0.35
  const opacity = Math.max(
    0.06,
    baseOpacity * influence.edgeVisibilityMultiplier * highlightMultiplier,
  )

  const isDimmedByHighlight = highlightMultiplier < 1
  const rgb = isDimmedByHighlight ? INACTIVE_LINK_RGB : ACTIVE_LINK_RGB

  return `rgba(${rgb}, ${opacity})`
}

type GetLinkWidthArgs = {
  link: GraphLink
  packageInfluenceConfig: PackageInfluenceConfig
  highlightedPackages: ReadonlySet<string>
  highlightMutualPackageDependenciesOnly: boolean
}

export function getLinkWidth({
  link,
  packageInfluenceConfig,
  highlightedPackages,
  highlightMutualPackageDependenciesOnly,
}: GetLinkWidthArgs): number {
  const influence = getLinkPackageInfluence(link, packageInfluenceConfig)
  const highlightMultiplier = getLinkHighlightMultiplier(
    link,
    highlightedPackages,
  )
  const baseWidth = link.is_same_package ? 4.0 : 2.0

  if (highlightMutualPackageDependenciesOnly) {
    if (!link.is_mutual_package_dependency) {
      return 0.15
    }

    return Math.max(
      2.5,
      (baseWidth + 2.5) * influence.edgeVisibilityMultiplier * highlightMultiplier,
    )
  }

  return Math.max(
    0.15,
    baseWidth * influence.edgeVisibilityMultiplier * highlightMultiplier,
  )
}
