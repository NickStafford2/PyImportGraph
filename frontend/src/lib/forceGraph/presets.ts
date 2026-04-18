import type { ForcePreset, ForcePresetKey } from './types'

export const FORCE_PRESETS: Record<ForcePresetKey, ForcePreset> = {
  balanced: {
    key: 'balanced',
    label: 'Balanced',
    description: 'A general-purpose layout with moderate clustering and spacing.',
    chargeStrength: -120,
    velocityDecay: 0.25,
    cooldownTicks: 120,
    collisionStrength: 0.7,
    collisionRadiusMultiplier: 1.6,
    linkDistance: {
      samePackage: 40,
      crossPackage: 95,
    },
    linkStrength: {
      samePackage: 0.85,
      crossPackage: 0.2,
    },
  },
  packageClusters: {
    key: 'packageClusters',
    label: 'Package clusters',
    description:
      'Strong internal package grouping and weaker cross-package pull.',
    chargeStrength: -110,
    velocityDecay: 0.22,
    cooldownTicks: 140,
    collisionStrength: 0.75,
    collisionRadiusMultiplier: 1.7,
    linkDistance: {
      samePackage: 24,
      crossPackage: 130,
    },
    linkStrength: {
      samePackage: 1.0,
      crossPackage: 0.08,
    },
  },
  spreadOut: {
    key: 'spreadOut',
    label: 'Spread out',
    description: 'Pushes nodes apart for a clearer, less tangled overview.',
    chargeStrength: -220,
    velocityDecay: 0.32,
    cooldownTicks: 150,
    collisionStrength: 0.9,
    collisionRadiusMultiplier: 2.0,
    linkDistance: {
      samePackage: 55,
      crossPackage: 150,
    },
    linkStrength: {
      samePackage: 0.55,
      crossPackage: 0.12,
    },
  },
  dependencyChains: {
    key: 'dependencyChains',
    label: 'Dependency chains',
    description:
      'Shorter cross-package links so dependency paths and hubs read more directly.',
    chargeStrength: -100,
    velocityDecay: 0.2,
    cooldownTicks: 130,
    collisionStrength: 0.6,
    collisionRadiusMultiplier: 1.4,
    linkDistance: {
      samePackage: 35,
      crossPackage: 70,
    },
    linkStrength: {
      samePackage: 0.7,
      crossPackage: 0.35,
    },
  },
}

export const DEFAULT_FORCE_PRESET: ForcePresetKey = 'balanced'

export const FORCE_PRESET_OPTIONS = Object.values(FORCE_PRESETS)
