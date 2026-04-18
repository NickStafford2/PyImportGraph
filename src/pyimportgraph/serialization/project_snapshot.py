from __future__ import annotations

from typing import Any

from pyimportgraph.analysis import ProjectModel

SCHEMA_VERSION = 3


def build_project_snapshot(model: ProjectModel) -> dict[str, Any]:
    package_dependency_map = model.package_dependency_map()
    reciprocal_pairs = model.reciprocal_package_dependencies()
    packages_with_external_importers = model.packages_with_external_importers()

    reciprocal_keys = {
        _make_directed_package_key(source, target)
        for source, target in reciprocal_pairs
    }

    return {
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
        # 🔥 moved from frontend_snapshot.py
        "packages_with_external_importers": list(packages_with_external_importers),
        "reciprocal_package_dependencies": [
            {
                "from_package": source,
                "to_package": target,
            }
            for source, target in reciprocal_pairs
        ],
        "package_dependency_summary": [
            {
                "package": package_name,
                "depends_on": list(package_dependency_map.get(package_name, ())),
                "dependency_count": len(package_dependency_map.get(package_name, ())),
                "is_imported_outside_package": package_name
                in packages_with_external_importers,
                "has_reciprocal_dependencies": any(
                    _make_directed_package_key(package_name, dep) in reciprocal_keys
                    for dep in package_dependency_map.get(package_name, ())
                ),
            }
            for package_name in model.package_tree.package_names()
        ],
    }


def _make_directed_package_key(from_package: str, to_package: str) -> str:
    return f"{from_package}→{to_package}"
