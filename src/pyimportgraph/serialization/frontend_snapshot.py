from __future__ import annotations

from typing import Any

from pyimportgraph.analysis import ProjectModel


def build_frontend_analysis_snapshot(model: ProjectModel) -> dict[str, Any]:
    package_dependency_map = model.package_dependency_map()
    reciprocal_pairs = model.reciprocal_package_dependencies()
    packages_with_external_importers = model.packages_with_external_importers()

    reciprocal_keys = {
        _make_directed_package_key(source_package_name, target_package_name)
        for source_package_name, target_package_name in reciprocal_pairs
    }

    return {
        "packages_with_external_importers": list(packages_with_external_importers),
        "reciprocal_package_dependencies": [
            {
                "from_package": source_package_name,
                "to_package": target_package_name,
            }
            for source_package_name, target_package_name in reciprocal_pairs
        ],
        "package_dependency_summary": [
            {
                "package": package_name,
                "depends_on": list(package_dependency_map.get(package_name, ())),
                "dependency_count": len(package_dependency_map.get(package_name, ())),
                "is_imported_outside_package": package_name
                in packages_with_external_importers,
                "has_reciprocal_dependencies": any(
                    _make_directed_package_key(package_name, dependency_package_name)
                    in reciprocal_keys
                    for dependency_package_name in package_dependency_map.get(
                        package_name, ()
                    )
                ),
            }
            for package_name in model.package_tree.package_names()
        ],
    }


def _make_directed_package_key(from_package: str, to_package: str) -> str:
    return f"{from_package}→{to_package}"
