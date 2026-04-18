from __future__ import annotations

from typing import Any

from pyimportgraph.analysis import ProjectModel

SCHEMA_VERSION = 7


def build_project_snapshot(model: ProjectModel) -> dict[str, Any]:
    package_dependency_map = model.package_dependency_map()
    reciprocal_pairs = model.reciprocal_package_dependencies()
    packages_with_external_importers = set(model.packages_with_external_importers())

    reciprocal_keys = {
        _make_directed_package_key(source_package_name, target_package_name)
        for source_package_name, target_package_name in reciprocal_pairs
    }
    reciprocal_packages_by_package = _build_reciprocal_packages_by_package(
        reciprocal_pairs
    )

    return {
        "schema_version": SCHEMA_VERSION,
        "summary": _build_summary_snapshot(model),
        "packages": [
            _build_package_snapshot(
                model=model,
                package_name=package_name,
                package_dependency_map=package_dependency_map,
                reciprocal_packages_by_package=reciprocal_packages_by_package,
                packages_with_external_importers=packages_with_external_importers,
            )
            for package_name in model.package_tree.package_names()
        ],
        "modules": [
            _build_module_snapshot(model, module_name)
            for module_name in model.module_names
        ],
        "edges": _build_edge_snapshots(model, reciprocal_keys),
        "force_graph": _build_force_graph_snapshot(model, reciprocal_keys),
        "package_panel": _build_package_panel_snapshot(
            model=model,
            packages_with_external_importers=packages_with_external_importers,
        ),
    }


def _make_directed_package_key(from_package: str, to_package: str) -> str:
    return f"{from_package}→{to_package}"


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
    *,
    model: ProjectModel,
    package_name: str,
    package_dependency_map: dict[str, tuple[str, ...]],
    reciprocal_packages_by_package: dict[str, tuple[str, ...]],
    packages_with_external_importers: set[str],
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
        "depends_on_packages": list(package_dependency_map.get(package_name, ())),
        "mutual_dependency_packages": list(
            reciprocal_packages_by_package.get(package_name, ())
        ),
        "is_externally_imported": package_name in packages_with_external_importers,
        "has_mutual_package_dependencies": bool(
            reciprocal_packages_by_package.get(package_name)
        ),
        "external_interface": [
            _build_definition_snapshot(definition) for definition in external_interface
        ],
    }


