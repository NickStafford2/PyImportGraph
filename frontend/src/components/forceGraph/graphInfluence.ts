import type {
  ForcePreset,
  GraphLink,
  PackageInfluenceConfig,
  PackageInfluenceSettings,
} from './types'

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
  preset: ForcePreset,
  config: PackageInfluenceConfig,
): number {
  const baseStrength = link.is_same_package
    ? preset.linkStrength.samePackage
    : preset.linkStrength.crossPackage

  return baseStrength * getLinkPackageInfluence(link, config).edgeStrengthMultiplier
}

export function getEffectiveLinkDistance(
  link: GraphLink,
  preset: ForcePreset,
  config: PackageInfluenceConfig,
): number {
  const baseDistance = link.is_same_package
    ? preset.linkDistance.samePackage
    : preset.linkDistance.crossPackage

  const strengthMultiplier = getLinkPackageInfluence(
    link,
    config,
  ).edgeStrengthMultiplier

  const distanceMultiplier =
    strengthMultiplier >= 1 ? 1 : 1 + (1 - strengthMultiplier) * 0.35

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
