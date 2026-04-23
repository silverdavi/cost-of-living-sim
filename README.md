# Cost of Living Simulator — Denver, CO vs Providence, RI

A year-long financial feasibility simulator for a specific family profile, comparing two cities.

## Family profile

- **Parents**: 2 adults
- **Kids**: 2 children, ages 5–10
  - **Kid A** (older): enrolled in a Jewish day school (partial grant)
  - **Kid B** (younger): learning / personal difficulties; either public school with special-ed services or a specialized day school
- **Parent A**: employed at a local community organization or newspaper
- **Parent B**: either employed OR receives federal disability aid (SSDI/SSI)
- **Housing**: renting an apartment
- **Health insurance**: private (potentially ACA-subsidized)

## Why this project

The cost of a single household decision (income, location, school choice, insurance) cascades into many others:

- Salary → federal/state/local taxes → take-home pay
- Salary → ACA subsidy tier → medical premium
- Salary → Medicaid / CHIP / SNAP / SSI / Section 8 eligibility
- Salary → day-school financial-aid grant size
- Disability status → Medicare eligibility, SGA work limit, tax treatment
- Location → rent, utilities, state tax, school-district special-ed services, kosher food cost

We want a tight, visual, interactive **what-if simulator** where sliders / dropdowns / checkboxes let us change assumptions and instantly see yearly cost and feasibility.

## Approach

1. **Phase 1 — Mapping (this phase)**
   - Enumerate every variable (inputs, derived values, outputs).
   - Document every relationship / formula / eligibility rule.
   - Capture data sources & 2025–2026 numbers where possible.
   - Diagram the dependency graph.
2. **Phase 2 — Model**
   - Pure TypeScript/Python functions implementing each formula.
   - Unit tests against known reference scenarios (IRS examples, HHS FPL tables, etc.).
3. **Phase 3 — UI**
   - Next.js + React + Tailwind.
   - react-three-fiber for a light 3D "city" scene and animated budget flow (sankey-style).
   - Sliders/toggles/dropdowns → live annual total + feasibility indicator.

## Repo layout

```
cost_of_living_sim/
├── README.md                 ← you are here
├── docs/
│   ├── 01_variables.md       ← every input/derived/output variable
│   ├── 02_relationships.md   ← how variables depend on each other
│   ├── 03_formulas.md        ← concrete formulas & bracket tables
│   ├── 04_data_sources.md    ← where to get / verify each number
│   └── 05_open_questions.md  ← unknowns to resolve with the user
├── diagrams/
│   └── dependency_graph.md   ← mermaid graph of variable dependencies
└── data/                     ← (later) JSON tables: FPL, tax brackets, rents…
```

## Status

**Phase 2 — UI shipped.** Next.js app + Hebrew/English (default Hebrew, RTL) + USD/ILS (default ILS, rate 3.0) + Family / Lifestyle / Results tabs + assumptions drawer + ink-style animated illustrations.

### Run it

```bash
cd cost_of_living_sim
npm install           # once
npm run dev           # http://localhost:3000 → redirects to /he/family
npm run build         # production build
npm test              # Vitest unit tests on the model
npm run typecheck     # strict TS
```

### App layout

- `app/[locale]/family` – household members, kids' ages, IEP / Medicaid-waiver toggles, observance, kosher.
- `app/[locale]/lifestyle` – city, income (parent A + parent B modes including SSDI/SSI), housing, school choices, health coverage strategy.
- `app/[locale]/results` – feasibility traffic light, yearly headline numbers, Sankey-style flow, bar breakdown, cliff chart, Denver vs Providence side-by-side.
- Header: language flag toggle, currency flag toggle with rate editor (manual / Auto via `/api/fx` → frankfurter.app, 6h cache), profile export/import, assumptions drawer.

### Extending: add a city

1. Drop `data/cities/<slug>.json` (copy `_template.json`).
2. Register in `data/cities/_index.json`.
3. Add the city label to `data/i18n/he.json` and `en.json` under `cities.<slug>`.
4. If the jurisdiction needs new tax logic, edit `lib/model/taxes.ts` and add a constants file under `data/constants/`.
