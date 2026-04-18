import { getPackageColor } from './graphColors'
import { getLinkPackageInfluence } from './graphInfluence'
import type { GraphLink, GraphNode, PackageInfluenceConfig } from './types'

const GREYED_NODE_COLOR = '#475569'
const INACTIVE_LINK_RGB = '100, 116, 139'
const ACTIVE_LINK_RGB = '148, 163, 184'

function getLinkHighlightMultiplier(
  link: GraphLink,
  highlightedPackages: ReadonlySet<string>,
): number {
  if (highlightedPackages.size === 0) {
    return 1
  }

  const touchesHighlightedPackage =
    highlightedPackages.has(link.sourcePackage) ||
    highlightedPackages.has(link.targetPackage)

  return touchesHighlightedPackage ? 1 : 0.2
}

export function getNodeColor(
  node: GraphNode,
  highlightedPackages: ReadonlySet<string>,
): string {
  if (
    highlightedPackages.size === 0 ||
    highlightedPackages.has(node.group)
  ) {
    return getPackageColor(node.group)
  }

  return GREYED_NODE_COLOR
}

export function getLinkColor(
  link: GraphLink,
  packageInfluenceConfig: PackageInfluenceConfig,
  highlightedPackages: ReadonlySet<string>,
): string {
  const influence = getLinkPackageInfluence(link, packageInfluenceConfig)
  const highlightMultiplier = getLinkHighlightMultiplier(
    link,
    highlightedPackages,
  )

  const baseOpacity = link.samePackage ? 0.7 : 0.35
  const opacity = Math.max(
    0.06,
    baseOpacity * influence.edgeVisibilityMultiplier * highlightMultiplier,
  )

  const isDimmedByHighlight =
    highlightedPackages.size > 0 && highlightMultiplier < 1
  const rgb = isDimmedByHighlight ? INACTIVE_LINK_RGB : ACTIVE_LINK_RGB

  return `rgba(${rgb}, ${opacity})`
}

export function getLinkWidth(
  link: GraphLink,
  packageInfluenceConfig: PackageInfluenceConfig,
  highlightedPackages: ReadonlySet<string>,
): number {
  const influence = getLinkPackageInfluence(link, packageInfluenceConfig)
  const highlightMultiplier = getLinkHighlightMultiplier(
    link,
    highlightedPackages,
  )
  const baseWidth = link.samePackage ? 1.5 : 0.8

  return Math.max(
    0.15,
    baseWidth * influence.edgeVisibilityMultiplier * highlightMultiplier,
  )
}
