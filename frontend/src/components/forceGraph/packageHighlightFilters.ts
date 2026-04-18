export function filterPackageNamesToExternallyImported(
  packageNames: readonly string[],
  externallyImportedPackageNames: ReadonlySet<string>,
): string[] {
  return packageNames.filter((packageName) =>
    externallyImportedPackageNames.has(packageName),
  )
}
