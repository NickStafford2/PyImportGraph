import type { ForceGraphConfig } from './types'

export const FORCE_GRAPH_CONFIG: ForceGraphConfig = {
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
    crossPackage: 0.01,
  },
}
