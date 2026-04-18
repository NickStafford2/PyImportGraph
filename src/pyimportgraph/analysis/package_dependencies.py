from __future__ import annotations

from collections import defaultdict
from contextlib import contextmanager
from dataclasses import dataclass
from pathlib import Path
import sys

import grimp

from pyimportgraph.model.package_tree import PackageTree


@contextmanager
def _prepend_to_sys_path(path: str | Path):
    path_str = str(Path(path).resolve())
    original = list(sys.path)
    sys.path.insert(0, path_str)
    try:
        yield
    finally:
        sys.path[:] = original


@dataclass(frozen=True, slots=True)
class PackageDependencyMap:
    imports_by_package: dict[str, list[str]]

    def imported_by(self) -> dict[str, list[str]]:
        reverse: dict[str, set[str]] = defaultdict(set)

        for importer_package, imported_packages in self.imports_by_package.items():
            for imported_package in imported_packages:
                reverse[imported_package].add(importer_package)

        return {
            package_name: sorted(importer_packages)
            for package_name, importer_packages in sorted(reverse.items())
        }


def build_package_dependency_map(
    package_names: list[str],
    *,
    project_root: str | Path | None = None,
    include_external_packages: bool = False,
    exclude_type_checking_imports: bool = False,
    cache_dir: str | Path | None = ".grimp_cache",
) -> PackageDependencyMap:
    if not package_names:
        raise ValueError("package_names must not be empty")

    graph = _build_import_graph(
        package_names=package_names,
        project_root=project_root,
        include_external_packages=include_external_packages,
        exclude_type_checking_imports=exclude_type_checking_imports,
        cache_dir=cache_dir,
    )

    package_tree = PackageTree.from_module_names(graph.modules)
    imports_by_package: dict[str, set[str]] = {
        package_name: set() for package_name in package_tree.package_names()
    }

    for importer_module_name in graph.modules:
        importer_package_name = package_tree.package_for_module(importer_module_name)

        for imported_module_name in graph.find_modules_directly_imported_by(
            importer_module_name
        ):
            imported_package_name = package_tree.package_for_module(
                imported_module_name
            )
            if imported_package_name == importer_package_name:
                continue

            imports_by_package[importer_package_name].add(imported_package_name)

    return PackageDependencyMap(
        imports_by_package={
            package_name: sorted(imported_package_names)
            for package_name, imported_package_names in sorted(
                imports_by_package.items()
            )
        }
    )


def _build_import_graph(
    *,
    package_names: list[str],
    project_root: str | Path | None,
    include_external_packages: bool,
    exclude_type_checking_imports: bool,
    cache_dir: str | Path | None,
) -> grimp.ImportGraph:
    build_kwargs = {
        "include_external_packages": include_external_packages,
        "exclude_type_checking_imports": exclude_type_checking_imports,
        "cache_dir": str(cache_dir) if cache_dir is not None else None,
    }

    if project_root is None:
        return grimp.build_graph(package_names[0], *package_names[1:], **build_kwargs)

    with _prepend_to_sys_path(project_root):
        return grimp.build_graph(package_names[0], *package_names[1:], **build_kwargs)
