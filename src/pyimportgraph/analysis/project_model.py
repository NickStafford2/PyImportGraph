from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass
from pathlib import Path

from pyimportgraph.analysis.package_dependencies import _build_import_graph
from pyimportgraph.analysis.package_query import PackageQuery
from pyimportgraph.analysis.symbol_usage import (
    Definition,
    _discover_python_files,
    _FromImport,
    _module_name_from_path,
    _parse_module,
    _ParsedDefinition,
    _ParsedFromImport,
)
from pyimportgraph.model.package_tree import PackageTree


@dataclass(frozen=True, slots=True)
class ModuleImportQueryResult:
    module_name: str
    importing_modules: tuple[str, ...]
    importing_packages: tuple[str, ...]


@dataclass(frozen=True, slots=True)
class ProjectModel:
    module_names: tuple[str, ...]
    package_tree: PackageTree
    module_imports: dict[str, tuple[str, ...]]
    module_importers: dict[str, tuple[str, ...]]
    definitions_by_module: dict[str, dict[str, Definition]]
    symbol_imports_by_imported_module: dict[str, tuple[_FromImport, ...]]
    symbol_imports_by_importer_module: dict[str, tuple[_FromImport, ...]]
    package_dependencies: dict[str, tuple[str, ...]]
    reciprocal_package_dependency_pairs: tuple[tuple[str, str], ...]
    packages_with_external_importers_list: tuple[str, ...]
    mutual_dependency_packages_by_package: dict[str, tuple[str, ...]]

    @classmethod
    def build(
        cls,
        package_names: list[str],
        *,
        project_root: str | Path,
        include_external_packages: bool = False,
        exclude_type_checking_imports: bool = False,
        cache_dir: str | Path | None = ".grimp_cache",
    ) -> "ProjectModel":
        root = Path(project_root).resolve()

        discovered_module_names = _discover_module_names_for_packages(
            project_root=root,
            package_names=package_names,
        )

        graph = _build_import_graph(
            package_names=package_names,
            project_root=root,
            include_external_packages=include_external_packages,
            exclude_type_checking_imports=exclude_type_checking_imports,
            cache_dir=cache_dir,
        )

        all_module_names = tuple(sorted({*graph.modules, *discovered_module_names}))
        allowed_module_names = set(all_module_names)
        package_tree = PackageTree.from_module_names(all_module_names)

        module_imports = {
            module_name: tuple(
                sorted(
                    imported_module_name
                    for imported_module_name in graph.find_modules_directly_imported_by(
                        module_name
                    )
                    if imported_module_name in allowed_module_names
                )
            )
            if module_name in graph.modules
            else ()
            for module_name in all_module_names
        }

        module_importers = {
            module_name: tuple(
                sorted(
                    importer_module_name
                    for importer_module_name in graph.find_modules_that_directly_import(
                        module_name
                    )
                    if importer_module_name in allowed_module_names
                )
            )
            if module_name in graph.modules
            else ()
            for module_name in all_module_names
        }

        definitions_by_module, symbol_imports = _build_symbol_model(
            project_root=root,
            package_tree=package_tree,
            allowed_module_names=allowed_module_names,
        )

        symbol_imports_by_imported_module: dict[str, list[_FromImport]] = defaultdict(
            list
        )
        symbol_imports_by_importer_module: dict[str, list[_FromImport]] = defaultdict(
            list
        )

        for item in symbol_imports:
            symbol_imports_by_imported_module[item.imported_module].append(item)
            symbol_imports_by_importer_module[item.importer_module].append(item)

        package_dependencies = _build_package_dependency_map(
            package_tree=package_tree,
            module_imports=module_imports,
        )
        reciprocal_package_dependency_pairs = _build_reciprocal_package_dependencies(
            package_dependencies
        )
        packages_with_external_importers_list = _build_packages_with_external_importers(
            package_tree=package_tree,
            module_importers=module_importers,
        )
        mutual_dependency_packages_by_package = (
            _build_mutual_dependency_packages_by_package(
                reciprocal_package_dependency_pairs
            )
        )

        return cls(
            module_names=all_module_names,
            package_tree=package_tree,
            module_imports=module_imports,
            module_importers=module_importers,
            definitions_by_module=definitions_by_module,
            symbol_imports_by_imported_module={
                module_name: tuple(
                    sorted(
                        imports,
                        key=lambda item: (
                            item.importer_module,
                            item.imported_name,
                            item.line,
                        ),
                    )
                )
                for module_name, imports in sorted(
                    symbol_imports_by_imported_module.items()
                )
            },
            symbol_imports_by_importer_module={
                module_name: tuple(
                    sorted(
                        imports,
                        key=lambda item: (
                            item.imported_module,
                            item.imported_name,
                            item.line,
                        ),
                    )
                )
                for module_name, imports in sorted(
                    symbol_imports_by_importer_module.items()
                )
            },
            package_dependencies=package_dependencies,
            reciprocal_package_dependency_pairs=reciprocal_package_dependency_pairs,
            packages_with_external_importers_list=packages_with_external_importers_list,
            mutual_dependency_packages_by_package=mutual_dependency_packages_by_package,
        )

    def package_names(self) -> tuple[str, ...]:
        return self.package_tree.package_names()

    def root_package_names(self) -> tuple[str, ...]:
        return tuple(
            package_name
            for package_name in self.package_tree.package_names()
            if self.package_tree.node_for_package(package_name).parent_name is None
        )

    def package_query(self, package_name: str) -> PackageQuery:
        self.package_tree.node_for_package(package_name)
        return PackageQuery(model=self, package_name=package_name)

    def module_package_name(self, module_name: str) -> str:
        return self.package_tree.package_for_module(module_name)

    def module_imports_for(self, module_name: str) -> tuple[str, ...]:
        return self.module_imports.get(module_name, ())

    def module_importers_for(self, module_name: str) -> tuple[str, ...]:
        return self.module_importers.get(module_name, ())

    def module_importing_packages(self, module_name: str) -> tuple[str, ...]:
        return tuple(
            sorted(
                {
                    self.module_package_name(importer_module_name)
                    for importer_module_name in self.module_importers_for(module_name)
                }
            )
        )

    def module_external_interface(self, module_name: str) -> tuple[Definition, ...]:
        defining_package_name = self.module_package_name(module_name)
        external_definitions: list[Definition] = []

        for definition in self.definitions_for_module(module_name):
            if self.definition_is_used_outside_package(
                definition_module_name=module_name,
                symbol_name=definition.symbol_name,
                defining_package_name=defining_package_name,
            ):
                external_definitions.append(definition)

        return tuple(
            sorted(
                external_definitions,
                key=lambda item: (item.line, item.symbol_name),
            )
        )

    def definitions_for_module(self, module_name: str) -> tuple[Definition, ...]:
        return tuple(self.definitions_by_module.get(module_name, {}).values())

    def package_dependencies_for(self, package_name: str) -> tuple[str, ...]:
        return self.package_dependencies.get(package_name, ())

    def packages_with_external_importers(self) -> tuple[str, ...]:
        return self.packages_with_external_importers_list

    def reciprocal_package_dependencies(self) -> tuple[tuple[str, str], ...]:
        return self.reciprocal_package_dependency_pairs

    def mutual_dependency_packages_for(self, package_name: str) -> tuple[str, ...]:
        return self.mutual_dependency_packages_by_package.get(package_name, ())

    def has_reciprocal_package_dependency(
        self,
        source_package_name: str,
        target_package_name: str,
    ) -> bool:
        return target_package_name in self.mutual_dependency_packages_for(
            source_package_name
        )

    def cross_package_symbol_use_count(self) -> int:
        count = 0

        for (
            imported_module_name,
            imports,
        ) in self.symbol_imports_by_imported_module.items():
            if imported_module_name not in self.module_names:
                continue

            imported_package_name = self.module_package_name(imported_module_name)

            count += sum(
                1
                for symbol_import in imports
                if symbol_import.importer_module in self.module_names
                and self.module_package_name(symbol_import.importer_module)
                != imported_package_name
            )

        return count

    def find_modules_importing_module(
        self, module_name: str
    ) -> ModuleImportQueryResult:
        importing_modules = self.module_importers_for(module_name)
        importing_packages = self.module_importing_packages(module_name)
        return ModuleImportQueryResult(
            module_name=module_name,
            importing_modules=importing_modules,
            importing_packages=importing_packages,
        )

    def find_external_interface_for_module(self, module_name: str) -> list[Definition]:
        return list(self.module_external_interface(module_name))

    def find_external_interface_for_package(
        self, package_name: str
    ) -> list[Definition]:
        return list(self.package_query(package_name).external_interface)

    def definition_is_used_outside_package(
        self,
        *,
        definition_module_name: str,
        symbol_name: str,
        defining_package_name: str,
    ) -> bool:
        for symbol_import in self.symbol_imports_by_imported_module.get(
            definition_module_name, ()
        ):
            if symbol_import.imported_name != symbol_name:
                continue

            importer_package_name = self.module_package_name(
                symbol_import.importer_module
            )
            if importer_package_name != defining_package_name:
                return True

        return False

    def definition_is_used_outside_package_subtree(
        self,
        *,
        definition_module_name: str,
        symbol_name: str,
        package_name: str,
    ) -> bool:
        for symbol_import in self.symbol_imports_by_imported_module.get(
            definition_module_name, ()
        ):
            if symbol_import.imported_name != symbol_name:
                continue

            if not self.package_tree.contains_module(
                package_name, symbol_import.importer_module
            ):
                return True

        return False


