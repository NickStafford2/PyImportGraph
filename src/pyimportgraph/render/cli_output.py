from __future__ import annotations

from pyimportgraph.graph.model import DependencyGraph


def render_summary(graph: DependencyGraph) -> str:
    summary = graph.summary()
    lines = [
        "PyImportGraph summary",
        "=====================",
        f"Modules:          {summary['module_count']}",
        f"Imports:          {summary['import_count']}",
        f"Resolved imports: {summary['resolved_import_count']}",
        f"Cycles:           {summary['cycle_count']}",
        f"Reexports:        {summary['reexport_count']}",
        f"Unresolved:       {summary['unresolved_count']}",
        "",
        "Topological layers",
        "------------------",
    ]

    for index, layer in enumerate(graph.topological_layers(), start=1):
        lines.append(f"{index:>2}: {', '.join(layer)}")

    return "\n".join(lines)


def render_module_details(graph: DependencyGraph, module_name: str) -> str:
    module = graph.get_module(module_name)
    resolutions = graph.get_module_resolutions(module_name)
    importers = graph.imported_by(module_name)

    lines = [
        module.name,
        "=" * len(module.name),
        f"path:         {module.path}",
        f"package:      {module.package_name}",
        f"package path: {module.package_path}",
        "",
        "Definitions",
        "-----------",
    ]

    if not module.definitions:
        lines.append("(none)")
    else:
        for definition in sorted(
            module.definitions.values(), key=lambda item: (item.line, item.name)
        ):
            suffix = ""
            if definition.is_alias:
                suffix = f" -> alias of {definition.source_module_name}.{definition.source_name or ''}".rstrip(
                    "."
                )
            lines.append(
                f"{definition.line:>4}  {definition.kind:<14} {definition.name}  scope={definition.scope}{suffix}"
            )

    lines.extend(["", "Imports", "-------"])

    if not resolutions:
        lines.append("(none)")
    else:
        for resolution in resolutions:
            occurrence = graph.imports[resolution.occurrence_id]
            local_flag = " local" if occurrence.is_local_scope else ""
            reexport_flag = " reexport" if resolution.is_reexport else ""
            unresolved_flag = " unresolved" if resolution.is_unresolved else ""

            target = resolution.requested_module or "<unknown>"
            if resolution.requested_name:
                target = f"{target}.{resolution.requested_name}"

            origin = "<unresolved>"
            if resolution.definition_module and resolution.definition_name:
                origin = (
                    f"{resolution.definition_module}.{resolution.definition_name}"
                    f":{resolution.definition_line}"
                )
            elif resolution.definition_module:
                origin = (
                    f"{resolution.definition_module}:{resolution.definition_line or 1}"
                )

            lines.append(
                f"{occurrence.line:>4}  {target:<40} scope={occurrence.scope}{local_flag}{reexport_flag}{unresolved_flag}"
            )
            lines.append(f"      defined at: {origin}")

    lines.extend(["", "Imported by", "-----------"])
    lines.append(", ".join(importers) if importers else "(none)")

    return "\n".join(lines)


def render_reexports(graph: DependencyGraph) -> str:
    lines = ["Reexports", "========="]
    rows = graph.find_reexports()

    if not rows:
        lines.append("(none)")
        return "\n".join(lines)

    for row in rows:
        occurrence = graph.imports[row.occurrence_id]
        requested = f"{row.requested_module}.{row.requested_name}"
        origin = f"{row.definition_module}.{row.definition_name}:{row.definition_line}"
        lines.append(
            f"{row.importer_module}:{occurrence.line} imports {requested} "
            f"but definition comes from {origin}"
        )

    return "\n".join(lines)


def render_unresolved(graph: DependencyGraph) -> str:
    lines = ["Unresolved imports", "=================="]
    rows = graph.find_unresolved()

    if not rows:
        lines.append("(none)")
        return "\n".join(lines)

    for row in rows:
        occurrence = graph.imports[row.occurrence_id]
        requested = row.requested_module or "<unknown>"
        if row.requested_name:
            requested = f"{requested}.{row.requested_name}"
        lines.append(f"{row.importer_module}:{occurrence.line} -> {requested}")

    return "\n".join(lines)


def render_cycles(graph: DependencyGraph) -> str:
    cycles = graph.find_cycles()
    lines = ["Cycles", "======"]

    if not cycles:
        lines.append("(none)")
        return "\n".join(lines)

    for index, cycle in enumerate(cycles, start=1):
        lines.append(f"{index:>2}: {' -> '.join(cycle)} -> {cycle[0]}")

    return "\n".join(lines)
