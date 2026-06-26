"use client";
import { useState, useTransition } from "react";
import { toggleMilk, setPriceOverride, resetPriceOverride } from "@/config/actions";
import { perLiter, milkOptionLabel } from "@/features/milks/pricing";
import MilkCard from "@/features/milks/MilkCard";
import SectionTitle from "@/components/SectionTitle";

const GRID = "card-grid";
const SECTION = "mb-12 max-md:mb-9";
// the 4 research buckets, rendered top→bottom as their own sections (tiers ARE the cut)
const BUCKETS = [
  ["ph", "🇵🇭 PH-made / available"],
  ["import", "🌏 Imported barista milks"],
  ["authentic", "🍵 Authentic-matcha pairing"],
  ["unique", "✨ Unique / specialty"],
];

export default function MilkGrid({ milks, images, initialSaved, initialOverrides }) {
  const [saved, setSaved] = useState(initialSaved); // shared state, seeded from the server
  const [overrides, setOverrides] = useState(initialOverrides); // priceOverrides, seeded from server
  const [, startTransition] = useTransition();

  const savedSet = new Set(saved);
  const toggle = (name) => {
    setSaved((s) => (s.includes(name) ? s.filter((n) => n !== name) : [...s, name]));
    startTransition(() => toggleMilk(name));
  };

  // Edit a milk's ₱/L — same "milk:<label>" override the calculator reads, so it
  // flows straight into costing. Empty / unchanged-from-default ⇒ clear it.
  const commitPrice = (m, raw) => {
    const label = milkOptionLabel(m);
    if (!label) return; // no parseable ₱/L (concentrates) → not editable
    const key = "milk:" + label;
    const n = parseFloat(raw);
    if (raw === "" || !Number.isFinite(n) || n < 0 || n === perLiter(m)) {
      setOverrides((o) => {
        const c = { ...o };
        delete c[key];
        return c;
      });
      startTransition(() => resetPriceOverride(key));
    } else {
      setOverrides((o) => ({ ...o, [key]: n }));
      startTransition(() => setPriceOverride(key, n));
    }
  };

  const card = (m) => {
    const label = milkOptionLabel(m);
    return (
      <MilkCard
        key={m.name}
        milk={m}
        img={images[m.name]}
        saved={savedSet.has(m.name)}
        onToggleSave={() => toggle(m.name)}
        override={label ? overrides["milk:" + label] : undefined}
        onCommitPrice={(raw) => commitPrice(m, raw)}
      />
    );
  };

  // hearted milks (in heart order) lift into "Our Selection"; the rest stay in their bucket
  const selected = saved.map((n) => milks.find((m) => m.name === n)).filter(Boolean);
  const rest = milks.filter((m) => !savedSet.has(m.name));

  return (
    <>
      {selected.length > 0 && (
        <section className={SECTION}>
          <SectionTitle icon="♥" title="Our Selection" meta={`${selected.length} saved`} />
          <div className={GRID}>{selected.map(card)}</div>
        </section>
      )}

      {BUCKETS.map(([k, label]) => {
        const items = rest.filter((m) => m.cat === k);
        if (items.length === 0) return null;
        return (
          <section key={k} className={SECTION}>
            <SectionTitle title={label} meta={`${items.length} milks`} />
            <div className={GRID}>{items.map(card)}</div>
          </section>
        );
      })}
    </>
  );
}
