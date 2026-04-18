from __future__ import annotations

from pyimportgraph.analysis import ProjectModel
from pyimportgraph.reporting.module_detail import render_module_detail
from pyimportgraph.reporting.package_detail import render_package_detail
from pyimportgraph.reporting.summary import render_summary


def render_full_report(model: ProjectModel) -> str:
    parts: list[str] = [render_summary(model)]

    for package_name in model.package_tree.package_names():
        parts.append(render_package_detail(model, package_name))

    externally_used_module_names = [
        module_name
        for module_name in model.module_names
        if model.find_external_interface_for_module(module_name)
    ]

    for module_name in externally_used_module_names:
        parts.append(render_module_detail(model, module_name))

    return "\n\n".join(parts)
