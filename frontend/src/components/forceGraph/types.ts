// frontend/src/components/forceGraph/types.ts

import type {
  ForceGraphLinkSnapshot,
  ForceGraphNodeSnapshot,
} from '../../types'

export type GraphNode = ForceGraphNodeSnapshot

export type GraphLink = ForceGraphLinkSnapshot & { source: string; target: string }

export type GraphData = {
  nodes: GraphNode[]
  links: GraphLink[]
}

export type ForcePresetKey =
  | 'balanced'
  | 'packageClusters'
  | 'spreadOut'
  | 'dependencyChains'

export type ForcePreset = {
  key: ForcePresetKey
  label: string
  description: string
  chargeStrength: number
  velocityDecay: number
  cooldownTicks: number
  collisionStrength: number
  collisionRadiusMultiplier: number
  linkDistance: {
    samePackage: number
    crossPackage: number
  }
  linkStrength: {
    samePackage: number
    crossPackage: number
  }
}

export type PackageInfluenceSettings = {
  edgeStrengthMultiplier: number
  edgeVisibilityMultiplier: number
}

export type PackageInfluenceConfig = Record<string, PackageInfluenceSettings>
