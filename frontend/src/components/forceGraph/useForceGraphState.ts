import { useCallback, useEffect, useMemo, useState } from 'react'
import type { PackageSnapshot } from '../../types'
import {
  buildPackageInfluenceConfig,
  updatePackageInfluenceConfig,
} from './graphInfluence'
import type {
  PackageInfluenceConfig,
  PackageInfluenceSettings,
} from './types'

type UseForceGraphStateArgs = {
  packages: PackageSnapshot[]
}

type UseForceGraphStateResult = {
  includedPackages: ReadonlySet<string>
  includePackage: (packageName: string) => void
  unincludePackage: (packageName: string) => void
  includeAllPackages: () => void
  excludeAllPackages: () => void
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

function reconcileKnownPackageSet(
  current: ReadonlySet<string>,
  packageNames: readonly string[],
): Set<string> {
  const next = new Set<string>()

  for (const packageName of packageNames) {
    if (current.has(packageName)) {
      next.add(packageName)
    }
  }

  if (current.size === 0) {
    return next
  }

  for (const packageName of packageNames) {
    if (!current.has(packageName)) {
      next.add(packageName)
    }
  }

  return next
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

  const [includedPackages, setIncludedPackages] = useState<Set<string>>(
    () => new Set(packageNames),
  )
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
    setIncludedPackages((current) =>
      reconcileKnownPackageSet(current, packageNames),
    )

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
      return reconcileKnownPackageSet(current, packageNames)
    })

    setCollapsedPackages((current) =>
      filterKnownPackageNames(current, knownPackageNames),
    )
  }, [knownPackageNames, packageNames])

  useEffect(() => {
    setHighlightedPackages((current) => {
      const next = new Set(current)

      for (const packageName of [...next]) {
        if (!includedPackages.has(packageName)) {
          next.delete(packageName)
        }
      }

      return next
    })
  }, [includedPackages])

  const includePackage = useCallback((packageName: string) => {
    if (!knownPackageNames.has(packageName)) {
      return
    }

    setIncludedPackages((current) => {
      const next = new Set(current)
      next.add(packageName)
      return next
    })
  }, [knownPackageNames])

  const unincludePackage = useCallback((packageName: string) => {
    if (!knownPackageNames.has(packageName)) {
      return
    }

    setIncludedPackages((current) => {
      const next = new Set(current)
      next.delete(packageName)
      return next
    })

    setHighlightedPackages((current) => {
      const next = new Set(current)
      next.delete(packageName)
      return next
    })
  }, [knownPackageNames])

  const highlightPackage = useCallback((packageName: string) => {
    if (!knownPackageNames.has(packageName) || !includedPackages.has(packageName)) {
      return
    }

    setHighlightedPackages((current) => {
      const next = new Set(current)
      next.add(packageName)
      return next
    })
  }, [includedPackages, knownPackageNames])

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
    const names = getKnownPackageNames(
      packageNamesToHighlight,
      knownPackageNames,
    ).filter((packageName) => includedPackages.has(packageName))

    setHighlightedPackages((current) => {
      const next = new Set(current)

      for (const packageName of names) {
        next.add(packageName)
      }

      return next
    })
  }, [includedPackages, knownPackageNames])

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
      new Set(
        [...filterKnownPackageNames(packageNamesToHighlight, knownPackageNames)]
          .filter((packageName) => includedPackages.has(packageName)),
      ),
    )
  }, [includedPackages, knownPackageNames])

  const highlightAllPackages = useCallback(() => {
    setHighlightedPackages(new Set(includedPackages))
  }, [includedPackages])

  const unhighlightAllPackages = useCallback(() => {
    setHighlightedPackages(new Set())
  }, [])

  const includeAllPackages = useCallback(() => {
    setIncludedPackages(new Set(packageNames))
  }, [packageNames])

  const excludeAllPackages = useCallback(() => {
    setIncludedPackages(new Set())
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
    includedPackages,
    includePackage,
    unincludePackage,
    includeAllPackages,
    excludeAllPackages,
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
