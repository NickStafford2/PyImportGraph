from __future__ import annotations

from dataclasses import dataclass
from typing import TYPE_CHECKING

from pyimportgraph.analysis.symbol_usage import Definition

if TYPE_CHECKING:
    from pyimportgraph.analysis.project_model import ProjectModel


@dataclass(frozen=True, slots=True)
class PackageImportQueryResult:
    package_name: str
    imported_module_names: tuple[str, ...]
    importing_modules: tuple[str, ...]
    importing_packages: tuple[str, ...]


@dataclass(frozen=True, slots=True)
class PackageQuery:
    model: "ProjectModel"
    package_name: str

    @property
    def parent_name(self) -> str | None:
        return self._node.parent_name

    @property
    def child_package_names(self) -> tuple[str, ...]:
        return self._node.child_names

    @property
    def direct_module_names(self) -> tuple[str, ...]:
        return self._node.direct_module_names

    @property
    def subtree_module_names(self) -> tuple[str, ...]:
        return self._node.subtree_module_names

    @property
    def subtree_package_names(self) -> tuple[str, ...]:
        return self._node.subtree_package_names

    @property
    def externally_imported_subtree_package_names(self) -> tuple[str, ...]:
        externally_imported = set(self.model.packages_with_external_importers())
        return tuple(
            package_name
            for package_name in self.subtree_package_names
            if package_name in externally_imported
        )

    @property
    def importers(self) -> PackageImportQueryResult:
        subtree_module_names = set(self.subtree_module_names)

        importing_modules = tuple(
            sorted(
                {
                    importer_module_name
                    for imported_module_name in subtree_module_names
                    for importer_module_name in self.model.module_importers_for(
                        imported_module_name
                    )
                    if importer_module_name not in subtree_module_names
                }
            )
        )

        importing_packages = tuple(
            sorted(
                {
                    self.model.module_package_name(importer_module_name)
                    for importer_module_name in importing_modules
                }
            )
        )

        return PackageImportQueryResult(
            package_name=self.package_name,
            imported_module_names=self.subtree_module_names,
            importing_modules=importing_modules,
            importing_packages=importing_packages,
        )

    @property
    def importer_module_names(self) -> tuple[str, ...]:
        return self.importers.importing_modules

    @property
    def importer_package_names(self) -> tuple[str, ...]:
        return self.importers.importing_packages

    @property
    def depends_on_packages(self) -> tuple[str, ...]:
        return self.model.package_dependencies_for(self.package_name)

    @property
    def mutual_dependency_packages(self) -> tuple[str, ...]:
        return self.model.mutual_dependency_packages_for(self.package_name)

    @property
    def is_externally_imported(self) -> bool:
        return self.package_name in self.model.packages_with_external_importers()

    @property
    def has_mutual_package_dependencies(self) -> bool:
        return bool(self.mutual_dependency_packages)

    @property
    def external_interface(self) -> tuple[Definition, ...]:
        external_definitions: list[Definition] = []

        for module_name in self.subtree_module_names:
            for definition in self.model.definitions_for_module(module_name):
                if self.model.definition_is_used_outside_package_subtree(
                    definition_module_name=module_name,
                    symbol_name=definition.symbol_name,
                    package_name=self.package_name,
                ):
                    external_definitions.append(definition)

        return tuple(
            sorted(
                external_definitions,
                key=lambda item: (
                    item.module_name,
                    item.line,
                    item.symbol_name,
                ),
            )
        )

    @property
    def node_children(self) -> tuple["PackageQuery", ...]:
        return tuple(
            self.model.package_query(child_package_name)
            for child_package_name in self.child_package_names
        )

    @property
    def _node(self):
        return self.model.package_tree.node_for_package(self.package_name)
