<!--
File: data/_ai_context.md
Purpose: Notes about the datasets in /data (what each JSON file contains and how pages read them).
Related files:
  - pages/degree-barchart.html
  - pages/faculty-doughnut.html
  - pages/*wordcloud*.html
Safe edits:
  - OK: Update descriptions when datasets or keys change
  - Careful: Do not add comments inside JSON files; keep JSON valid
-->

# Context for the `data/` folder

This folder contains static assets served by Jekyll as-is.

- Files like `.json` are consumed by the dashboard JavaScript via `fetch()` and must remain valid JSON.
- Avoid inserting comments or extra keys that would change the schema unless you also update all code that reads them.

If you need to document a dataset/schema, do it in this file (or add additional `*.md` docs here).
