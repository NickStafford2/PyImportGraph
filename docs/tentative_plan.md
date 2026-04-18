# tentative_plan.md

## Status

The current implementation does **not fully align with the spec**.

### Key mismatch

* The system currently **collapses package structure** (e.g. depth-based grouping)
* The spec requires **true package hierarchy with nested subpackages as first-class**
* As a result, some relationships are **hidden or incorrectly aggregated**

---

## Why it needs to change

The goal of the tool is to answer architectural questions like:

* who imports this module/package?
* what is the *actual external interface* of a module/package?

These require:

* **accurate module-level relationships**
* **correct package boundaries**
* **no artificial grouping**

The current approach loses information by:

* flattening package structure
* treating grouping as a string transformation instead of a structural model

---

## Target Architecture

The system should be built around three core layers:

### 1. Module Graph (source of truth)

* nodes: modules
* edges: import relationships
* provided by Grimp

### 2. Package Tree (derived structure)

* built from module names
* represents real Python package hierarchy
* supports subtree queries

### 3. Symbol Usage Layer

* definitions (functions, classes, assignments)
* imports (`from x import y`)
* links symbols across modules

---

## Core Data Model

* modules_by_name
* packages_by_name
* definitions_by_module
* symbol_imports_by_imported_module
* symbol_imports_by_importer_module
* module → module imports
* module → module importers

---

## General Pipeline

1. **Discover modules**

   * walk filesystem
   * build module names

2. **Build module graph**

   * use Grimp
   * collect import relationships

3. **Build package tree**

   * derive from module names
   * construct parent/child relationships
   * compute subtree membership

4. **Parse symbols**

   * AST parse each module
   * extract definitions and imports

5. **Link symbol usage**

   * connect imports → definitions
   * identify cross-module usage

6. **Build query layer**

   * module → importers
   * package → importers (via subtree)
   * module → external interface
   * package → external interface

---

## Design Principles

* modules are the **source of truth**
* packages are **derived, not approximated**
* no depth-based grouping
* nested subpackages are first-class
* “public interface” = **observed external usage**

---

## Summary

The current implementation works, but uses the wrong abstraction (string-based package grouping).

The revised design treats:

* modules as the base layer
* packages as real hierarchical structures
* symbols as a linked overlay

This enables accurate, flexible architectural queries.
