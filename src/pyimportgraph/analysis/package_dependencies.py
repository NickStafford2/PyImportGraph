from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass
from pathlib import Path
from pyimportgraph.model.module_naming import package_name

import grimp


@dataclass(frozen=True, slots=True)
class PackageDependencyMap:
    imports_by_package: dict[str, list[str]]

    def imported_by(self) -> dict[str, list[str]]:
        reverse: dict[str, set[str]] = defaultdict(set)

        for importer, imported_packages in self.imports_by_package.items():
            for imported in imported_packages:
                reverse[imported].add(importer)

        return {
            package: sorted(importers) for package, importers in sorted(reverse.items())
        }


def build_package_dependency_map(
    package_names: list[str],
    *,
    include_external_packages: bool = False,
    exclude_type_checking_imports: bool = False,
    cache_dir: str | Path | None = ".grimp_cache",
) -> PackageDependencyMap:
    if not package_names:
        raise ValueError("package_names must not be empty")

    graph: grimp.ImportGraph = grimp.build_graph(
        package_names[0],
        *package_names[1:],
        include_external_packages=include_external_packages,
        exclude_type_checking_imports=exclude_type_checking_imports,
        cache_dir=str(cache_dir) if cache_dir is not None else None,
    )

    all_packages = {package_name(module) for module in graph.modules}
    imports_by_package: dict[str, set[str]] = {
        package: set() for package in all_packages if package is not None
    }

    for importer_module in graph.modules:
        importer_package = package_name(importer_module)
        if importer_package is None:
            continue

        for imported_module in graph.find_modules_directly_imported_by(importer_module):
            imported_package = package_name(imported_module)
            if imported_package is None:
                continue
            if imported_package == importer_package:
                continue

            imports_by_package[importer_package].add(imported_package)

    return PackageDependencyMap(
        imports_by_package={
            package: sorted(imported_packages)
            for package, imported_packages in sorted(imports_by_package.items())
        }
    )
