# PyImportGraph Specification

## Purpose

PyImportGraph analyzes a Python project to expose:

1. **Package dependency structure**
2. **Cross-package symbol usage**

It is designed to help understand and evaluate architectural boundaries.

---

## Core Questions

The system should answer:

* Which packages import from which other packages?
* Which modules depend on external packages vs internal ones?
* Which symbols (functions, classes, names) defined in a package are used outside it?
* Where are boundaries violated or overly coupled?

---

## What the project does

PyImportGraph:

* scans Python files under a project root
* discovers modules and packages from the filesystem
* parses imports using Python AST
* builds a dependency graph between modules
* groups dependencies at the package level
* tracks symbol-level imports across modules
* identifies:

  * cross-package imports
  * reexports (indirect symbol usage)
  * circular dependencies
  * unresolved imports

---

## What the project does NOT do

PyImportGraph does not:

* execute code
* evaluate runtime import behavior
* fully resolve dynamic imports (`importlib`, etc.)
* fully expand `from x import *`
* analyze external dependencies as source
* build a complete call graph

---

## Analysis boundary

* Only files inside the provided project root are analyzed
* External imports are treated as black boxes
* The goal is **architecture visibility**, not full semantic correctness

---

## Data model priorities

The system should:

* represent each module once
* represent each import occurrence once
* track symbol-level usage without duplication
* support:

  * module-level queries
  * package-level aggregation
  * reverse lookups (who uses this?)

---

## Symbol tracking scope

Track only **top-level definitions**:

* functions
* classes
* assignments
* imported aliases

Track usage via:

* `import x`
* `from x import y`
* aliasing (`as`)

Goal:
→ determine when a symbol defined in package A is used by package B

---

## Package boundary analysis

The system should enable:

* mapping package → package dependencies
* identifying:

  * tightly coupled packages
  * boundary violations
  * “leaky” packages (high outward symbol usage)

---

## Design priorities

* simplicity over completeness
* predictable static behavior
* minimal, queryable data model
* clear separation between:

  * structure (imports)
  * usage (symbols)

---

## Non-goals

* full Python import semantics
* runtime behavior modeling
* perfect resolution of all edge cases
* editor or IDE integration
* visualization (handled externally)