def _build_symbol_model(
    *,
    project_root: Path,
    package_tree: PackageTree,
    allowed_module_names: set[str],
) -> tuple[dict[str, dict[str, Definition]], list[_FromImport]]:
    module_paths = _discover_python_files(project_root)
    module_name_by_path = {
        path: _module_name_from_path(project_root, path) for path in module_paths
    }

    definitions_by_module: dict[str, dict[str, Definition]] = {}
    symbol_imports: list[_FromImport] = []

    for path, module_name in module_name_by_path.items():
        if module_name not in allowed_module_names:
            continue

        parsed = _parse_module(path)

        definitions_by_module[module_name] = {
            symbol_name: _build_definition(
                module_name=module_name,
                package_name=package_tree.package_for_module(module_name),
                parsed_definition=parsed_definition,
            )
            for symbol_name, parsed_definition in parsed.definitions.items()
        }

        for parsed_import in parsed.from_imports:
            if parsed_import.imported_module not in allowed_module_names:
                continue

            symbol_imports.append(
                _build_symbol_import(
                    importer_module=module_name,
                    parsed_import=parsed_import,
                )
            )

    return definitions_by_module, symbol_imports


def _build_definition(
    *,
    module_name: str,
    package_name: str,
    parsed_definition: _ParsedDefinition,
) -> Definition:
    return Definition(
        module_name=module_name,
        package_name=package_name,
        symbol_name=parsed_definition.symbol_name,
        kind=parsed_definition.kind,
        line=parsed_definition.line,
    )


