import { getPackageColor } from './graphColors'
import { getLinkPackageInfluence } from './graphInfluence'
import type { GraphLink, GraphNode, PackageInfluenceConfig } from './types'

const GREYED_NODE_COLOR = '#475569'
const INACTIVE_LINK_RGB = '100, 116, 139'
const ACTIVE_LINK_RGB = '148, 163, 184'

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
    isPackageHighlighted(link.sourcePackage, highlightedPackages) ||
    isPackageHighlighted(link.targetPackage, highlightedPackages)

  return touchesHighlightedPackage ? 1 : 0.2
}

export function getNodeColor(
  node: GraphNode,
  highlightedPackages: ReadonlySet<string>,
): string {
  if (isPackageHighlighted(node.group, highlightedPackages)) {
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

  const isDimmedByHighlight = highlightMultiplier < 1
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
  const baseWidth = link.samePackage ? 4.0 : 2.0

  return Math.max(
    0.15,
    baseWidth * influence.edgeVisibilityMultiplier * highlightMultiplier,
  )
}
