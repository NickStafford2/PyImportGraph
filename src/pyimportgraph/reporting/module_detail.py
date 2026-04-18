from __future__ import annotations

from pyimportgraph.analysis import ProjectModel
from pyimportgraph.reporting._format import render_section, render_table


def render_module_detail(model: ProjectModel, module_name: str) -> str:
    _require_known_module(model, module_name)

    importer_result = model.find_modules_importing_module(module_name)
    external_interface = model.find_external_interface_for_module(module_name)
    imported_modules = model.module_imports.get(module_name, ())
    package_name = model.package_tree.package_for_module(module_name)

    lines: list[str] = []

    lines.append(f"Package: {package_name}")
    lines.append("")

    lines.append("Imports")
    lines.append("-------")
    lines.extend(
        render_table(
            headers=["Imported module", "Imported package"],
            rows=[
                (
                    imported_module_name,
                    model.package_tree.package_for_module(imported_module_name),
                )
                for imported_module_name in imported_modules
            ],
        )
    )
    lines.append("")

    lines.append("Imported by")
    lines.append("-----------")
    lines.extend(
        render_table(
            headers=["Importer module", "Importer package"],
            rows=[
                (
                    importer_module_name,
                    model.package_tree.package_for_module(importer_module_name),
                )
                for importer_module_name in importer_result.importing_modules
            ],
        )
    )
    lines.append("")

    lines.append("Observed external interface")
    lines.append("---------------------------")
    lines.extend(
        render_table(
            headers=["Line", "Symbol", "Kind"],
            rows=[
                (
                    str(definition.line),
                    definition.symbol_name,
                    definition.kind,
                )
                for definition in external_interface
            ],
        )
    )

    return render_section(f"Module: {module_name}", lines)


def _require_known_module(model: ProjectModel, module_name: str) -> None:
    if module_name not in model.module_names:
        raise ValueError(f"Unknown module: {module_name}")
