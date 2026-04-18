from __future__ import annotations

from pyimportgraph.analysis import ProjectModel
from pyimportgraph.reporting._format import (
    add_block,
    compact_rows_to_bullets,
    render_bullets,
    render_comma_list,
    render_section,
)


def render_package_detail(model: ProjectModel, package_name: str) -> str:
    _require_known_package(model, package_name)

    node = model.package_tree.node_for_package(package_name)
    importer_result = model.find_modules_importing_package(package_name)
    external_interface = model.find_external_interface_for_package(package_name)

    lines: list[str] = []

    lines.append(f"Parent: {node.parent_name or '(none)'}")
    lines.append(f"Children: {render_comma_list(list(node.child_names))}")
    lines.append("")

    if node.direct_module_names == node.subtree_module_names:
        add_block(
            lines,
            "Modules",
            render_bullets(list(node.direct_module_names)),
        )
    else:
        add_block(
            lines,
            "Direct modules",
            render_bullets(list(node.direct_module_names)),
        )
        add_block(
            lines,
            "Modules in subtree",
            render_bullets(list(node.subtree_module_names)),
        )

    importer_module_rows = [
        (
            importer_module_name,
            model.package_tree.package_for_module(importer_module_name),
        )
        for importer_module_name in importer_result.importing_modules
    ]
    if importer_module_rows:
        add_block(
            lines,
            "Imported by modules outside subtree",
            compact_rows_to_bullets(importer_module_rows),
        )

    if importer_result.importing_packages:
        add_block(
            lines,
            "Imported by packages outside subtree",
            render_bullets(list(importer_result.importing_packages)),
        )

    if external_interface:
        add_block(
            lines,
            "Observed external interface",
            render_bullets(
                [
                    (
                        f"{definition.symbol_name} "
                        f"({definition.kind}, {definition.module_name}:{definition.line})"
                    )
                    for definition in external_interface
                ]
            ),
        )

    while lines and lines[-1] == "":
        lines.pop()

    return render_section(f"Package: {package_name}", lines)


def _require_known_package(model: ProjectModel, package_name: str) -> None:
    if not model.package_tree.has_package(package_name):
        raise ValueError(f"Unknown package: {package_name}")
