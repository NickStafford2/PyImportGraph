import type { PackageSnapshot } from '../../types'

export type PackageColorMap = ReadonlyMap<string, string>

const DEFAULT_PACKAGE_COLOR = '#f8fafc'
const MAX_NAMED_HUE_FAMILIES = 8
const HUE_FAMILIES: Record<number, readonly number[]> = {
  2: [42, 210],
  3: [48, 135, 220],
  4: [34, 90, 155, 220],
  5: [30, 72, 122, 172, 220],
  6: [28, 60, 98, 138, 182, 222],
  7: [26, 54, 84, 118, 156, 192, 226],
  8: [24, 48, 74, 100, 134, 168, 202, 232],
}

function hashString(value: string): number {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0
  }
  return hash
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function normalizeHue(value: number): number {
  const normalized = value % 360
  return normalized < 0 ? normalized + 360 : normalized
}

function getGeneratedHueFamilies(count: number): number[] {
  if (count <= 1) {
    return [0]
  }

  return Array.from({ length: count }, (_, index) => {
    const ratio = index / (count - 1)
    return Math.round(24 + ratio * (232 - 24))
  })
}

function getFamilyHues(count: number): readonly number[] {
  if (count <= 1) {
    return [0]
  }

  if (count <= MAX_NAMED_HUE_FAMILIES) {
    return HUE_FAMILIES[count]
  }

  return getGeneratedHueFamilies(count)
}

function getFamilyColor(
  hue: number,
  depthFromFamilyAnchor: number,
  seed: string,
): string {
  if (depthFromFamilyAnchor === 0) {
    return `hsl(${hue} 76% 62%)`
  }

  const hash = hashString(seed)
  const hueShift = [-8, 0, 8][hash % 3]
  const saturation = clamp(
    72 - depthFromFamilyAnchor * 6 + (((hash >> 3) % 5) - 2) * 2,
    48,
    78,
  )
  const lightness = clamp(
    64 - depthFromFamilyAnchor * 5 + (((hash >> 7) % 5) - 2) * 3,
    42,
    72,
  )

  return `hsl(${normalizeHue(hue + hueShift)} ${saturation}% ${lightness}%)`
}

function getDepthFromAnchor(
  packageName: string,
  anchorName: string,
  parentsByPackage: ReadonlyMap<string, string | null>,
): number {
  let depth = 0
  let currentPackageName: string | null = packageName

  while (currentPackageName != null && currentPackageName !== anchorName) {
    currentPackageName = parentsByPackage.get(currentPackageName) ?? null
    depth += 1
  }

  return depth
}

function getFamilyAnchorForSingleRoot(
  packageName: string,
  rootPackageName: string,
  parentsByPackage: ReadonlyMap<string, string | null>,
): string | null {
  if (packageName === rootPackageName) {
    return null
  }

  let currentPackageName = packageName
  let parentPackageName = parentsByPackage.get(currentPackageName) ?? null

  while (parentPackageName != null && parentPackageName !== rootPackageName) {
    currentPackageName = parentPackageName
    parentPackageName = parentsByPackage.get(currentPackageName) ?? null
  }

  return parentPackageName === rootPackageName ? currentPackageName : null
}

function getFamilyAnchorForMultipleRoots(
  packageName: string,
  rootPackageNames: ReadonlySet<string>,
  parentsByPackage: ReadonlyMap<string, string | null>,
): string | null {
  let currentPackageName: string | null = packageName

  while (currentPackageName != null && !rootPackageNames.has(currentPackageName)) {
    currentPackageName = parentsByPackage.get(currentPackageName) ?? null
  }

  return currentPackageName
}

export function buildPackageColorMap(
  packages: readonly PackageSnapshot[],
  rootPackageNames: readonly string[],
): PackageColorMap {
  const packageColorMap = new Map<string, string>()
  const parentsByPackage = new Map(
    packages.map((item) => [item.name, item.parent] as const),
  )
  const childrenByPackage = new Map(
    packages.map((item) => [item.name, [...item.children].sort()] as const),
  )
  const sortedRootPackageNames = [...rootPackageNames].sort()

  if (sortedRootPackageNames.length === 0) {
    return packageColorMap
  }

  if (sortedRootPackageNames.length === 1) {
    const rootPackageName = sortedRootPackageNames[0]
    packageColorMap.set(rootPackageName, DEFAULT_PACKAGE_COLOR)

    const familyAnchorNames =
      childrenByPackage.get(rootPackageName)?.filter(Boolean) ?? []
    const familyHues = getFamilyHues(familyAnchorNames.length)
    const familyHueByAnchor = new Map(
      familyAnchorNames.map((anchorName, index) => [
        anchorName,
        familyHues[index] ?? familyHues[familyHues.length - 1] ?? 0,
      ] as const),
    )

    for (const item of packages) {
      if (item.name === rootPackageName) {
        continue
      }

      const familyAnchorName = getFamilyAnchorForSingleRoot(
        item.name,
        rootPackageName,
        parentsByPackage,
      )

      if (familyAnchorName == null) {
        packageColorMap.set(item.name, DEFAULT_PACKAGE_COLOR)
        continue
      }

      const hue = familyHueByAnchor.get(familyAnchorName) ?? 0
      const depthFromAnchor = getDepthFromAnchor(
        item.name,
        familyAnchorName,
        parentsByPackage,
      )

      packageColorMap.set(
        item.name,
        getFamilyColor(hue, depthFromAnchor, item.name),
      )
    }

    return packageColorMap
  }

  const rootPackageNameSet = new Set(sortedRootPackageNames)
  const familyHues = getFamilyHues(sortedRootPackageNames.length)
  const familyHueByAnchor = new Map(
    sortedRootPackageNames.map((rootPackageName, index) => [
      rootPackageName,
      familyHues[index] ?? familyHues[familyHues.length - 1] ?? 0,
    ] as const),
  )

  for (const item of packages) {
    const familyAnchorName = getFamilyAnchorForMultipleRoots(
      item.name,
      rootPackageNameSet,
      parentsByPackage,
    )

    if (familyAnchorName == null) {
      packageColorMap.set(item.name, DEFAULT_PACKAGE_COLOR)
      continue
    }

    const hue = familyHueByAnchor.get(familyAnchorName) ?? 0
    const depthFromAnchor = getDepthFromAnchor(
      item.name,
      familyAnchorName,
      parentsByPackage,
    )

    packageColorMap.set(
      item.name,
      getFamilyColor(hue, depthFromAnchor, item.name),
    )
  }

  return packageColorMap
}

export function getPackageColor(
  packageName: string,
  packageColorMap: PackageColorMap,
): string {
  return packageColorMap.get(packageName) ?? DEFAULT_PACKAGE_COLOR
}
