from __future__ import annotations

from pyimportgraph.analysis import ProjectModel
from pyimportgraph.reporting.module_detail import render_module_detail
from pyimportgraph.reporting.package_detail import render_package_detail
from pyimportgraph.reporting.summary import render_summary


def render_full_report(model: ProjectModel) -> str:
    parts: list[str] = [render_summary(model)]

    package_sections = [
        render_package_detail(model, package_name)
        for package_name in model.package_tree.package_names()
    ]
    if package_sections:
        parts.append(_render_group("Packages", package_sections))

    externally_used_module_names = [
        module_name
        for module_name in model.module_names
        if model.find_external_interface_for_module(module_name)
    ]
    module_sections = [
        render_module_detail(model, module_name)
        for module_name in externally_used_module_names
    ]
    if module_sections:
        parts.append(_render_group("Modules with external interface", module_sections))

    return "\n\n".join(parts)


def _render_group(title: str, sections: list[str]) -> str:
    return "\n\n".join([title, "=" * len(title), *sections])
