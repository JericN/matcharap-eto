// Pure helpers that read numbers out of a milk's display `price` string.
// Client-safe (no server/Edge deps) so the milk-card headline and the calculator's
// milk-option derivation share ONE parser instead of each rolling their own.
// Mirrors src/features/powders/pricing.js (which parses ₱/g for powders).

const PER_L = /₱([\d,]+(?:\.\d+)?)\s*\/\s*L/i;
const PER_L_LABEL = /₱[\d,]+(?:\.\d+)?\s*\/\s*L/i;

// numeric ₱/L — for cost math + the calculator dropdown
export function perLiter(milk) {
  const m = milk.price.match(PER_L);
  return m ? parseFloat(m[1].replace(/,/g, "")) : null;
}

// display ₱/L without the "/L" suffix (e.g. "₱114") — the card headline
export function perLiterLabel(milk) {
  const m = milk.price.match(PER_L_LABEL);
  return m ? m[0].replace(/\s*\/\s*L/i, "") : "—";
}

// ≈₱ per cup at a given milk volume (default 180 ml) — the card sub-line
export function perCupLabel(milk, ml = 180) {
  const pl = perLiter(milk);
  return pl == null ? "—" : `₱${Math.round((pl / 1000) * ml)}`;
}

// Concentrates/creamers (evaporated, condensed) are research-board entries, not
// pourable latte bases — exclude them from the calculator dropdown (mirrors the
// powder sweetened-mix exclusion in toMatchaOptions).
const CONCENTRATE = /evaporat|condensed|creamer/i;

// Milk choices for the calculator dropdown, derived from the milk list (single
// source of truth, like toMatchaOptions). Skips concentrates + milks with no
// parseable ₱/L; cheapest-first. `l` splits on " — " in the calculator to show
// the short name, and is the identity for "milk:<label>" price overrides; `ml`
// is ₱ per ml.
export function toMilkOptions(milks) {
  return milks
    .filter((m) => !CONCENTRATE.test(`${m.type} ${m.name}`))
    .map((m) => ({ milk: m, pl: perLiter(m) }))
    .filter((x) => x.pl != null)
    .sort((a, b) => a.pl - b.pl)
    .map(({ milk, pl }) => ({ l: `${milk.name} — ₱${pl}/L`, ml: pl / 1000, cat: milk.cat }));
}
