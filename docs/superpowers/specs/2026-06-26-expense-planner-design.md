# Expense Planner — design

**Status:** approved 2026-06-26

A new `/expenses` page: a paper-styled table of line items, persisted to the
shared Redis `state` record (every visitor reads/writes the same plan, like
hearts/SRP), with live per-row totals + share-of-grand-total and a grand-total
footer.

## 1. Data model — one new `StateSchema` field

In `src/config/schemas.js`, add to `StateSchema`:

```js
expenses: z.array(z.object({
  id:    z.string(),                          // client-generated (crypto.randomUUID)
  item:  z.string().default(""),
  notes: z.string().default(""),
  price: z.number().nonnegative().default(0), // ₱ per unit
  qty:   z.number().nonnegative().default(1),
})).default([])
```

Rows are an **array of objects with a stable `id`** (not a name-keyed record):
line items can repeat, be blank while typing, and need a stable React key +
delete target. `id` is generated in the browser so the server never needs a
random source.

## 2. Data layer (mirrors existing patterns)

- **`src/config/repo.js`**
  - Read: `expenses: async () => (await getState()).expenses`
  - Writes (each a read-modify-write of the one `state` record):
    - `addExpense(row)` — append the client-built row (with its `id`).
    - `updateExpense(id, patch)` — map the **fresh** list, merge `patch` into the
      row whose `id` matches. By-id off the fresh list ⇒ a teammate editing a
      different row concurrently is preserved (same single-item-delta philosophy
      as `attachIngredient`).
    - `removeExpense(id)` — filter the fresh list by `id`.
- **`src/config/actions.js`** — `'use server'` wrappers `addExpense`,
  `updateExpense`, `removeExpense`, each `revalidatePath("/expenses")`.

## 3. Pure math

`src/features/expenses/calc.js` — pure, testable (mirrors `cost.js`):

- `lineTotal(row)` → `price * qty`
- `grandTotal(rows)` → Σ `lineTotal`
- `sharePct(row, grand)` → `grand > 0 ? lineTotal(row) / grand * 100 : 0`

## 4. UI

- **`src/app/expenses/page.js`** — server component,
  `export const dynamic = "force-dynamic"`, reads `repo.expenses()`, renders
  `<SectionHeader>` + `<ExpensesTable>`.
- **`src/features/expenses/ExpensesTable.jsx`** — client component, optimistic
  local list mirroring the server (`useState` + `useTransition`, same shape as
  `DrinksGrid`):
  - A styled `<table>` in the paper aesthetic — dashed `border-ink`, `font-mono`
    numbers, theme color utilities (forest/clay/olive/brown-soft); **no hardcoded
    hex**. Columns: **Item · Notes · Price ₱ · Qty · Total ₱ · % · ✕**.
  - Editable cells use the **existing form components**: `TextField` for
    item/notes, `NumberField variant="underline"` (₱ prefix on price) for
    price/qty. **Total** and **%** are computed, read-only.
  - **Persist on blur** for text/number edits (one Redis write per finished
    edit, not per keystroke); **＋ Add row** and **✕ delete** persist immediately.
  - **Grand-total footer row**: sums all line totals, shows **100%**.
  - Narrow screens: the table scrolls horizontally (`overflow-x-auto`).

## 5. Wiring

- **`src/components/Navbar.jsx`** — add `{ href: "/expenses", label: "Expenses" }`.
- **`src/app/page.js`** (home) — add a matching `06` home card reusing an
  existing Doodle icon, for consistency with the other 5 sections.

## Decisions / non-goals

- Route `/expenses`, nav label "Expenses".
- Qty allows decimals, defaults to 1; price defaults to 0.
- No "clear all", no CSV export, no per-user scoping (YAGNI). Per-row delete only.

## Verify

- `npm run build` (runs the Zod parse — catches bad data + bad code).
- Sanity-check the new force-dynamic route returns 200 with Redis configured.
