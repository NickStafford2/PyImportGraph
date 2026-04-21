from __future__ import annotations

from itertools import combinations
from typing import Any

from pyimportgraph.analysis import ProjectModel
from pyimportgraph.analysis.package_query import PackageQuery

SCHEMA_VERSION = 10


def build_project_snapshot(model: ProjectModel) -> dict[str, Any]:
    return {
        "schema_version": SCHEMA_VERSION,
        "summary": _build_summary_snapshot(model),
        "packages": [
            _build_package_snapshot(model.package_query(package_name))
            for package_name in model.package_names()
        ],
        "modules": [
            _build_module_snapshot(model, module_name)
            for module_name in model.module_names
        ],
        "edges": _build_edge_snapshots(model),
        "force_graph": _build_force_graph_snapshot(model),
        "package_panel": _build_package_panel_snapshot(model),
    }


def _build_summary_snapshot(model: ProjectModel) -> dict[str, Any]:
    package_names = model.package_names()

    return {
        "package_count": len(package_names),
        "module_count": len(model.module_names),
        "packages_with_external_interface": sum(
            1
            for package_name in package_names
            if model.package_query(package_name).external_interface
        ),
        "modules_with_external_interface": sum(
            1
            for module_name in model.module_names
            if model.module_external_interface(module_name)
        ),
        "cross_package_symbol_use_count": model.cross_package_symbol_use_count(),
    }


def _build_package_snapshot(query: PackageQuery) -> dict[str, Any]:
    return {
        "name": query.package_name,
        "parent": query.parent_name,
        "children": list(query.child_package_names),
        "direct_modules": list(query.direct_module_names),
        "subtree_modules": list(query.subtree_module_names),
        "imported_by_modules": list(query.importer_module_names),
        "imported_by_packages": list(query.importer_package_names),
        "depends_on_packages": list(query.depends_on_packages),
        "mutual_dependency_packages": list(query.mutual_dependency_packages),
        "is_externally_imported": query.is_externally_imported,
        "has_mutual_package_dependencies": query.has_mutual_package_dependencies,
        "external_interface": [
            _build_definition_snapshot(definition)
            for definition in query.external_interface
        ],
    }


def _build_module_snapshot(model: ProjectModel, module_name: str) -> dict[str, Any]:
    return {
        "name": module_name,
        "package": model.module_package_name(module_name),
        "imports": list(model.module_imports_for(module_name)),
        "imported_by": list(model.module_importers_for(module_name)),
        "importing_packages": list(model.module_importing_packages(module_name)),
        "external_interface": [
            _build_definition_snapshot(definition)
            for definition in model.module_external_interface(module_name)
        ],
    }


def _build_definition_snapshot(definition: Any) -> dict[str, Any]:
    return {
        "module_name": definition.module_name,
        "package_name": definition.package_name,
        "symbol_name": definition.symbol_name,
        "kind": definition.kind,
        "line": definition.line,
    }


def _build_edge_snapshots(model: ProjectModel) -> list[dict[str, Any]]:
    edges: list[dict[str, Any]] = []

    for importer_module_name, imported_module_names in sorted(
        model.module_imports.items()
    ):
        from_package = model.module_package_name(importer_module_name)

        for imported_module_name in imported_module_names:
            to_package = model.module_package_name(imported_module_name)
            edges.append(
                {
                    "type": "module_import",
                    "from": importer_module_name,
                    "to": imported_module_name,
                    "from_package": from_package,
                    "to_package": to_package,
                    "is_reciprocal_package_dependency": (
                        model.has_reciprocal_package_dependency(
                            from_package,
                            to_package,
                        )
                    ),
                }
            )

    for imported_module_name, imports in sorted(
        model.symbol_imports_by_imported_module.items()
    ):
        if imported_module_name not in model.module_names:
            continue

        to_package = model.module_package_name(imported_module_name)

        for item in imports:
            if item.importer_module not in model.module_names:
                continue

            from_package = model.module_package_name(item.importer_module)
            edges.append(
                {
                    "type": "symbol_import",
                    "from": item.importer_module,
                    "to": imported_module_name,
                    "from_package": from_package,
                    "to_package": to_package,
                    "is_reciprocal_package_dependency": (
                        model.has_reciprocal_package_dependency(
                            from_package,
                            to_package,
                        )
                    ),
                    "symbol_name": item.imported_name,
                    "line": item.line,
                }
            )

    return edges


