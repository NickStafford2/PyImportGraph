import { useEffect, useMemo, useState } from 'react'
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
  toggleHighlightedPackage: (packageName: string) => void
  toggleHighlightedPackages: (packageNames: Iterable<string>) => void
  selectOnlyHighlightedPackages: (packageNames: Iterable<string>) => void
  clearHighlightedPackages: () => void
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
  values: ReadonlySet<string>,
  knownPackageNames: ReadonlySet<string>,
): Set<string> {
  return new Set(
    [...values].filter((packageName) => knownPackageNames.has(packageName)),
  )
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
    () => new Set(),
  )

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

    setHighlightedPackages((current) =>
      filterKnownPackageNames(current, knownPackageNames),
    )

    setCollapsedPackages((current) =>
      filterKnownPackageNames(current, knownPackageNames),
    )
  }, [knownPackageNames, packageNames])

  function toggleHighlightedPackage(packageName: string) {
    setHighlightedPackages((current) => {
      const next = new Set(current)

      if (next.has(packageName)) {
        next.delete(packageName)
      } else {
        next.add(packageName)
      }

      return next
    })
  }

  function toggleHighlightedPackages(packageNamesToToggle: Iterable<string>) {
    const names = [...packageNamesToToggle].filter((packageName) =>
      knownPackageNames.has(packageName),
    )

    setHighlightedPackages((current) => {
      const next = new Set(current)
      const shouldSelectAll = names.some((packageName) => !current.has(packageName))

      for (const packageName of names) {
        if (shouldSelectAll) {
          next.add(packageName)
        } else {
          next.delete(packageName)
        }
      }

      return next
    })
  }

  function selectOnlyHighlightedPackages(packageNamesToSelect: Iterable<string>) {
    setHighlightedPackages(
      filterKnownPackageNames(new Set(packageNamesToSelect), knownPackageNames),
    )
  }

  function clearHighlightedPackages() {
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
    toggleHighlightedPackage,
    toggleHighlightedPackages,
    selectOnlyHighlightedPackages,
    clearHighlightedPackages,
    packageInfluenceConfig,
    updatePackageInfluence,
    collapsedPackages,
    toggleCollapsedPackage,
    expandAllPackages,
    collapseAllPackages,
  }
}
