from __future__ import annotations

from pyimportgraph.analysis import ProjectModel
from pyimportgraph.reporting._format import render_section, render_table


def render_package_detail(model: ProjectModel, package_name: str) -> str:
    _require_known_package(model, package_name)

    node = model.package_tree.node_for_package(package_name)
    importer_result = model.find_modules_importing_package(package_name)
    external_interface = model.find_external_interface_for_package(package_name)

    lines: list[str] = []

    lines.append(f"Parent package: {node.parent_name or '(none)'}")
    lines.append("")

    lines.append("Child packages")
    lines.append("--------------")
    lines.extend(
        render_table(
            headers=["Package"],
            rows=[(child_name,) for child_name in node.child_names],
        )
    )
    lines.append("")

    lines.append("Direct modules")
    lines.append("--------------")
    lines.extend(
        render_table(
            headers=["Module"],
            rows=[(module_name,) for module_name in node.direct_module_names],
        )
    )
    lines.append("")

    lines.append("Modules in subtree")
    lines.append("------------------")
    lines.extend(
        render_table(
            headers=["Module"],
            rows=[(module_name,) for module_name in node.subtree_module_names],
        )
    )
    lines.append("")

    lines.append("Imported by modules outside subtree")
    lines.append("----------------------------------")
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

    lines.append("Imported by packages outside subtree")
    lines.append("-----------------------------------")
    lines.extend(
        render_table(
            headers=["Importer package"],
            rows=[
                (importer_package_name,)
                for importer_package_name in importer_result.importing_packages
            ],
        )
    )
    lines.append("")

    lines.append("Observed external interface")
    lines.append("---------------------------")
    lines.extend(
        render_table(
            headers=["Module", "Line", "Symbol", "Kind"],
            rows=[
                (
                    definition.module_name,
                    str(definition.line),
                    definition.symbol_name,
                    definition.kind,
                )
                for definition in external_interface
            ],
        )
    )

    return render_section(f"Package: {package_name}", lines)


def _require_known_package(model: ProjectModel, package_name: str) -> None:
    if not model.package_tree.has_package(package_name):
        raise ValueError(f"Unknown package: {package_name}")
