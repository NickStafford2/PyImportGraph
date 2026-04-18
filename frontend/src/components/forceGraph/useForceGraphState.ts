import { useCallback, useEffect, useMemo, useState } from 'react'
import type { PackageSnapshot } from '../../types'
import {
  buildPackageInfluenceConfig,
  updatePackageInfluenceConfig,
} from './graphInfluence'
import { DEFAULT_FORCE_PRESET } from './presets'
import type {
  ForcePresetKey,
  PackageInfluenceConfig,
  PackageInfluenceSettings,
} from './types'

type UseForceGraphStateArgs = {
  packages: PackageSnapshot[]
}

type UseForceGraphStateResult = {
  packageNames: string[]
  presetKey: ForcePresetKey
  setPresetKey: (value: ForcePresetKey) => void
  highlightedPackages: ReadonlySet<string>
  highlightPackage: (packageName: string) => void
  unhighlightPackage: (packageName: string) => void
  highlightPackages: (packageNames: Iterable<string>) => void
  unhighlightPackages: (packageNames: Iterable<string>) => void
  highlightOnlyPackages: (packageNames: Iterable<string>) => void
  highlightAllPackages: () => void
  unhighlightAllPackages: () => void
  highlightMutualPackageDependenciesOnly: boolean
  setHighlightMutualPackageDependenciesOnly: (value: boolean) => void
  packageInfluenceConfig: PackageInfluenceConfig
  updatePackageInfluence: (
    packageName: string,
    nextSettings: PackageInfluenceSettings,
  ) => void
  collapsedPackages: ReadonlySet<string>
  toggleCollapsedPackage: (packageName: string) => void
  expandAllPackages: () => void
  collapseAllPackages: () => void
}

function filterKnownPackageNames(
  values: Iterable<string>,
  knownPackageNames: ReadonlySet<string>,
): Set<string> {
  return new Set(
    [...values].filter((packageName) => knownPackageNames.has(packageName)),
  )
}

function getKnownPackageNames(
  packageNames: Iterable<string>,
  knownPackageNames: ReadonlySet<string>,
): string[] {
  return [...packageNames].filter((packageName) => knownPackageNames.has(packageName))
}

export function useForceGraphState({
  packages,
}: UseForceGraphStateArgs): UseForceGraphStateResult {
  const packageNames = useMemo(() => {
    return packages
      .map((item) => item.name)
      .sort((left, right) => left.localeCompare(right))
  }, [packages])

  const knownPackageNames = useMemo(() => {
    return new Set(packageNames)
  }, [packageNames])

  const [presetKey, setPresetKey] =
    useState<ForcePresetKey>(DEFAULT_FORCE_PRESET)

  const [highlightedPackages, setHighlightedPackages] = useState<Set<string>>(
    () => new Set(packageNames),
  )

  const [highlightMutualPackageDependenciesOnly, setHighlightMutualPackageDependenciesOnly] =
    useState(false)

  const [collapsedPackages, setCollapsedPackages] = useState<Set<string>>(
    () => new Set(),
  )

  const [packageInfluenceConfig, setPackageInfluenceConfig] =
    useState<PackageInfluenceConfig>(() => buildPackageInfluenceConfig(packageNames))

  useEffect(() => {
    setPackageInfluenceConfig((currentConfig) => {
      const nextConfig = buildPackageInfluenceConfig(packageNames)

      for (const packageName of packageNames) {
        const existingSettings = currentConfig[packageName]
        if (existingSettings != null) {
          nextConfig[packageName] = existingSettings
        }
      }

      return nextConfig
    })

    setHighlightedPackages((current) => {
      const next = new Set<string>()

      for (const packageName of packageNames) {
        if (current.has(packageName) || !knownPackageNames.has(packageName)) {
          next.add(packageName)
        }
      }

      if (current.size === 0) {
        return new Set()
      }

      for (const packageName of packageNames) {
        if (!current.has(packageName) && !next.has(packageName)) {
          next.add(packageName)
        }
      }

      return next
    })

    setCollapsedPackages((current) =>
      filterKnownPackageNames(current, knownPackageNames),
    )
  }, [knownPackageNames, packageNames])

  const highlightPackage = useCallback((packageName: string) => {
    if (!knownPackageNames.has(packageName)) {
      return
    }

    setHighlightedPackages((current) => {
      const next = new Set(current)
      next.add(packageName)
      return next
    })
  }, [knownPackageNames])

  const unhighlightPackage = useCallback((packageName: string) => {
    if (!knownPackageNames.has(packageName)) {
      return
    }

    setHighlightedPackages((current) => {
      const next = new Set(current)
      next.delete(packageName)
      return next
    })
  }, [knownPackageNames])

  const highlightPackages = useCallback((
    packageNamesToHighlight: Iterable<string>,
  ) => {
    const names = getKnownPackageNames(packageNamesToHighlight, knownPackageNames)

    setHighlightedPackages((current) => {
      const next = new Set(current)

      for (const packageName of names) {
        next.add(packageName)
      }

      return next
    })
  }, [knownPackageNames])

  const unhighlightPackages = useCallback((
    packageNamesToUnhighlight: Iterable<string>,
  ) => {
    const names = getKnownPackageNames(packageNamesToUnhighlight, knownPackageNames)

    setHighlightedPackages((current) => {
      const next = new Set(current)

      for (const packageName of names) {
        next.delete(packageName)
      }

      return next
    })
  }, [knownPackageNames])

  const highlightOnlyPackages = useCallback((
    packageNamesToHighlight: Iterable<string>,
  ) => {
    setHighlightedPackages(
      filterKnownPackageNames(packageNamesToHighlight, knownPackageNames),
    )
  }, [knownPackageNames])

  const highlightAllPackages = useCallback(() => {
    setHighlightedPackages(new Set(packageNames))
  }, [packageNames])

  const unhighlightAllPackages = useCallback(() => {
    setHighlightedPackages(new Set())
  }, [])

  const updatePackageInfluence = useCallback((
    packageName: string,
    nextSettings: PackageInfluenceSettings,
  ) => {
    setPackageInfluenceConfig((currentConfig) =>
      updatePackageInfluenceConfig(currentConfig, packageName, nextSettings),
    )
  }, [])

  const toggleCollapsedPackage = useCallback((packageName: string) => {
    setCollapsedPackages((current) => {
      const next = new Set(current)

      if (next.has(packageName)) {
        next.delete(packageName)
      } else {
        next.add(packageName)
      }

      return next
    })
  }, [])

  const expandAllPackages = useCallback(() => {
    setCollapsedPackages(new Set())
  }, [])

  const collapseAllPackages = useCallback(() => {
    setCollapsedPackages(new Set(packageNames))
  }, [packageNames])

  return {
    packageNames,
    presetKey,
    setPresetKey,
    highlightedPackages,
    highlightPackage,
    unhighlightPackage,
    highlightPackages,
    unhighlightPackages,
    highlightOnlyPackages,
    highlightAllPackages,
    unhighlightAllPackages,
    highlightMutualPackageDependenciesOnly,
    setHighlightMutualPackageDependenciesOnly,
    packageInfluenceConfig,
    updatePackageInfluence,
    collapsedPackages,
    toggleCollapsedPackage,
    expandAllPackages,
    collapseAllPackages,
  }
}
