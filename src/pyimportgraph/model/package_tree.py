from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class PackageTreeNode:
    package_name: str
    parent_name: str | None
    child_names: tuple[str, ...]
    direct_module_names: tuple[str, ...]
    subtree_module_names: tuple[str, ...]
    descendant_package_names: tuple[str, ...]
    subtree_package_names: tuple[str, ...]


@dataclass(frozen=True, slots=True)
class PackageTree:
    _nodes_by_package: dict[str, PackageTreeNode]
    _package_by_module: dict[str, str]

    @classmethod
    def from_module_names(
        cls, module_names: tuple[str, ...] | list[str]
    ) -> "PackageTree":
        normalized_module_names = tuple(sorted(set(module_names)))
        package_names = _discover_package_names(normalized_module_names)

        package_by_module = {
            module_name: _package_for_module(module_name, package_names)
            for module_name in normalized_module_names
        }

        child_names_by_package: dict[str, set[str]] = {
            package_name: set() for package_name in package_names
        }
        direct_module_names_by_package: dict[str, list[str]] = {
            package_name: [] for package_name in package_names
        }

        for package_name in package_names:
            parent_name = _parent_package_name(package_name)
            if parent_name is not None and parent_name in package_names:
                child_names_by_package[parent_name].add(package_name)

        for module_name, package_name in package_by_module.items():
            direct_module_names_by_package[package_name].append(module_name)

        subtree_module_names_by_package = {
            package_name: _build_subtree_module_names(
                package_name=package_name,
                direct_module_names_by_package=direct_module_names_by_package,
                child_names_by_package=child_names_by_package,
            )
            for package_name in package_names
        }

        subtree_package_names_by_package = {
            package_name: _build_subtree_package_names(
                package_name=package_name,
                child_names_by_package=child_names_by_package,
            )
            for package_name in package_names
        }

        nodes_by_package = {
            package_name: PackageTreeNode(
                package_name=package_name,
                parent_name=_parent_package_name(package_name),
                child_names=tuple(sorted(child_names_by_package[package_name])),
                direct_module_names=tuple(
                    sorted(direct_module_names_by_package[package_name])
                ),
                subtree_module_names=subtree_module_names_by_package[package_name],
                descendant_package_names=tuple(
                    child_package_name
                    for child_package_name in subtree_package_names_by_package[
                        package_name
                    ]
                    if child_package_name != package_name
                ),
                subtree_package_names=subtree_package_names_by_package[package_name],
            )
            for package_name in sorted(package_names)
        }

        return cls(
            _nodes_by_package=nodes_by_package,
            _package_by_module=package_by_module,
        )

    def package_names(self) -> tuple[str, ...]:
        return tuple(sorted(self._nodes_by_package))

    def node_for_package(self, package_name: str) -> PackageTreeNode:
        try:
            return self._nodes_by_package[package_name]
        except KeyError as exc:
            raise KeyError(f"Unknown package: {package_name}") from exc

    def package_for_module(self, module_name: str) -> str:
        try:
            return self._package_by_module[module_name]
        except KeyError as exc:
            raise KeyError(f"Unknown module: {module_name}") from exc

    def direct_module_names(self, package_name: str) -> tuple[str, ...]:
        return self.node_for_package(package_name).direct_module_names

    def subtree_module_names(self, package_name: str) -> tuple[str, ...]:
        return self.node_for_package(package_name).subtree_module_names

    def descendant_package_names(self, package_name: str) -> tuple[str, ...]:
        return self.node_for_package(package_name).descendant_package_names

    def subtree_package_names(self, package_name: str) -> tuple[str, ...]:
        return self.node_for_package(package_name).subtree_package_names

    def contains_module(self, package_name: str, module_name: str) -> bool:
        return module_name in self.node_for_package(package_name).subtree_module_names


def _build_subtree_module_names(
    *,
    package_name: str,
    direct_module_names_by_package: dict[str, list[str]],
    child_names_by_package: dict[str, set[str]],
) -> tuple[str, ...]:
    module_names: list[str] = list(direct_module_names_by_package[package_name])

    for child_package_name in sorted(child_names_by_package[package_name]):
        module_names.extend(
            _build_subtree_module_names(
                package_name=child_package_name,
                direct_module_names_by_package=direct_module_names_by_package,
                child_names_by_package=child_names_by_package,
            )
        )

    return tuple(sorted(module_names))


def _build_subtree_package_names(
    *,
    package_name: str,
    child_names_by_package: dict[str, set[str]],
) -> tuple[str, ...]:
    package_names = [package_name]

    for child_package_name in sorted(child_names_by_package[package_name]):
        package_names.extend(
            _build_subtree_package_names(
                package_name=child_package_name,
                child_names_by_package=child_names_by_package,
            )
        )

    return tuple(package_names)


def _discover_package_names(module_names: tuple[str, ...]) -> set[str]:
    package_names: set[str] = set()

    for module_name in module_names:
        dotted_parts = module_name.split(".")

        for depth in range(1, len(dotted_parts)):
            package_names.add(".".join(dotted_parts[:depth]))

    for module_name in module_names:
        prefix = f"{module_name}."
        if any(
            other_module_name.startswith(prefix) for other_module_name in module_names
        ):
            package_names.add(module_name)

    if not package_names:
        raise ValueError("Cannot build a package tree from an empty module set")

    return package_names


def _package_for_module(module_name: str, package_names: set[str]) -> str:
    if module_name in package_names:
        return module_name

    parts = module_name.split(".")
    for depth in range(len(parts) - 1, 0, -1):
        candidate = ".".join(parts[:depth])
        if candidate in package_names:
            return candidate

    return parts[0]


def _parent_package_name(package_name: str) -> str | None:
    parts = package_name.split(".")
    if len(parts) <= 1:
        return None
    return ".".join(parts[:-1])
