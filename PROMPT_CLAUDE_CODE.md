# Prompt for Claude Code: Import Hub v2

Paste everything below the line into Claude Code, in a folder that contains these four files:
`CLAUDE.md`, `PROJECT_BRIEF.md`, `import-hub.html` (v1), `calculator-import-canada-romania.html` (the green calculator).

---

You are improving **Import Hub**, a family tool for importing used cars (currently an Audi Q5) from Québec, Canada to Romania via Viamar (Montreal → Rotterdam) and Marlog (customs, Roosendaal NL).

**Read first, in this order:**
1. `CLAUDE.md`: requirements, data model, cost formula, VIN decoder, scheduled-task spec. These are binding.
2. `PROJECT_BRIEF.md`: all the domain knowledge (taxes, legal steps, contacts, cars, lessons).
3. `import-hub.html`: v1. It works, and its logic, i18n dictionaries and db layer are the base. Keep them and restyle/extend the page; don't rewrite it from scratch.
4. `calculator-import-canada-romania.html`: **the visual reference.** v2 must look like it belongs to the same family as this calculator.

## Task

Build **Import Hub v2** as a single self-contained HTML page: vanilla JS, no build step, everything inline except Google Fonts. It is published as a claude.ai Artifact with `capabilities: {db:{}}`.

### A. Adopt the calculator's visual style (the main job)

Copy the design system from `calculator-import-canada-romania.html`. Lift the actual CSS tokens and components; don't approximate them.

- **Colour:** RAL 6011 Reseda green `#587246` as the brand colour (`--ral`). Reuse the exact light and dark token sets: `--ink #16200e`, `--ink-2 #38412e`, `--accent-ink #34502a`, `--focus #2d4822`, `--err #9c2218`, scene greens `--l1…--l6` (`#d7e1c6 → #3d5632`), `--scene #e3e9d6`. Dark: `--scene #0b1309`, `--ink #f1eee0`, `--accent-ink #a7cb88`, etc. Remove v1's grey/blue palette and IBM Plex fonts.
- **Backdrop:** the same fixed SVG "leaf" scene behind everything (layers `.l1–.l6`, veins, stems, haze), so the glass has something to blur.
- **Frosted glass panels:** `.glass` (blur 26px, saturate 165%, inset highlight, soft long shadow), `.glass.tint` (solid green with white text, for the key number or hero), `.glass.deep` (dark green, for breakdowns and lists). Include the `@supports not (backdrop-filter)` fallbacks.
- **Type:** headings and big numbers in **Bodoni Moda** (serif, optical sizing); UI and body in **Inter**, tabular numbers. Section labels: 11px, uppercase, letter-spacing .16em, accent-ink, with a 1px `--ral` underline (the calculator's `.group h2`).
- **Controls:** the calculator's input "wells" (`.inp` with rounded 12px background, unit suffix, end-aligned bold value, focus ring), its iOS-style `.switch` toggles in place of checkboxes for yes/no settings, the pill header (`.head`, `border-radius:999px`, serif wordmark plus small uppercase tag "CA → NL → RO"), and the 4-colour cost stack bar (`--g1…--g4`).
- **Layout:** the same `.shell` grid with fluid `--gap`, `--edge`, `--r`, and safe-area padding. Desktop (≥62rem) is a two-column layout like the calculator: content on the left, a sticky side column on the right for context (selected car summary or cost hero). Mobile is one column at 390px with no horizontal scroll, 44px tap targets and the 16px gutter.
- **Tabs:** a glass pill segmented control under the header. Horizontally scrollable on phones, active tab in tint green.
- **Motion:** only the calculator's `--ease-out`, short transitions, and nothing when `prefers-reduced-motion` is set.

### B. Make the tool better

1. **Car cards as glass cards:** price in Bodoni, price-drop delta (green ▼ / red ▲), a tiny sparkline from `priceHistory`, the landed cost "în RO" with GST handled **per car** (fix the v1 bug: add a `gst` boolean per car; default true for dealers, false for private sellers or for dealers who accept zero-rated export).
2. **Car detail view** (side column on desktop, full sheet on phone): every field, the full cost breakdown for that car with the stack bar, process progress, links, notes, and quick actions (status change, open listing, copy VIN).
3. **Compare mode:** tick 2–3 cars to see them side by side (price, km, year, trim, ACC, 360 cam, flags, landed cost, Germany price if entered).
4. **Steps per car:** a vertical timeline in the calculator's style, with a progress ring in the side column and the date each step was ticked (`steps: {s3: "2026-11-16"}`; still accept old `true` values).
5. **Documents checklist per car**, with the lists from the Documents tab tickable per car.
6. **Message templates fill themselves:** when a car is selected, replace `[MODEL] [YEAR] [VIN] [STOCK] [PRICE] [FIRST NAME]` from its data. Keep the FR/EN switch. Keep the owner's style rules (`PROJECT_BRIEF.md` §12).
7. **Costs tab:** keep the calculator's hero (big Bodoni total in a tint panel, three facts underneath) and the deep breakdown with stack bar. Rate editing stays shared through `config/costs`, with a "last changed" date.
8. **Auto-search tab:** the same settings as v1, restyled with switches and wells. Show the last run, the next due date, the number found, and the summary from `config/scan`. Add a "Run now" note explaining that the owner can ask Claude to run the task.
9. **Language switch RO / EN / FR** in the header pill. Every new string must be added to all three dictionaries; RO is the default.
10. **Empty, loading, offline and stale states** for everything that reads the db (see the rules in `CLAUDE.md` §3).

### C. Don't break

- The data shapes in `CLAUDE.md` §4. The scheduled task depends on them. Only add fields.
- The cost formula and the VIN decoder (`CLAUDE.md` §5). With the defaults, 25,000 CAD with GST must still give ≈ **27,028 €**.
- No hardcoded seed data, and no personal email or passport data anywhere.

### D. Verify before you say it's done

Use Playwright (pre-installed; don't reinstall it):
- every tab at **390 px and 1440 px**, light and dark: no `pageerror`, `scrollWidth ≤ viewport`;
- RO/EN/FR on every tab, with no missing or leftover strings;
- the Costs default total is ≈ 27,028 €;
- the page still renders when `claude.use("db")` is unavailable (open the file locally): banner shown, save buttons disabled;
- take screenshots and **compare them side by side with the calculator**: same greens, same glass, same fonts. Fix anything that looks like a different product.

When finished, report in a few lines: what changed, the screenshots, and anything you couldn't do.
