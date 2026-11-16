# Import Hub

A family tool for importing used cars from Québec to Romania (Viamar Montreal → Rotterdam, Marlog customs in NL, then RAR in Romania). It tracks candidate cars, computes the landed cost, walks through the import steps per car, and holds contacts, documents, lessons and message templates. Available in Romanian, English and French.

- `import-hub.html`: the tool (v2). A single self-contained page, published as a claude.ai Artifact with the `db` capability.
- `import-hub-v1.html`: the previous version, kept for reference.
- `calculator-import-canada-romania.html`: the standalone cost calculator. It is the visual reference for the hub.
- `CLAUDE.md`: build rules, data model, cost formula, VIN decoder and the auto-search task spec.
- `PROJECT_BRIEF.md`: the domain knowledge (taxes, legal steps, contacts, cars).
- `tests/check.js`: browser checks from `CLAUDE.md` §7, run with `node tests/check.js <screenshot-dir>` (needs Puppeteer in `~/node_modules`).
- `screenshots/`: v2 next to the calculator, plus the main views.
