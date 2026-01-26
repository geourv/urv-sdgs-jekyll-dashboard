<!--
File: downloads/_ai_context.md
Purpose: Project file.
Safe edits:
  - OK: Edit carefully; keep paths consistent with the rest of the site.
  - Careful: If unsure, search for references to this file name before renaming/removing.
-->

# Context for the `downloads/` folder

This folder contains static assets served by Jekyll as-is.

- Files like `.json` are consumed by the dashboard JavaScript via `fetch()` and must remain valid JSON.
- Avoid inserting comments or extra keys that would change the schema unless you also update all code that reads them.

If you need to document a dataset/schema, do it in this file (or add additional `*.md` docs here).
