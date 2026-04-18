# PyImportGraph Specification

## Purpose

PyImportGraph analyzes a Python project to expose:

1. **Module dependency structure**
2. **Package-level relationships (derived from modules)**
3. **Cross-package and cross-module symbol usage**

The goal is to make architectural boundaries **accurate, queryable, and explicit**.

---

## Core Questions

The system should answer:

* Which **modules** import which other modules?
* Which **packages (including nested subpackages)** depend on which other packages?
* Given a **module**, which modules and packages import it?
* Given a **package**, which modules and packages import anything inside it?
* Which symbols (functions, classes, names) defined in a module or package are **used externally**?
* What is the **observed external interface** of a module or package?

---

## Key Definitions

### Module

A Python module identified by its full import path (e.g. `a.b.c`).

### Package

A Python package or subpackage derived from module paths:

* `a`
* `a.b`
* `a.b.c`

**All nested subpackages are first-class packages.**

There is **no artificial truncation** (e.g. depth=2). Package relationships are derived from real module structure.

---

### Package Subtree

For a package `a.b`, its subtree includes:

* all modules in `a.b`
* all modules in `a.b.*`

Used for queries like:

* “who imports this package?”

---

### External (Important)

“External” means:

> outside the package subtree being analyzed

Example:

* `a.b.c` importing `a.b.d` → **internal**
* `a.x` importing `a.b.c` → **external**

---

### Observed External Interface

For a module or package:

> the set of symbols defined in it that are imported by external modules

This is **not**:

* `__all__`
* intended API

It is:

* what other code actually depends on

---

## What the project does

PyImportGraph:

* scans Python files under a project root
* builds a **module import graph** (source of truth)
* derives a **package hierarchy** from module names
* tracks symbol definitions:

  * functions
  * classes
  * assignments
* tracks symbol imports:

  * `from x import y`
* builds relationships:

  * module → module imports
  * module → module importers (reverse)
  * package → package dependencies (derived)
  * symbol → external usage

---

## What the project does NOT do

PyImportGraph does not:

* execute code
* evaluate runtime import behavior
* fully resolve dynamic imports (`importlib`, etc.)
* fully expand `from x import *`
* analyze external dependencies as source
* build a full call graph

---

## Data Model

The system should model:

### Modules

* full name
* file path
* direct imports
* direct importers

### Packages

* full package name (no truncation)
* parent package
* child packages
* modules in package
* modules in subtree

### Definitions

* module
* package
* symbol name
* kind
* line

### Symbol Imports

* importer module
* imported module
* symbol name
* line

---

## Required Query Capabilities

### 1. Module → Importers

Given a module:

* return all modules that import it
* return their packages

---

### 2. Package → Importers

Given a package:

* consider all modules in its subtree
* return all modules that import any of them
* return their packages
* exclude modules inside the same subtree

---

### 3. Module → External Interface

Given a module:

* list all symbols defined in that module
* include only those imported by external modules
* exclude imports from modules in the same package subtree

---

### 4. Package → External Interface

Given a package:

* list all symbols defined in its subtree
* include only those imported by external modules
* exclude imports from modules inside the package subtree

---

## Package Dependency Analysis

Package dependencies are **derived**, not primary.

To compute:

* for each package A:

  * collect modules in subtree(A)
  * find all modules they import
  * map those to packages
  * exclude same-package subtree

This produces:

* accurate package → package relationships
* without flattening or truncation

---

## Design Principles

* **Modules are the source of truth**
* **Packages are derived from module hierarchy**
* **No artificial grouping (e.g. depth-based truncation)**
* **Nested subpackages are first-class**
* **All queries must support reverse lookups**
* **“Public interface” is observational, not declared**

---

## Non-goals

* perfect Python import resolution
* runtime behavior modeling
* full semantic correctness
* editor/IDE integration

