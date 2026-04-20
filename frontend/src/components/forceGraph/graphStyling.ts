import { getPackageColor } from './graphColors'
import { getLinkPackageInfluence } from './graphInfluence'
import {
  getLinkPackageRelationship,
  type LinkRelationshipToggles,
} from './graphRelationships'
import type { GraphLink, GraphNode, PackageInfluenceConfig } from './types'

const GREYED_NODE_COLOR = '#475569'
const INACTIVE_LINK_RGB = '100, 116, 139'
const GRAYSCALED_LINK_RGB = '203, 213, 225'
const SAME_PACKAGE_LINK_RGB = '148, 163, 184'
const SUBPACKAGE_LINK_RGB = '96, 165, 250'
const CROSS_PACKAGE_LINK_RGB = '245, 158, 11'
const MUTUAL_LINK_RGB = '244, 114, 182'

function getBaseLinkColor(link: GraphLink): string {
  const relationship = getLinkPackageRelationship(link)

  if (relationship === 'same_package') {
    return SAME_PACKAGE_LINK_RGB
  }

  if (relationship === 'subpackage') {
    return SUBPACKAGE_LINK_RGB
  }

  return CROSS_PACKAGE_LINK_RGB
}

function getBaseLinkOpacity(link: GraphLink): number {
  const relationship = getLinkPackageRelationship(link)

  if (relationship === 'same_package') {
    return 0.28
  }

  if (relationship === 'subpackage') {
    return 0.5
  }

  return 0.72
}

function getBaseLinkWidth(link: GraphLink): number {
  const relationship = getLinkPackageRelationship(link)

  if (relationship === 'same_package') {
    return 1.35
  }

  if (relationship === 'subpackage') {
    return 2.2
  }

  return 3.0
}

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
  grayscaledEdgeRelationships: LinkRelationshipToggles
}

export function getLinkColor({
  link,
  packageInfluenceConfig,
  highlightedPackages,
  highlightMutualPackageDependenciesOnly,
  grayscaledEdgeRelationships,
}: GetLinkColorArgs): string {
  const influence = getLinkPackageInfluence(link, packageInfluenceConfig)
  const highlightMultiplier = getLinkHighlightMultiplier(
    link,
    highlightedPackages,
  )
  const relationship = getLinkPackageRelationship(link)
  const isGrayscaled = grayscaledEdgeRelationships[relationship]

  if (highlightMutualPackageDependenciesOnly) {
    if (!link.is_mutual_package_dependency) {
      return `rgba(${INACTIVE_LINK_RGB}, 0.06)`
    }

    const opacity = Math.max(
      0.3,
      0.8 * influence.edgeVisibilityMultiplier * highlightMultiplier,
    )

    const rgb = isGrayscaled ? GRAYSCALED_LINK_RGB : MUTUAL_LINK_RGB

    return `rgba(${rgb}, ${opacity})`
  }

  const baseOpacity = getBaseLinkOpacity(link)
  const opacity = Math.max(
    0.06,
    baseOpacity * influence.edgeVisibilityMultiplier * highlightMultiplier,
  )

  const isDimmedByHighlight = highlightMultiplier < 1
  const rgb = isDimmedByHighlight
    ? INACTIVE_LINK_RGB
    : isGrayscaled
      ? GRAYSCALED_LINK_RGB
      : getBaseLinkColor(link)

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
  const baseWidth = getBaseLinkWidth(link)

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
