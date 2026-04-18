from __future__ import annotations

from typing import Any

from pyimportgraph.analysis import ProjectModel
from pyimportgraph.serialization.frontend_snapshot import (
    build_frontend_analysis_snapshot,
)

SCHEMA_VERSION = 2


def build_project_snapshot(model: ProjectModel) -> dict[str, Any]:
    snapshot = {
        "schema_version": SCHEMA_VERSION,
        "summary": _build_summary_snapshot(model),
        "packages": [
            _build_package_snapshot(model, package_name)
            for package_name in model.package_tree.package_names()
        ],
        "modules": [
            _build_module_snapshot(model, module_name)
            for module_name in model.module_names
        ],
        "edges": _build_edge_snapshots(model),
    }

    snapshot.update(build_frontend_analysis_snapshot(model))
    return snapshot


def _build_summary_snapshot(model: ProjectModel) -> dict[str, Any]:
    package_names = list(model.package_tree.package_names())

    modules_with_external_interface = sum(
        1
        for module_name in model.module_names
        if model.find_external_interface_for_module(module_name)
    )

    packages_with_external_interface = sum(
        1
        for package_name in package_names
        if model.find_external_interface_for_package(package_name)
    )

    cross_package_symbol_use_count = 0
    for (
        imported_module_name,
        imports,
    ) in model.symbol_imports_by_imported_module.items():
        if imported_module_name not in model.module_names:
            continue

        imported_package_name = model.package_tree.package_for_module(
            imported_module_name
        )

        cross_package_symbol_use_count += sum(
            1
            for symbol_import in imports
            if symbol_import.importer_module in model.module_names
            and model.package_tree.package_for_module(symbol_import.importer_module)
            != imported_package_name
        )

    return {
        "package_count": len(package_names),
        "module_count": len(model.module_names),
        "packages_with_external_interface": packages_with_external_interface,
        "modules_with_external_interface": modules_with_external_interface,
        "cross_package_symbol_use_count": cross_package_symbol_use_count,
    }


def _build_package_snapshot(
    model: ProjectModel,
    package_name: str,
) -> dict[str, Any]:
    node = model.package_tree.node_for_package(package_name)
    importer_result = model.find_modules_importing_package(package_name)
    external_interface = model.find_external_interface_for_package(package_name)

    return {
        "name": package_name,
        "parent": node.parent_name,
        "children": list(node.child_names),
        "direct_modules": list(node.direct_module_names),
        "subtree_modules": list(node.subtree_module_names),
        "imported_by_modules": list(importer_result.importing_modules),
        "imported_by_packages": list(importer_result.importing_packages),
        "external_interface": [
            {
                "module_name": definition.module_name,
                "package_name": definition.package_name,
                "symbol_name": definition.symbol_name,
                "kind": definition.kind,
                "line": definition.line,
            }
            for definition in external_interface
        ],
    }


def _build_module_snapshot(
    model: ProjectModel,
    module_name: str,
) -> dict[str, Any]:
    importer_result = model.find_modules_importing_module(module_name)
    external_interface = model.find_external_interface_for_module(module_name)

    return {
        "name": module_name,
        "package": model.package_tree.package_for_module(module_name),
        "imports": list(model.module_imports.get(module_name, ())),
        "imported_by": list(importer_result.importing_modules),
        "importing_packages": list(importer_result.importing_packages),
        "external_interface": [
            {
                "module_name": definition.module_name,
                "package_name": definition.package_name,
                "symbol_name": definition.symbol_name,
                "kind": definition.kind,
                "line": definition.line,
            }
            for definition in external_interface
        ],
    }


def _build_edge_snapshots(model: ProjectModel) -> list[dict[str, Any]]:
    edges: list[dict[str, Any]] = []

    for importer_module_name, imported_module_names in sorted(
        model.module_imports.items()
    ):
        for imported_module_name in imported_module_names:
            edges.append(
                {
                    "type": "module_import",
                    "from": importer_module_name,
                    "to": imported_module_name,
                    "from_package": model.package_tree.package_for_module(
                        importer_module_name
                    ),
                    "to_package": model.package_tree.package_for_module(
                        imported_module_name
                    ),
                }
            )

    for imported_module_name, imports in sorted(
        model.symbol_imports_by_imported_module.items()
    ):
        if imported_module_name not in model.module_names:
            continue

        for item in imports:
            if item.importer_module not in model.module_names:
                continue

            edges.append(
                {
                    "type": "symbol_import",
                    "from": item.importer_module,
                    "to": imported_module_name,
                    "from_package": model.package_tree.package_for_module(
                        item.importer_module
                    ),
                    "to_package": model.package_tree.package_for_module(
                        imported_module_name
                    ),
                    "symbol_name": item.imported_name,
                    "line": item.line,
                }
            )

    return edges
