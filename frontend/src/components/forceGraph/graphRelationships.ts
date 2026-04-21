import type { GraphLink } from './types'

export type LinkPackageRelationship =
  | 'same_package'
  | 'direct_child_package'
  | 'sibling_package'
  | 'subpackage'
  | 'cross_package'

export type LinkRelationshipToggles = Record<LinkPackageRelationship, boolean>
export type LinkRelationshipVisibilityMultipliers = Record<
  LinkPackageRelationship,
  number
>
export type LinkRelationshipStrengthMultipliers = Record<
  LinkPackageRelationship,
  number
>

export const LINK_PACKAGE_RELATIONSHIPS: LinkPackageRelationship[] = [
  'same_package',
  'subpackage',
  'cross_package',
  'direct_child_package',
  'sibling_package',
]

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
