import type { EdgeSnapshot, ModuleSnapshot, PackageSnapshot } from '../types'

export function matchesPackage(item: PackageSnapshot, query: string): boolean {
  if (!query) {
    return true
  }

  const haystack = [
    item.name,
    item.parent ?? '',
    ...item.children,
    ...item.direct_modules,
    ...item.subtree_modules,
    ...item.imported_by_modules,
    ...item.imported_by_packages,
    ...item.external_interface.flatMap((definition) => [
      definition.symbol_name,
      definition.kind,
      definition.module_name,
      definition.package_name,
    ]),
  ]
    .join(' ')
    .toLowerCase()

  return haystack.includes(query)
}

export function matchesModule(item: ModuleSnapshot, query: string): boolean {
  if (!query) {
    return true
  }

  const haystack = [
    item.name,
    item.package,
    ...item.imports,
    ...item.imported_by,
    ...item.importing_packages,
    ...item.external_interface.flatMap((definition) => [
      definition.symbol_name,
      definition.kind,
      definition.module_name,
      definition.package_name,
    ]),
  ]
    .join(' ')
    .toLowerCase()

  return haystack.includes(query)
}

export function matchesEdge(item: EdgeSnapshot, query: string): boolean {
  if (!query) {
    return true
  }

  const haystack = [
    item.type,
    item.from,
    item.to,
    item.from_package,
    item.to_package,
    item.symbol_name ?? '',
    item.line != null ? String(item.line) : '',
  ]
    .join(' ')
    .toLowerCase()

  return haystack.includes(query)
}