def _build_symbol_import(
    *,
    importer_module: str,
    parsed_import: _ParsedFromImport,
) -> _FromImport:
    return _FromImport(
        importer_module=importer_module,
        imported_module=parsed_import.imported_module,
        imported_name=parsed_import.imported_name,
        line=parsed_import.line,
    )


def _discover_module_names_for_packages(
    *,
    project_root: Path,
    package_names: list[str],
) -> set[str]:
    module_names: set[str] = set()

    for path in _discover_python_files(project_root):
        module_name = _module_name_from_path(project_root, path)
        if any(
            module_name == package_name or module_name.startswith(f"{package_name}.")
            for package_name in package_names
        ):
            module_names.add(module_name)

    return module_names


def _build_package_dependency_map(
    *,
    package_tree: PackageTree,
    module_imports: dict[str, tuple[str, ...]],
) -> dict[str, tuple[str, ...]]:
    dependencies: dict[str, set[str]] = {
        package_name: set() for package_name in package_tree.package_names()
    }

    for importer_module_name, imported_module_names in module_imports.items():
        importer_package_name = package_tree.package_for_module(importer_module_name)

        for imported_module_name in imported_module_names:
            imported_package_name = package_tree.package_for_module(
                imported_module_name
            )
            if imported_package_name == importer_package_name:
                continue

            dependencies[importer_package_name].add(imported_package_name)

    return {
        package_name: tuple(sorted(imported_package_names))
        for package_name, imported_package_names in sorted(dependencies.items())
    }


def _build_reciprocal_package_dependencies(
    package_dependencies: dict[str, tuple[str, ...]],
) -> tuple[tuple[str, str], ...]:
    reciprocal_pairs: set[tuple[str, str]] = set()

    for source_package_name, target_package_names in package_dependencies.items():
        for target_package_name in target_package_names:
            reverse_dependencies = package_dependencies.get(target_package_name, ())
            if source_package_name in reverse_dependencies:
                reciprocal_pairs.add((source_package_name, target_package_name))

    return tuple(sorted(reciprocal_pairs))


def _build_packages_with_external_importers(
    *,
    package_tree: PackageTree,
    module_importers: dict[str, tuple[str, ...]],
) -> tuple[str, ...]:
    packages_with_external_importers: list[str] = []

    for package_name in package_tree.package_names():
        subtree_module_names = set(package_tree.subtree_module_names(package_name))
        has_external_importer = any(
            importer_module_name not in subtree_module_names
            for imported_module_name in subtree_module_names
            for importer_module_name in module_importers.get(imported_module_name, ())
        )
        if has_external_importer:
            packages_with_external_importers.append(package_name)

    return tuple(sorted(packages_with_external_importers))


def _build_mutual_dependency_packages_by_package(
    reciprocal_pairs: tuple[tuple[str, str], ...],
) -> dict[str, tuple[str, ...]]:
    values: dict[str, set[str]] = {}

    for source_package_name, target_package_name in reciprocal_pairs:
        values.setdefault(source_package_name, set()).add(target_package_name)

    return {
        package_name: tuple(sorted(other_package_names))
        for package_name, other_package_names in sorted(values.items())
    }
