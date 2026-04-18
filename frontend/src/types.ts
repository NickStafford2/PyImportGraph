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
  depends_on_packages: string[]
  mutual_dependency_packages: string[]
  is_externally_imported: boolean
  has_mutual_package_dependencies: boolean
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
  is_reciprocal_package_dependency: boolean
  symbol_name?: string
  line?: number
}

export type ForceGraphNodeSnapshot = {
  id: string
  name: string
  displayName: string
  group: string
  val: number
  importCount: number
  importedByCount: number
  externalInterfaceCount: number
}

export type ForceGraphLinkSnapshot = {
  source: string
  target: string
  type: 'symbol_import'
  samePackage: boolean
  weight: number
  sourcePackage: string
  targetPackage: string
  isMutualPackageDependency: boolean
}

export type ForceGraphSnapshot = {
  nodes: ForceGraphNodeSnapshot[]
  links: ForceGraphLinkSnapshot[]
}

export type PackagePanelNodeSnapshot = {
  package_name: string
  children: PackagePanelNodeSnapshot[]
  subtree_package_names: string[]
  externally_imported_subtree_package_names: string[]
  is_externally_imported: boolean
}

export type PackagePanelSnapshot = {
  roots: PackagePanelNodeSnapshot[]
  externally_imported_package_names: string[]
}

export type ProjectSnapshot = {
  schema_version: number
  summary: SummarySnapshot
  packages: PackageSnapshot[]
  modules: ModuleSnapshot[]
  edges: EdgeSnapshot[]
  force_graph: ForceGraphSnapshot
  package_panel: PackagePanelSnapshot
}
