// frontend/src/components/forceGraph/useForceGraphState.ts

import { useEffect, useMemo, useState } from 'react'
import type { ModuleSnapshot, PackageSnapshot } from '../../types'
import {
  buildPackageInfluenceConfig,
  updatePackageInfluenceConfig,
} from './graphInfluence'
import {
  buildPackagesWithExternalImporters,
  filterHighlightedPackagesToExternallyImported,
} from './packageHighlightFilters'
import { DEFAULT_FORCE_PRESET } from './presets'
import type {
  ForcePresetKey,
  PackageInfluenceConfig,
  PackageInfluenceSettings,
} from './types'

type UseForceGraphStateArgs = {
  packages: PackageSnapshot[]
  modules: ModuleSnapshot[]
}

type UseForceGraphStateResult = {
  packageNames: string[]
  presetKey: ForcePresetKey
  setPresetKey: (value: ForcePresetKey) => void
  highlightedPackages: ReadonlySet<string>
  effectiveHighlightedPackages: ReadonlySet<string>
  packagesWithExternalImporters: ReadonlySet<string>
  showOnlyExternallyImportedPackages: boolean
  setShowOnlyExternallyImportedPackages: (value: boolean) => void
  highlightPackage: (packageName: string) => void
  unhighlightPackage: (packageName: string) => void
  highlightPackages: (packageNames: Iterable<string>) => void
  unhighlightPackages: (packageNames: Iterable<string>) => void
  highlightOnlyPackages: (packageNames: Iterable<string>) => void
  highlightAllPackages: () => void
  unhighlightAllPackages: () => void
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
  modules,
}: UseForceGraphStateArgs): UseForceGraphStateResult {
  const packageNames = useMemo(() => {
    return packages
      .map((item) => item.name)
      .sort((left, right) => left.localeCompare(right))
  }, [packages])

  const knownPackageNames = useMemo(() => {
    return new Set(packageNames)
  }, [packageNames])

  const packagesWithExternalImporters = useMemo(() => {
    return buildPackagesWithExternalImporters(modules)
  }, [modules])

  const [presetKey, setPresetKey] =
    useState<ForcePresetKey>(DEFAULT_FORCE_PRESET)

  const [highlightedPackages, setHighlightedPackages] = useState<Set<string>>(
    () => new Set(packageNames),
  )

  const [showOnlyExternallyImportedPackages, setShowOnlyExternallyImportedPackages] =
    useState(false)

  const [collapsedPackages, setCollapsedPackages] = useState<Set<string>>(
    () => new Set(),
  )

  const [packageInfluenceConfig, setPackageInfluenceConfig] =
    useState<PackageInfluenceConfig>(() => buildPackageInfluenceConfig(packageNames))

  const effectiveHighlightedPackages = useMemo(() => {
    if (!showOnlyExternallyImportedPackages) {
      return highlightedPackages
    }

    return filterHighlightedPackagesToExternallyImported(
      highlightedPackages,
      packagesWithExternalImporters,
    )
  }, [
    highlightedPackages,
    packagesWithExternalImporters,
    showOnlyExternallyImportedPackages,
  ])

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

  function highlightPackage(packageName: string) {
    if (!knownPackageNames.has(packageName)) {
      return
    }

    setHighlightedPackages((current) => {
      const next = new Set(current)
      next.add(packageName)
      return next
    })
  }

  function unhighlightPackage(packageName: string) {
    if (!knownPackageNames.has(packageName)) {
      return
    }

    setHighlightedPackages((current) => {
      const next = new Set(current)
      next.delete(packageName)
      return next
    })
  }

  function highlightPackages(packageNamesToHighlight: Iterable<string>) {
    const names = getKnownPackageNames(packageNamesToHighlight, knownPackageNames)

    setHighlightedPackages((current) => {
      const next = new Set(current)

      for (const packageName of names) {
        next.add(packageName)
      }

      return next
    })
  }

  function unhighlightPackages(packageNamesToUnhighlight: Iterable<string>) {
    const names = getKnownPackageNames(packageNamesToUnhighlight, knownPackageNames)

    setHighlightedPackages((current) => {
      const next = new Set(current)

      for (const packageName of names) {
        next.delete(packageName)
      }

      return next
    })
  }

  function highlightOnlyPackages(packageNamesToHighlight: Iterable<string>) {
    setHighlightedPackages(
      filterKnownPackageNames(packageNamesToHighlight, knownPackageNames),
    )
  }

  function highlightAllPackages() {
    setHighlightedPackages(new Set(packageNames))
  }

  function unhighlightAllPackages() {
    setHighlightedPackages(new Set())
  }

  function updatePackageInfluence(
    packageName: string,
    nextSettings: PackageInfluenceSettings,
  ) {
    setPackageInfluenceConfig((currentConfig) =>
      updatePackageInfluenceConfig(currentConfig, packageName, nextSettings),
    )
  }

  function toggleCollapsedPackage(packageName: string) {
    setCollapsedPackages((current) => {
      const next = new Set(current)

      if (next.has(packageName)) {
        next.delete(packageName)
      } else {
        next.add(packageName)
      }

      return next
    })
  }

  function expandAllPackages() {
    setCollapsedPackages(new Set())
  }

  function collapseAllPackages() {
    setCollapsedPackages(new Set(packageNames))
  }

  return {
    packageNames,
    presetKey,
    setPresetKey,
    highlightedPackages,
    effectiveHighlightedPackages,
    packagesWithExternalImporters,
    showOnlyExternallyImportedPackages,
    setShowOnlyExternallyImportedPackages,
    highlightPackage,
    unhighlightPackage,
    highlightPackages,
    unhighlightPackages,
    highlightOnlyPackages,
    highlightAllPackages,
    unhighlightAllPackages,
    packageInfluenceConfig,
    updatePackageInfluence,
    collapsedPackages,
    toggleCollapsedPackage,
    expandAllPackages,
    collapseAllPackages,
  }
}
