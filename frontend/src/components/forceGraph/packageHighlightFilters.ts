export function buildPackagesWithExternalImporters(
  packageNames: readonly string[],
): Set<string> {
  return new Set(packageNames)
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
