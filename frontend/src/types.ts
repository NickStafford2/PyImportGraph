export type SummarySnapshot = {
  package_count: number
  module_count: number
  packages_with_external_interface: number
  modules_with_external_interface: number
  cross_package_symbol_use_count: number
}

export type DefinitionSnapshot = {
  module_name: string
  package_name: string
  symbol_name: string
  kind: string
  line: number
}

export type PackageSnapshot = {
  name: string
  parent: string | null
  children: string[]
  direct_modules: string[]
  subtree_modules: string[]
  imported_by_modules: string[]
  imported_by_packages: string[]
  external_interface: DefinitionSnapshot[]
}

export type ModuleSnapshot = {
  name: string
  package: string
  imports: string[]
  imported_by: string[]
  importing_packages: string[]
  external_interface: DefinitionSnapshot[]
}

export type EdgeSnapshot = {
  type: 'module_import' | 'symbol_import'
  from: string
  to: string
  from_package: string
  to_package: string
  symbol_name?: string
  line?: number
}

export type ReciprocalPackageDependencySnapshot = {
  from_package: string
  to_package: string
}

export type PackageDependencySummarySnapshot = {
  package: string
  depends_on: string[]
  dependency_count: number
  is_imported_outside_package: boolean
  has_reciprocal_dependencies: boolean
}

export type ProjectSnapshot = {
  schema_version: number
  summary: SummarySnapshot
  packages: PackageSnapshot[]
  modules: ModuleSnapshot[]
  edges: EdgeSnapshot[]
  reciprocal_package_dependencies: ReciprocalPackageDependencySnapshot[]
  packages_with_external_importers: string[]
  package_dependency_summary: PackageDependencySummarySnapshot[]
}
