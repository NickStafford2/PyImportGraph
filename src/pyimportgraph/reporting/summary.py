from __future__ import annotations

from pyimportgraph.analysis import ProjectModel
from pyimportgraph.reporting._format import render_kv_table, render_section


def render_summary(model: ProjectModel) -> str:
    package_names = list(model.package_tree.package_names())

    externally_used_module_count = sum(
        1
        for module_name in model.module_names
        if model.find_external_interface_for_module(module_name)
    )

    externally_used_package_count = sum(
        1
        for package_name in package_names
        if model.find_external_interface_for_package(package_name)
    )

    cross_package_symbol_use_count = sum(
        len(imports)
        for imported_module_name, imports in model.symbol_imports_by_imported_module.items()
        for symbol_import in imports
        if model.package_tree.package_for_module(symbol_import.importer_module)
        != model.package_tree.package_for_module(imported_module_name)
    )

    lines = render_kv_table(
        [
            ("Analyzed packages:", ", ".join(package_names) or "(none)"),
            ("Package count:", str(len(package_names))),
            ("Module count:", str(len(model.module_names))),
            ("Modules with external interface:", str(externally_used_module_count)),
            ("Packages with external interface:", str(externally_used_package_count)),
            ("Cross-package symbol uses:", str(cross_package_symbol_use_count)),
        ]
    )

    return render_section("PyImportGraph summary", lines)
