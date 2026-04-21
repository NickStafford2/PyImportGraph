import type {
  GraphLink,
  PackageInfluenceConfig,
  PackageInfluenceSettings,
} from './types'
import { getLinkEdgeRelationshipSettings } from './graphRelationships'
import type { EdgeRelationshipConfig } from './graphRelationships'

export const DEFAULT_PACKAGE_INFLUENCE_SETTINGS: PackageInfluenceSettings = {
  edgeStrengthMultiplier: 1,
  edgeVisibilityMultiplier: 1,
}

export const PACKAGE_INFLUENCE_MULTIPLIER_OPTIONS = [
  0,
  0.25,
  0.5,
  1,
  1.5,
  2,
  3,
] as const

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
  edgeRelationshipConfig: EdgeRelationshipConfig,
  packageInfluenceConfig: PackageInfluenceConfig,
): number {
  const relationshipSettings = getLinkEdgeRelationshipSettings(
    link,
    edgeRelationshipConfig,
  )

  return (
    relationshipSettings.baseStrength *
    relationshipSettings.strengthMultiplier *
    getLinkPackageInfluence(link, packageInfluenceConfig).edgeStrengthMultiplier
  )
}

export function getEffectiveLinkDistance(
  link: GraphLink,
  edgeRelationshipConfig: EdgeRelationshipConfig,
  config: PackageInfluenceConfig,
): number {
  const relationshipSettings = getLinkEdgeRelationshipSettings(
    link,
    edgeRelationshipConfig,
  )

  const strengthMultiplier = getLinkPackageInfluence(
    link,
    config,
  ).edgeStrengthMultiplier
  const combinedStrengthMultiplier =
    strengthMultiplier * relationshipSettings.strengthMultiplier

  if (combinedStrengthMultiplier <= 0) {
    return relationshipSettings.baseDistance
  }

  const distanceMultiplier =
    combinedStrengthMultiplier >= 1
      ? 1
      : 1 + (1 - combinedStrengthMultiplier) * 0.35

  return relationshipSettings.baseDistance * distanceMultiplier
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
