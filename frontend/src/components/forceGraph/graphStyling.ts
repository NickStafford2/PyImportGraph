import { getPackageColor, type PackageColorMap } from './graphColors'
import { getLinkPackageInfluence } from './graphInfluence'
import {
  getLinkPackageRelationship,
  type LinkRelationshipToggles,
  type LinkRelationshipVisibilityMultipliers,
} from './graphRelationships'
import type { GraphLink, GraphNode, PackageInfluenceConfig } from './types'

const GREYED_NODE_COLOR = '#475569'
const INACTIVE_LINK_RGB = '100, 116, 139'
const GRAYSCALED_LINK_RGB = '203, 213, 225'
const SAME_PACKAGE_LINK_RGB = '148, 163, 184'
const DIRECT_CHILD_PACKAGE_LINK_RGB = '45, 212, 191'
const SIBLING_PACKAGE_LINK_RGB = '52, 211, 153'
const SIBLING_MODULE_LINK_RGB = '14, 165, 233'
const SUBPACKAGE_LINK_RGB = '96, 165, 250'
const CROSS_PACKAGE_LINK_RGB = '245, 158, 11'
const MUTUAL_LINK_RGB = '244, 114, 182'

function getBaseLinkColor(link: GraphLink): string {
  const relationship = getLinkPackageRelationship(link)

  if (relationship === 'same_package') {
    return SAME_PACKAGE_LINK_RGB
  }

  if (relationship === 'direct_child_package') {
    return DIRECT_CHILD_PACKAGE_LINK_RGB
  }

  if (relationship === 'sibling_package') {
    return SIBLING_PACKAGE_LINK_RGB
  }

  if (relationship === 'sibling_module') {
    return SIBLING_MODULE_LINK_RGB
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

  if (relationship === 'direct_child_package') {
    return 0.6
  }

  if (relationship === 'sibling_package') {
    return 0.48
  }

  if (relationship === 'sibling_module') {
    return 0.38
  }

  if (relationship === 'subpackage') {
    return 0.5
  }

  return 0.72
}

function getBaseLinkWidth(link: GraphLink): number {
  const relationship = getLinkPackageRelationship(link)

  if (relationship === 'same_package') {
    return 4.05
  }

  if (relationship === 'direct_child_package') {
    return 3.1
  }

  if (relationship === 'sibling_package') {
    return 2.7
  }

  if (relationship === 'sibling_module') {
    return 2.4
  }

  if (relationship === 'subpackage') {
    return 2.2
  }

  return 1.5
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
  packageColorMap: PackageColorMap,
): string {
  if (isPackageHighlighted(node.package_name, highlightedPackages)) {
    return getPackageColor(node.package_name, packageColorMap)
  }

  return GREYED_NODE_COLOR
}

type GetLinkColorArgs = {
  link: GraphLink
  packageInfluenceConfig: PackageInfluenceConfig
  highlightedPackages: ReadonlySet<string>
  highlightMutualPackageDependenciesOnly: boolean
  highlightedEdgeRelationships: LinkRelationshipToggles
  edgeRelationshipVisibilityMultipliers: LinkRelationshipVisibilityMultipliers
}

export function getLinkColor({
  link,
  packageInfluenceConfig,
  highlightedPackages,
  highlightMutualPackageDependenciesOnly,
  highlightedEdgeRelationships,
  edgeRelationshipVisibilityMultipliers,
}: GetLinkColorArgs): string {
  const influence = getLinkPackageInfluence(link, packageInfluenceConfig)
  const highlightMultiplier = getLinkHighlightMultiplier(
    link,
    highlightedPackages,
  )
  const relationship = getLinkPackageRelationship(link)
  const isHighlightedRelationship = highlightedEdgeRelationships[relationship]
  const relationshipVisibilityMultiplier =
    edgeRelationshipVisibilityMultipliers[relationship]

  if (highlightMutualPackageDependenciesOnly) {
    if (!link.is_mutual_package_dependency) {
      return `rgba(${INACTIVE_LINK_RGB}, 0.06)`
    }

    const opacity = Math.max(
      0.3,
      0.8 *
        influence.edgeVisibilityMultiplier *
        relationshipVisibilityMultiplier *
        highlightMultiplier,
    )

    const rgb = isHighlightedRelationship ? MUTUAL_LINK_RGB : GRAYSCALED_LINK_RGB

    return `rgba(${rgb}, ${opacity})`
  }

  const baseOpacity = getBaseLinkOpacity(link)
  const opacity = Math.max(
    0.06,
    baseOpacity *
      influence.edgeVisibilityMultiplier *
      relationshipVisibilityMultiplier *
      highlightMultiplier,
  )

  const isDimmedByHighlight = highlightMultiplier < 1
  const rgb = isDimmedByHighlight
    ? INACTIVE_LINK_RGB
    : isHighlightedRelationship
      ? getBaseLinkColor(link)
      : GRAYSCALED_LINK_RGB

  return `rgba(${rgb}, ${opacity})`
}

type GetLinkWidthArgs = {
  link: GraphLink
  packageInfluenceConfig: PackageInfluenceConfig
  highlightedPackages: ReadonlySet<string>
  highlightMutualPackageDependenciesOnly: boolean
  edgeRelationshipVisibilityMultipliers: LinkRelationshipVisibilityMultipliers
}

export function getLinkWidth({
  link,
  packageInfluenceConfig,
  highlightedPackages,
  highlightMutualPackageDependenciesOnly,
  edgeRelationshipVisibilityMultipliers,
}: GetLinkWidthArgs): number {
  const influence = getLinkPackageInfluence(link, packageInfluenceConfig)
  const highlightMultiplier = getLinkHighlightMultiplier(
    link,
    highlightedPackages,
  )
  const baseWidth = getBaseLinkWidth(link)
  const relationshipVisibilityMultiplier =
    edgeRelationshipVisibilityMultipliers[getLinkPackageRelationship(link)]

  if (highlightMutualPackageDependenciesOnly) {
    if (!link.is_mutual_package_dependency) {
      return 0.15
    }

    return Math.max(
      2.5,
      (baseWidth + 2.5) *
        influence.edgeVisibilityMultiplier *
        relationshipVisibilityMultiplier *
        highlightMultiplier,
    )
  }

  return Math.max(
    0.15,
    baseWidth *
      influence.edgeVisibilityMultiplier *
      relationshipVisibilityMultiplier *
      highlightMultiplier,
  )
}