def _build_module_snapshot(model: ProjectModel, module_name: str) -> dict[str, Any]:
    package_name = model.package_tree.package_for_module(module_name)
    importing_modules = model.module_importers.get(module_name, ())
    importing_packages = tuple(
        sorted(
            {
                model.package_tree.package_for_module(importer_module_name)
                for importer_module_name in importing_modules
            }
        )
    )

    return {
        "name": module_name,
        "package": package_name,
        "imports": list(model.module_imports.get(module_name, ())),
        "imported_by": list(importing_modules),
        "importing_packages": list(importing_packages),
        "external_interface": [
            _build_definition_snapshot(definition)
            for definition in model.find_external_interface_for_module(module_name)
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


def _build_edge_snapshots(
    model: ProjectModel,
    reciprocal_keys: set[str],
) -> list[dict[str, Any]]:
    edges: list[dict[str, Any]] = []

    for importer_module_name, imported_module_names in sorted(
        model.module_imports.items()
    ):
        from_package = model.package_tree.package_for_module(importer_module_name)

        for imported_module_name in imported_module_names:
            to_package = model.package_tree.package_for_module(imported_module_name)
            edges.append(
                {
                    "type": "module_import",
                    "from": importer_module_name,
                    "to": imported_module_name,
                    "from_package": from_package,
                    "to_package": to_package,
                    "is_reciprocal_package_dependency": _make_directed_package_key(
                        from_package,
                        to_package,
                    )
                    in reciprocal_keys,
                }
            )

    for imported_module_name, imports in sorted(
        model.symbol_imports_by_imported_module.items()
    ):
        if imported_module_name not in model.module_names:
            continue

        to_package = model.package_tree.package_for_module(imported_module_name)

        for item in imports:
            if item.importer_module not in model.module_names:
                continue

            from_package = model.package_tree.package_for_module(item.importer_module)
            edges.append(
                {
                    "type": "symbol_import",
                    "from": item.importer_module,
                    "to": imported_module_name,
                    "from_package": from_package,
                    "to_package": to_package,
                    "is_reciprocal_package_dependency": _make_directed_package_key(
                        from_package,
                        to_package,
                    )
                    in reciprocal_keys,
                    "symbol_name": item.imported_name,
                    "line": item.line,
                }
            )

    return edges


def _build_force_graph_snapshot(
    model: ProjectModel,
    reciprocal_keys: set[str],
) -> dict[str, Any]:
    nodes = []
    for module_name in model.module_names:
        package_name = model.package_tree.package_for_module(module_name)
        import_count = len(model.module_imports.get(module_name, ()))
        imported_by_count = len(model.module_importers.get(module_name, ()))
        external_interface_count = len(
            model.find_external_interface_for_module(module_name)
        )

        nodes.append(
            {
                "id": module_name,
                "name": module_name,
                "displayName": module_name,
                "group": package_name,
                "val": max(
                    2,
                    1 + import_count + imported_by_count + external_interface_count,
                ),
                "importCount": import_count,
                "importedByCount": imported_by_count,
                "externalInterfaceCount": external_interface_count,
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

            source_package = model.package_tree.package_for_module(item.importer_module)
            target_package = model.package_tree.package_for_module(imported_module_name)
            same_package = source_package == target_package

            links.append(
                {
                    "source": item.importer_module,
                    "target": imported_module_name,
                    "type": "symbol_import",
                    "samePackage": same_package,
                    "weight": 1 if same_package else 0.5,
                    "sourcePackage": source_package,
                    "targetPackage": target_package,
                    "isMutualPackageDependency": _make_directed_package_key(
                        source_package,
                        target_package,
                    )
                    in reciprocal_keys,
                }
            )

    return {
        "nodes": nodes,
        "links": links,
    }


def _build_package_panel_snapshot(
    *,
    model: ProjectModel,
    packages_with_external_importers: set[str],
) -> dict[str, Any]:
    root_package_names = sorted(
        package_name
        for package_name in model.package_tree.package_names()
        if model.package_tree.node_for_package(package_name).parent_name is None
    )

    return {
        "roots": [
            _build_package_panel_node(
                model=model,
                package_name=package_name,
                packages_with_external_importers=packages_with_external_importers,
            )
            for package_name in root_package_names
        ],
        "externally_imported_package_names": sorted(packages_with_external_importers),
    }


def _build_package_panel_node(
    *,
    model: ProjectModel,
    package_name: str,
    packages_with_external_importers: set[str],
) -> dict[str, Any]:
    node = model.package_tree.node_for_package(package_name)

    return {
        "package_name": package_name,
        "children": [
            _build_package_panel_node(
                model=model,
                package_name=child_package_name,
                packages_with_external_importers=packages_with_external_importers,
            )
            for child_package_name in node.child_names
        ],
        "subtree_package_names": list(node.subtree_package_names),
        "externally_imported_subtree_package_names": [
            subtree_package_name
            for subtree_package_name in node.subtree_package_names
            if subtree_package_name in packages_with_external_importers
        ],
        "is_externally_imported": package_name in packages_with_external_importers,
    }


def _build_reciprocal_packages_by_package(
    reciprocal_pairs: tuple[tuple[str, str], ...],
) -> dict[str, tuple[str, ...]]:
    values: dict[str, set[str]] = {}

    for source_package_name, target_package_name in reciprocal_pairs:
        values.setdefault(source_package_name, set()).add(target_package_name)

    return {
        package_name: tuple(sorted(other_package_names))
        for package_name, other_package_names in sorted(values.items())
    }
