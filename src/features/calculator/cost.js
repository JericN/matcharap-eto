// Pure pricing math. Inputs are already valid (validated at the config boundary)
// — these functions just compute. `priceOf` maps an ingredient name → ₱/cup and
// is guaranteed to resolve every attached name (the catalog only grows).

export const matchaCostPerCup = (pricePerGram, doseGrams) => Math.round(pricePerGram * doseGrams);
export const milkCostPerCup = (milkPricePerMl, milkMl) => Math.round(milkPricePerMl * milkMl);
export const addonCostPerCup = (drink, priceOf) =>
  drink.ingredients.reduce((sum, n) => sum + priceOf(n), 0);

// Per-cup COGS: matcha + milk + add-ons + packaging + additional. Each part is
// whole ₱ so the on-screen breakdown sums exactly. A drink can drop matcha or
// milk (e.g. matcha+coffee, or a no-milk drink) — the removed base costs 0.
export function cogsForDrink(
  drink,
  { pricePerGram, doseGrams, milkPricePerMl, priceOf, packaging, additional },
) {
  return (
    (drink.hasMatcha ? matchaCostPerCup(pricePerGram, doseGrams) : 0) +
    (drink.hasMilk ? milkCostPerCup(milkPricePerMl, drink.milkMl) : 0) +
    addonCostPerCup(drink, priceOf) +
    packaging +
    additional
  );
}

export const profit = (srp, cogs) => srp - cogs;
export const marginPct = (srp, cogs) => (srp > 0 ? Math.round(((srp - cogs) / srp) * 100) : 0);
export const marginWord = (m) => (m >= 65 ? "healthy ✓" : m >= 45 ? "ok" : "tight");

// Roll the costed drinks up into grand totals + a COGS breakdown by component.
// `lines` = [{ drink, cups, srp }]. Each component total is Σ (cups × whole-₱
// per-cup part), so matcha+milk+addons+packaging+additional sum EXACTLY to cogs,
// and cogs equals Σ (cups × cogsForDrink) — breakdown and total never disagree.
export function tallyTotals(lines, ctx) {
  const t = {
    cups: 0,
    matcha: 0,
    milk: 0,
    addons: 0,
    packaging: 0,
    additional: 0,
    cogs: 0,
    revenue: 0,
  };
  const addonByName = {}; // ingredient name -> ₱ across all cups (breakdown of `addons`)
  for (const { drink, cups, srp } of lines) {
    t.cups += cups;
    t.matcha += drink.hasMatcha ? cups * matchaCostPerCup(ctx.pricePerGram, ctx.doseGrams) : 0;
    t.milk += drink.hasMilk ? cups * milkCostPerCup(ctx.milkPricePerMl, drink.milkMl) : 0;
    t.packaging += cups * ctx.packaging;
    t.additional += cups * ctx.additional;
    t.revenue += cups * srp;
    for (const name of drink.ingredients) {
      const spend = cups * ctx.priceOf(name);
      addonByName[name] = (addonByName[name] ?? 0) + spend;
      t.addons += spend;
    }
  }
  t.cogs = t.matcha + t.milk + t.addons + t.packaging + t.additional;
  t.profit = t.revenue - t.cogs;
  t.addonByName = addonByName;
  return t;
}
