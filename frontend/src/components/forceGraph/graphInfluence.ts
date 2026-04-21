import type {
  ForceGraphConfig,
  GraphLink,
  PackageInfluenceConfig,
  PackageInfluenceSettings,
} from './types'
import { getLinkPackageRelationship } from './graphRelationships'
import type { LinkRelationshipStrengthMultipliers } from './graphRelationships'

export const DEFAULT_PACKAGE_INFLUENCE_SETTINGS: PackageInfluenceSettings = {
  edgeStrengthMultiplier: 1,
  edgeVisibilityMultiplier: 1,
}

export const PACKAGE_INFLUENCE_MULTIPLIER_OPTIONS = [1, 0.5, 0.25, 0.1] as const

export function getPackageInfluenceSettings(
  packageName: string,
  config: PackageInfluenceConfig,
): PackageInfluenceSettings {
  return config[packageName] ?? DEFAULT_PACKAGE_INFLUENCE_SETTINGS
}

export function getLinkPackageInfluence(
  link: GraphLink,
  config: PackageInfluenceConfig,
): PackageInfluenceSettings {
  const sourceSettings = getPackageInfluenceSettings(
    link.source_package_name,
    config,
  )
  const targetSettings = getPackageInfluenceSettings(
    link.target_package_name,
    config,
  )

  return {
    edgeStrengthMultiplier: Math.min(
      sourceSettings.edgeStrengthMultiplier,
      targetSettings.edgeStrengthMultiplier,
    ),
    edgeVisibilityMultiplier: Math.min(
      sourceSettings.edgeVisibilityMultiplier,
      targetSettings.edgeVisibilityMultiplier,
    ),
  }
}

export function getEffectiveLinkStrength(
  link: GraphLink,
  forceGraphConfig: ForceGraphConfig,
  packageInfluenceConfig: PackageInfluenceConfig,
  relationshipStrengthMultipliers: LinkRelationshipStrengthMultipliers,
): number {
  const relationship = getLinkPackageRelationship(link)
  const baseStrength =
    relationship === 'same_package'
      ? forceGraphConfig.linkStrength.samePackage
      : relationship === 'direct_child_package'
        ? forceGraphConfig.linkStrength.directChildPackage
        : forceGraphConfig.linkStrength.crossPackage

  return (
    baseStrength *
    relationshipStrengthMultipliers[relationship] *
    getLinkPackageInfluence(link, packageInfluenceConfig).edgeStrengthMultiplier
  )
}

export function getEffectiveLinkDistance(
  link: GraphLink,
  forceGraphConfig: ForceGraphConfig,
  config: PackageInfluenceConfig,
  relationshipStrengthMultipliers: LinkRelationshipStrengthMultipliers,
): number {
  const relationship = getLinkPackageRelationship(link)
  const baseDistance =
    relationship === 'same_package'
      ? forceGraphConfig.linkDistance.samePackage
      : relationship === 'direct_child_package'
        ? forceGraphConfig.linkDistance.directChildPackage
        : forceGraphConfig.linkDistance.crossPackage

  const strengthMultiplier = getLinkPackageInfluence(
    link,
    config,
  ).edgeStrengthMultiplier
  const combinedStrengthMultiplier =
    strengthMultiplier * relationshipStrengthMultipliers[relationship]

  const distanceMultiplier =
    combinedStrengthMultiplier >= 1
      ? 1
      : 1 + (1 - combinedStrengthMultiplier) * 0.35

  return baseDistance * distanceMultiplier
}

export function buildPackageInfluenceConfig(
  packageNames: string[],
): PackageInfluenceConfig {
  return Object.fromEntries(
    packageNames.map((packageName) => [
      packageName,
      DEFAULT_PACKAGE_INFLUENCE_SETTINGS,
    ]),
  )
}

export function updatePackageInfluenceConfig(
  currentConfig: PackageInfluenceConfig,
  packageName: string,
  nextSettings: PackageInfluenceSettings,
): PackageInfluenceConfig {
  return {
    ...currentConfig,
    [packageName]: nextSettings,
  }
}
