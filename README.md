# PyImportGraph

PyImportGraph analyzes a Python project to understand **package boundaries** and **cross-package usage**.

It answers questions like:
- Which packages depend on which other packages?
- Which modules import from outside their package?
- Which functions/classes defined in a package are used elsewhere?

The goal is to make architectural boundaries visible and easy to inspect.

## Scope

PyImportGraph focuses on **internal project structure only**:
- analyzes Python files under a given project root
- builds a module/package dependency graph
- tracks symbol-level imports across package boundaries

It does **not** attempt full Python semantic analysis.

## Features

- package → package dependency mapping
- module → module import graph
- detection of:
  - circular dependencies
  - cross-package imports
  - unresolved imports (internal + external)
- symbol-level tracking:
  - functions, classes, and names imported across packages
  - reexports (indirect imports)
- CLI for quick inspection

## Example Use Cases

- identify tightly coupled packages
- detect boundary violations
- find “leaky” packages exposing too many internals
- prepare data for visualization (e.g. force-directed graphs)

## Usage

```bash
poetry run pyimportgraph <project_path> [command]
````

### Commands

```
summary       # high-level project overview
module        # inspect a module
cycles        # circular dependencies
reexports     # indirect symbol imports
unresolved    # missing or external imports
search        # find modules
```

Example:

```bash
poetry run pyimportgraph . summary
```

## Design Philosophy

* prioritize **clarity over completeness**
* focus on **package boundaries**, not full runtime behavior
* keep the model **small and queryable**
* treat external dependencies as black boxes

## Future Direction

* package-level reports (A → B dependencies)
* cross-package symbol usage summaries
* JSON output for visualization
* frontend graph explorer

