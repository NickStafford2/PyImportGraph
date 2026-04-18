from __future__ import annotations


def parent_module_name(module_name: str) -> str | None:
    parts = module_name.split(".")
    if len(parts) <= 1:
        return None
    return ".".join(parts[:-1])


def top_level_package_name(module_name: str) -> str:
    return module_name.split(".", maxsplit=1)[0]


def module_depth(module_name: str) -> int:
    return len(module_name.split("."))
