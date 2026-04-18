import type { ModuleSnapshot } from '../../types'

export function buildPackagesWithExternalImporters(
  modules: readonly ModuleSnapshot[],
): Set<string> {
  const packageNames = new Set<string>()

  for (const module of modules) {
    const isImportedOutsideOwnPackage = module.importing_packages.some(
      (importingPackageName) => importingPackageName !== module.package,
    )

    if (isImportedOutsideOwnPackage) {
      packageNames.add(module.package)
    }
  }

  return packageNames
}

export function filterHighlightedPackagesToExternallyImported(
  highlightedPackages: ReadonlySet<string>,
  externallyImportedPackageNames: ReadonlySet<string>,
): Set<string> {
  const next = new Set<string>()

  for (const packageName of highlightedPackages) {
    if (externallyImportedPackageNames.has(packageName)) {
      next.add(packageName)
    }
  }

  return next
}

export function filterPackageNamesToExternallyImported(
  packageNames: readonly string[],
  externallyImportedPackageNames: ReadonlySet<string>,
): string[] {
  return packageNames.filter((packageName) =>
    externallyImportedPackageNames.has(packageName),
  )
}
