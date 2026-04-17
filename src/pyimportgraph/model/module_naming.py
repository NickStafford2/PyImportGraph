def package_name(module_name: str) -> str:
    parts = module_name.split(".")
    if len(parts) <= 1:
        return module_name
    return ".".join(parts[:2])
