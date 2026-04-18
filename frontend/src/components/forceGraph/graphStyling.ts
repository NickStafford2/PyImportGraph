import { getPackageColor } from './graphColors'
import { getLinkPackageInfluence } from './graphInfluence'
import type { GraphLink, GraphNode, PackageInfluenceConfig } from './types'

const GREYED_NODE_COLOR = '#475569'
const INACTIVE_LINK_RGB = '100, 116, 139'
const ACTIVE_LINK_RGB = '148, 163, 184'

function getLinkHighlightMultiplier(
  link: GraphLink,
  selectedPackage: string | null,
): number {
  if (selectedPackage == null) {
    return 1
  }

  const touchesSelectedPackage =
    link.sourcePackage === selectedPackage || link.targetPackage === selectedPackage

  return touchesSelectedPackage ? 1 : 0.2
}

export function getNodeColor(
  node: GraphNode,
  selectedPackage: string | null,
): string {
  if (selectedPackage == null || node.group === selectedPackage) {
    return getPackageColor(node.group)
  }

  return GREYED_NODE_COLOR
}

export function getLinkColor(
  link: GraphLink,
  packageInfluenceConfig: PackageInfluenceConfig,
  selectedPackage: string | null,
): string {
  const influence = getLinkPackageInfluence(link, packageInfluenceConfig)
  const highlightMultiplier = getLinkHighlightMultiplier(link, selectedPackage)

  const baseOpacity = link.samePackage ? 0.7 : 0.35
  const opacity = Math.max(
    0.06,
    baseOpacity * influence.edgeVisibilityMultiplier * highlightMultiplier,
  )

  const isDimmedBySelection = selectedPackage != null && highlightMultiplier < 1
  const rgb = isDimmedBySelection ? INACTIVE_LINK_RGB : ACTIVE_LINK_RGB

  return `rgba(${rgb}, ${opacity})`
}

export function getLinkWidth(
  link: GraphLink,
  packageInfluenceConfig: PackageInfluenceConfig,
  selectedPackage: string | null,
): number {
  const influence = getLinkPackageInfluence(link, packageInfluenceConfig)
  const highlightMultiplier = getLinkHighlightMultiplier(link, selectedPackage)
  const baseWidth = link.samePackage ? 1.5 : 0.8

  return Math.max(
    0.15,
    baseWidth * influence.edgeVisibilityMultiplier * highlightMultiplier,
  )
}