def _build_force_graph_snapshot(model: ProjectModel) -> dict[str, Any]:
    nodes = []
    for module_name in model.module_names:
        package_name = model.module_package_name(module_name)
        import_count = len(model.module_imports_for(module_name))
        imported_by_count = len(model.module_importers_for(module_name))
        external_interface_count = len(model.module_external_interface(module_name))

        nodes.append(
            {
                "module_name": module_name,
                "package_name": package_name,
                "import_count": import_count,
                "imported_by_count": imported_by_count,
                "external_interface_count": external_interface_count,
            }
        )

    links = []
    for imported_module_name, imports in sorted(
        model.symbol_imports_by_imported_module.items()
    ):
        if imported_module_name not in model.module_names:
            continue

        for item in imports:
            if item.importer_module not in model.module_names:
                continue

            source_package = model.module_package_name(item.importer_module)
            target_package = model.module_package_name(imported_module_name)
            same_package = source_package == target_package

            links.append(
                {
                    "source_module_name": item.importer_module,
                    "target_module_name": imported_module_name,
                    "type": "symbol_import",
                    "is_same_package": same_package,
                    "source_package_name": source_package,
                    "target_package_name": target_package,
                    "is_mutual_package_dependency": (
                        model.has_reciprocal_package_dependency(
                            source_package,
                            target_package,
                        )
                    ),
                }
            )

    module_names = set(model.module_names)

    for package_name in sorted(model.package_names()):
        parent_package_name = model.package_query(package_name).parent_name
        if parent_package_name is None:
            continue

        if (
            package_name not in module_names
            or parent_package_name not in module_names
        ):
            continue

        links.append(
            {
                "source_module_name": parent_package_name,
                "target_module_name": package_name,
                "type": "package_child",
                "is_same_package": False,
                "source_package_name": parent_package_name,
                "target_package_name": package_name,
                "is_mutual_package_dependency": False,
            }
        )

    sibling_groups: dict[str, list[str]] = {}
    for package_name in sorted(model.package_names()):
        parent_package_name = model.package_query(package_name).parent_name
        if parent_package_name is None:
            continue

        sibling_groups.setdefault(parent_package_name, []).append(package_name)

    for sibling_package_names in sibling_groups.values():
        available_sibling_package_names = [
            package_name
            for package_name in sibling_package_names
            if package_name in module_names
        ]

        for source_package_name, target_package_name in combinations(
            available_sibling_package_names, 2
        ):
            links.append(
                {
                    "source_module_name": source_package_name,
                    "target_module_name": target_package_name,
                    "type": "package_sibling",
                    "is_same_package": False,
                    "source_package_name": source_package_name,
                    "target_package_name": target_package_name,
                    "is_mutual_package_dependency": False,
                }
            )

    return {
        "nodes": nodes,
        "links": links,
    }


def _build_package_panel_snapshot(model: ProjectModel) -> dict[str, Any]:
    externally_imported_package_names = list(model.packages_with_external_importers())

    return {
        "roots": [
            _build_package_panel_node(model.package_query(package_name))
            for package_name in model.root_package_names()
        ],
        "externally_imported_package_names": externally_imported_package_names,
    }


def _build_package_panel_node(query: PackageQuery) -> dict[str, Any]:
    return {
        "package_name": query.package_name,
        "children": [
            _build_package_panel_node(child_query)
            for child_query in query.node_children
        ],
        "subtree_package_names": list(query.subtree_package_names),
        "externally_imported_subtree_package_names": list(
            query.externally_imported_subtree_package_names
        ),
        "is_externally_imported": query.is_externally_imported,
    }
