from __future__ import annotations

from pyimportgraph.analysis import ProjectModel
from pyimportgraph.reporting._format import (
    add_block,
    compact_rows_to_bullets,
    render_bullets,
    render_section,
)


def render_module_detail(model: ProjectModel, module_name: str) -> str:
    _require_known_module(model, module_name)

    importer_result = model.find_modules_importing_module(module_name)
    external_interface = model.find_external_interface_for_module(module_name)
    imported_modules = model.module_imports.get(module_name, ())
    package_name = model.package_tree.package_for_module(module_name)

    lines: list[str] = []

    lines.append(f"Package: {package_name}")
    lines.append("")

    imported_module_rows = [
        (
            imported_module_name,
            model.package_tree.package_for_module(imported_module_name),
        )
        for imported_module_name in imported_modules
    ]
    if imported_module_rows:
        add_block(
            lines,
            "Imports",
            compact_rows_to_bullets(imported_module_rows),
        )

    importer_rows = [
        (
            importer_module_name,
            model.package_tree.package_for_module(importer_module_name),
        )
        for importer_module_name in importer_result.importing_modules
    ]
    if importer_rows:
        add_block(
            lines,
            "Imported by",
            compact_rows_to_bullets(importer_rows),
        )

    if external_interface:
        add_block(
            lines,
            "Observed external interface",
            render_bullets(
                [
                    f"{definition.symbol_name} ({definition.kind}, line {definition.line})"
                    for definition in external_interface
                ]
            ),
        )

    if len(lines) == 2:
        lines.append("No imports, importers, or externally used symbols.")

    while lines and lines[-1] == "":
        lines.pop()

    return render_section(f"Module: {module_name}", lines)


def _require_known_module(model: ProjectModel, module_name: str) -> None:
    if module_name not in model.module_names:
        raise ValueError(f"Unknown module: {module_name}")
