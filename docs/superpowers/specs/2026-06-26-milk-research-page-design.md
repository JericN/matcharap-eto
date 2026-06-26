# Milk research page (`/milks`) — design

**Date:** 2026-06-26
**Status:** approved (verbal "go")

## Goal
Add a **Milk** research/sourcing page that mirrors the existing **Powders** page: heartable cards with prices + a "where to buy" link, organized into editorial sections. Back it with genuine deep research — find 30–50 PH-relevant milk candidates, verify each in-platform, and shortlist the **best 15**. The researched milks also become the **single source of truth for the Calculator's milk dropdown** (just as `powders` already feed the matcha list — `matchaOptions` was retired the same way).

## Buckets (the 4 sections, top→bottom)
- `ph` — 🇵🇭 **PH-made / available here** (fresh, UHT, evap, barista dairy sold in PH supermarkets) — target **6**
- `import` — 🌏 **Imported barista milks** (oat/almond/soy/coconut barista editions buyable in PH) — target **4**
- `authentic` — 🍵 **Authentic-matcha pairing** (whole dairy, soy, Hokkaido-style rich milk — what Japanese matcha bars actually pour) — target **3**
- `unique` — ✨ **Unique / specialty** (goat, A2, carabao/buffalo, lactose-free, pistachio…) — target **2**

Split is 6/4/3/2 = 15 (±1 per bucket if quality demands; total stays 15).

## Data model (single source of truth, mirrors powders)
- **`seed.milks[]`** — new `MilkSchema`:
  ```
  { cat: "ph"|"import"|"authentic"|"unique",
    catlabel: string,                 // "🇵🇭 PH-made / available"
    star?: boolean,                   // top pick
    name: string,                     // "Oatside Barista Blend"
    type: string,                     // "Oat · barista"  (kicker detail)
    origin: string,                   // "Indonesia → PH" / "made in PH (San Miguel)"
    taste: string,                    // flavor + matcha behavior (foam, split risk)
    price: string,                    // MUST carry a "₱NN/L" token, e.g. "₱114 / 1L · ₱114/L (Landers)"
    hype: string,                     // why notable / matcha-fit one-liner
    buy: string,                      // retailer label, e.g. "Landers · Shopee"
    url: string (url) }               // primary buy/source link
  ```
- **`seed.milkImages{}`** — overlay keyed by exact milk `name` → absolute URL or root-relative `/public` path (same shape/rules as `powderImages`/`competitorImages`).
- **Remove `seed.milkOptions` + `MilkOptionSchema`** (now redundant).
- **`src/features/milks/pricing.js`** — derive numbers from the `price` string:
  - `perLiter(milk)` → number | null (parses the `₱NN/L` token)
  - `perLiterLabel(milk)` → "₱114" style display
  - `perCupLabel(milk, ml=180)` → "≈₱21" (per 180 ml cup)
  - `toMilkOptions(milks)` → `[{ l, ml }]` for the calculator (`l = "<name> — ₱<perLiter>/L"`, `ml = perLiter/1000`); skips any milk with no parseable ₱/L.
- **State:** add `savedMilks: z.array(z.string()).default([])` to `StateSchema`.

## Repo / actions
- Add `repo.milks()`, `repo.milkImages()`, `repo.savedMilks()`, `repo.toggleMilk(name)`.
- **Change `repo.milkOptions()`** to return `toMilkOptions(await repo.milks())` — same `[{l,ml}]` shape, so **`Calculator.jsx` needs no change** (it reads milk by index, uses `ml*1000` as the ₱/L reference and `milk:<label>` as the override key).
- Add `actions.toggleMilk` → `revalidatePath('/milks')` + `revalidatePath('/calculator')`.

## UI (clone of powders)
- **`MilkCard.jsx`** — heart (top-right), 56px logo circle (from `milkImages`, colored fallback by `cat`), `type` + ⭐ kicker, name, `🌿 origin`, a headline box: **₱/L big** + `per liter` label + `☕ ≈₱NN / cup` sub, `taste` blurb, `💴 price` + `🔥 hype` meta lines, `🛒 Where to buy ↗` link.
- **`MilkGrid.jsx`** — `"use client"`; optimistic heart via `toggleMilk`; ♥ **"Our Selection"** section on top (hearted, in heart order), then the 4 bucket sections, with **All / 🇵🇭 / 🌏 / 🍵 / ✨** filter chips.
- **`src/app/milks/page.js`** — `force-dynamic`; `SectionHeader num="04"`; reads `repo.milks/milkImages/savedMilks`.
- **Navbar** — add `{ href: "/milks", label: "Milks" }` after Powders.
- **globals.css** — add category swatch vars for the 2 new buckets (`--c-cat-authentic`, `--c-cat-unique`); reuse `--c-cat-ph` / `--c-cat-import` for those two.

## Research method (applies the repo's scraping + pricing SOPs)
1. **Discover** ~30–50 candidates via 8 parallel angles (PH fresh/UHT, evap/budget, barista dairy, imported oat, imported soy/almond/coconut, authentic Japanese pairings, unique/specialty, what Manila matcha cafés actually pour).
2. **Verify each IN-PLATFORM** — open the brand's official product page **and** a PH retailer page (SM Markets, Landers, Robinsons, S&R, Metromart; Lazada/Shopee last) with WebFetch to read **exact price + pack size → ₱/L**, grab a real product image + buy link, and judge matcha-fit. **Never invent a price** (return null; flag `needs_browser` for bot-walled pages). Bot-walled retailers verified by the main loop via Chrome MCP (single-instance, sequential).
3. **Select** the best 15 (6/4/3/2), favoring matcha-fit + availability + sensible price + variety.
4. Self-host the 15 images under `public/milks/`, validate they render over HTTP, splice into `seed.milkImages`.

## Login requirement
**None.** All sources (brand sites, SM/Landers/Robinsons online, Lazada/Shopee product pages) read fine logged-out. No FB/IG/X login needed.

## Verify
`npm run build` at repo root must stay green (static generation runs the Zod parse, catching bad seed data) with `/milks` listed as a `ƒ` dynamic route.

## Out of scope (YAGNI)
- No milk cost breakdown beyond ₱/L + ≈₱/cup. No multi-link chip row (single buy URL like powders). No editing milks in-app (seed-only, like powders).
