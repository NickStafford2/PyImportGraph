# JSON Upload Mode — Frontend Specification

## Overview

This document defines the "JSON Upload" mode for the PyImportGraph frontend.

In this mode, the application operates as a pure viewer:
- No backend analysis is performed
- Users generate a snapshot locally via the CLI
- Users upload the resulting JSON file
- The frontend parses and renders the data

This is the primary MVP path for the web application.

---

## Goals

- Allow users to visualize project architecture without uploading source code
- Avoid backend complexity (no cloning, no sandboxing, no job queue)
- Reuse existing snapshot schema and UI components
- Enable fully static deployment (e.g., Vercel)

---

## User Flow

1. User runs CLI locally:
```

pyimportgraph src --package mypackage json > graph.json

````

2. User opens the web app

3. User uploads `graph.json` via:
- file picker OR
- drag-and-drop

4. Frontend:
- reads file
- parses JSON
- validates schema
- stores snapshot in state

5. Existing UI renders snapshot exactly as if it came from `/api/snapshot`

---

## Requirements

### File Upload

- Accept `.json` files only
- Max file size: configurable (recommend 5–20 MB)
- Support:
- click-to-upload
- drag-and-drop

### Parsing

- Use:
```ts
const text = await file.text()
const data = JSON.parse(text)
````

* Handle:

  * invalid JSON
  * empty files

### Validation

Minimum required checks:

* Top-level object exists

* Required fields:

  * `schema_version`
  * `packages`
  * `modules`
  * `edges`
  * `summary`

* If invalid:

  * show user-friendly error
  * do not crash app

Optional (future):

* strict schema validation via Zod or similar

---

## State Management

Replace current API-driven state:

Before:

* snapshot loaded via `/api/snapshot`

After:

* snapshot comes from uploaded file

State shape:

```ts
type AppState = {
  snapshot: ProjectSnapshot | null
  loading: boolean
  error: string | null
}
```

Upload should:

* set `snapshot`
* clear `error`
* set `loading = false`

---

## UI Changes

### Add Upload Entry Point

At top of app:

* Upload button
* OR drag-and-drop area

Example UX:

* "Upload snapshot.json"
* "Drag & drop your analysis file here"

### Empty State

When no snapshot is loaded:

* show upload UI
* hide sections (summary, packages, modules, edges)

### Error State

Display:

* invalid JSON
* wrong schema
* file too large

---

## Rendering

No changes required to:

* SummarySection
* PackagesSection
* ModulesSection
* EdgesSection

These should render based on `snapshot` exactly as before.

---

## Prefix Handling

Continue using frontend-derived prefix:

* compute common module prefix
* trim for display
* show full value in tooltip

No backend dependency required.

---

## Security Considerations

* Do NOT execute any code from uploaded file
* Treat JSON as untrusted input
* Avoid:

  * `eval`
  * dynamic imports
* Only parse and render

---

## Performance Considerations

* Large snapshots may contain:

  * thousands of modules
  * thousands of edges

Future improvements (not required now):

* virtualization (react-window)
* pagination
* lazy rendering of sections

---

## Nice-to-Have Features (Future)

* Remember last uploaded file (localStorage)
* Allow re-upload / replace
* Display file metadata:

  * file name
  * size
* Download snapshot button
* Shareable snapshot (upload → hosted link)

---

## Deployment

This mode enables:

* Fully static deployment
* No backend required

Recommended:

* Vercel

---

## Out of Scope (for this mode)

* GitHub repo ingestion
* Zip upload
* Background jobs
* Backend processing

---

## Summary

JSON Upload Mode is:

* the simplest implementation path
* the safest architecture
* the fastest way to ship a usable product

It should be implemented before any remote analysis features.
``
