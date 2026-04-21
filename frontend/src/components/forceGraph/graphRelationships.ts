import type { GraphLink } from './types'

export type LinkPackageRelationship =
  | 'same_package'
  | 'direct_child_package'
  | 'sibling_package'
  | 'sibling_module'
  | 'subpackage'
  | 'cross_package'

export type EdgeRelationshipSettings = {
  included: boolean
  highlighted: boolean
  visibilityMultiplier: number
  strengthMultiplier: number
  baseStrength: number
  baseDistance: number
}

export type EdgeRelationshipConfig = Record<
  LinkPackageRelationship,
  EdgeRelationshipSettings
>

export const LINK_PACKAGE_RELATIONSHIPS: LinkPackageRelationship[] = [
  'same_package',
  'subpackage',
  'cross_package',
  'direct_child_package',
  'sibling_package',
  'sibling_module',
]

export const EDGE_RELATIONSHIP_MULTIPLIER_OPTIONS = [
  0,
  0.25,
  0.5,
  1,
  1.5,
  2,
  3,
] as const

export const EDGE_RELATIONSHIP_BASE_STRENGTH_OPTIONS = [
  0,
  0.01,
  0.02,
  0.04,
  0.06,
  0.08,
  0.1,
  0.15,
  0.2,
  0.3,
  0.5,
  0.75,
  1,
] as const

export const EDGE_RELATIONSHIP_BASE_DISTANCE_OPTIONS = [
  16,
  24,
  32,
  42,
  52,
  60,
  72,
  84,
  96,
  112,
  130,
  150,
  180,
] as const

function createDefaultEdgeRelationshipSettings(
  baseStrength: number,
  baseDistance: number,
): EdgeRelationshipSettings {
  return {
    included: true,
    highlighted: true,
    visibilityMultiplier: 1,
    strengthMultiplier: 1,
    baseStrength,
    baseDistance,
  }
}

export function buildDefaultEdgeRelationshipConfig(): EdgeRelationshipConfig {
  return {
    same_package: createDefaultEdgeRelationshipSettings(1, 24),
    subpackage: createDefaultEdgeRelationshipSettings(0.01, 130),
    cross_package: createDefaultEdgeRelationshipSettings(0.01, 130),
    direct_child_package: createDefaultEdgeRelationshipSettings(0.08, 60),
    sibling_package: createDefaultEdgeRelationshipSettings(0.04, 84),
    sibling_module: createDefaultEdgeRelationshipSettings(0.1, 42),
  }
}

function isAncestorPackage(ancestor: string, descendant: string): boolean {
  return descendant.startsWith(`${ancestor}.`)
}

export function getLinkPackageRelationship(
  link: GraphLink,
): LinkPackageRelationship {
  if (link.type === 'package_child') {
    return 'direct_child_package'
  }

  if (link.type === 'package_sibling') {
    return 'sibling_package'
  }

  if (link.type === 'module_sibling') {
    return 'sibling_module'
  }

  const sourcePackageName = link.source_package_name
  const targetPackageName = link.target_package_name

  if (sourcePackageName === targetPackageName) {
    return 'same_package'
  }

  if (
    isAncestorPackage(sourcePackageName, targetPackageName) ||
    isAncestorPackage(targetPackageName, sourcePackageName)
  ) {
    return 'subpackage'
  }

  return 'cross_package'
}

export function getEdgeRelationshipSettings(
  relationship: LinkPackageRelationship,
  config: EdgeRelationshipConfig,
): EdgeRelationshipSettings {
  return config[relationship]
}

export function getLinkEdgeRelationshipSettings(
  link: GraphLink,
  config: EdgeRelationshipConfig,
): EdgeRelationshipSettings {
  return getEdgeRelationshipSettings(getLinkPackageRelationship(link), config)
}
