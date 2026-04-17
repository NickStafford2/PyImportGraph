# PyImportGraph

PyImportGraph analyzes a Python project and builds a dependency graph of module imports.

## Features

- discovers Python modules from a project path
- builds a module dependency graph
- tracks:
  - module name
  - module path
  - package name
  - package path
  - what each module imports
  - what other modules import from a module
  - imported names and line numbers
  - top-level definitions and line numbers
  - local imports inside functions and classes
  - circular imports
  - reimports / reexports
  - unresolved imports

## Install

```bash
poetry add networkx
