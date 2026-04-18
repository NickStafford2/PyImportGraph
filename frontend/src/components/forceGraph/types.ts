// frontend/src/components/forceGraph/types.ts

export type GraphNode = {
  id: string
  name: string
  displayName: string
  group: string
  val: number
  importCount: number
  importedByCount: number
  externalInterfaceCount: number
}

export type GraphLink = {
  source: string
  target: string
  type: string
  samePackage: boolean
  weight: number
  sourcePackage: string
  targetPackage: string
  isMutualPackageDependency: boolean
}

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
