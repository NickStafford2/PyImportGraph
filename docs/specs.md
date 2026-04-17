# PyImportGraph Specification

## Purpose

PyImportGraph statically analyzes a Python project and builds an internal dependency graph of that project's import relationships.

Its main goal is to answer questions about how modules inside a project depend on one another, while keeping package boundaries clear and the graph data model easy to query.

## What the project does

PyImportGraph:

- scans Python source files inside a target project root
- discovers packages, subpackages, and modules from the filesystem layout
- parses import statements using Python AST
- records module-level and local-scope imports
- builds a directed dependency graph between internal modules
- tracks:
  - module name
  - module path
  - package name
  - package path
  - import occurrences
  - imported symbol names
  - import line numbers
  - whether an import occurred in local scope
  - top-level definitions and their line numbers
  - reverse relationships, such as which modules import a module
- attempts to resolve imported names to the top-level definition that ultimately defines them
- detects reexports and reimports, where a symbol is imported from a module that did not define it directly
- supports circular imports and graph traversal over cyclic module relationships
- provides CLI output for summaries and module-level inspection

## What the project does not do

PyImportGraph does not:

- execute the target project
- evaluate runtime import behavior
- resolve dynamic imports such as `importlib.import_module()`
- fully resolve `from x import *`
- inspect installed dependencies as source code
- search inside virtual environments, package caches, build artifacts, or frontend dependency folders
- infer file rename history or historical module movement
- read `.gitignore`
- treat external dependencies as internal graph members
- guarantee perfect semantic import resolution in every Python edge case

## Analysis boundary

PyImportGraph analyzes only files located under the provided project root, after denylisted paths are excluded.

Imports that refer to code outside the scanned project are treated as external black-box dependencies. They may be recorded as import occurrences, but their source code is not scanned and their internal definitions are not explored.

This boundary is intentional. The tool is designed to describe the architecture of the target project, not the implementation details of its dependencies.

## Internal vs external imports

PyImportGraph distinguishes between:

- internal imports:
  imports that resolve to modules discovered inside the scanned project root

- external imports:
  imports that refer to modules outside the scanned project root

- unresolved imports:
  imports that cannot be matched to a known internal module or definition

External dependencies are not traversed.

## Filesystem denylist

The scanner must skip the following directories and their descendants:

- `.git`
- `.hg`
- `.svn`
- `.venv`
- `venv`
- `env`
- `node_modules`
- `__pycache__`
- `.mypy_cache`
- `.pytest_cache`
- `.ruff_cache`
- `.tox`
- `.nox`
- `.eggs`
- `build`
- `dist`

The denylist exists to prevent analysis of generated files, caches, dependency trees, version-control metadata, and virtual environment contents.

## Data model requirements

The dependency graph should avoid duplicated facts.

The graph model should store:

- each module once
- each import occurrence once
- each resolution record once
- graph edges only as relationships between modules

Metadata should not be copied redundantly into multiple graph structures when one source of truth is sufficient.

## Scope of definitions

The resolver should track top-level definitions that are relevant to import resolution, including:

- functions
- async functions
- classes
- top-level assignments
- top-level imported aliases

Imports inside functions or classes should be discoverable as local-scope import occurrences, but local definitions do not need to participate in top-level symbol export resolution.

## Non-goals

The following are explicitly out of scope for now:

- `.gitignore` support
- runtime module loading analysis
- full import execution semantics
- star import expansion
- namespace-package edge case coverage beyond normal project layouts
- editor integration
- graphical visualization output formats beyond CLI text output

## Design priorities

The project should prioritize:

- simplicity
- locality of behavior
- explicit package boundaries
- compact data structures
- predictable scanning behavior
- correct handling of cycles
- easy reverse lookups and symbol tracing
