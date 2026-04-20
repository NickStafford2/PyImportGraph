import type { GraphLink } from './types'

export type LinkPackageRelationship =
  | 'same_package'
  | 'subpackage'
  | 'cross_package'

export type LinkRelationshipToggles = Record<LinkPackageRelationship, boolean>

export const LINK_PACKAGE_RELATIONSHIPS: LinkPackageRelationship[] = [
  'same_package',
  'subpackage',
  'cross_package',
]

function isAncestorPackage(ancestor: string, descendant: string): boolean {
  return descendant.startsWith(`${ancestor}.`)
}

export function getLinkPackageRelationship(
  link: GraphLink,
): LinkPackageRelationship {
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
