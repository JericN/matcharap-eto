"use client";
import { useState, useTransition } from "react";
import { togglePowder, setPriceOverride, resetPriceOverride } from "@/config/actions";
import { perGram } from "@/features/powders/pricing";
import PowderCard from "@/features/powders/PowderCard";
import SectionTitle from "@/components/SectionTitle";

const GRID = "card-grid";
const SECTION = "mb-12 max-md:mb-9";
const CATS = [
  ["all", "All"],
  ["ph", "🇵🇭 PH Homegrown"],
  ["jp", "🇯🇵 Japanese · in PH"],
  ["import", "🌏 Imported"],
];

export default function PowderGrid({ powders, images, initialSaved, initialOverrides }) {
  const [cat, setCat] = useState("all");
  const [saved, setSaved] = useState(initialSaved); // shared state, seeded from the server
  const [overrides, setOverrides] = useState(initialOverrides); // priceOverrides, seeded from server
  const [, startTransition] = useTransition();

  const savedSet = new Set(saved);
  const toggle = (name) => {
    setSaved((s) => (s.includes(name) ? s.filter((n) => n !== name) : [...s, name]));
    startTransition(() => togglePowder(name));
  };

  // Edit a powder's ₱/g — same "matcha:<name>" override the calculator reads, so
  // it flows straight into costing. Empty / unchanged-from-default ⇒ clear it.
  const commitPrice = (p, raw) => {
    const key = "matcha:" + p.name;
    const n = parseFloat(raw);
    if (raw === "" || !Number.isFinite(n) || n < 0 || n === perGram(p)) {
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

  const card = (p) => (
    <PowderCard
      key={p.name}
      powder={p}
      img={images[p.name]}
      saved={savedSet.has(p.name)}
      onToggleSave={() => toggle(p.name)}
      override={overrides["matcha:" + p.name]}
      onCommitPrice={(raw) => commitPrice(p, raw)}
    />
  );

  const selected = powders.filter((p) => savedSet.has(p.name));
  const rest = powders.filter((p) => !savedSet.has(p.name));
  const shown = rest.filter((p) => cat === "all" || p.cat === cat);

  return (
    <>
      {selected.length > 0 && (
        <section className={SECTION}>
          <SectionTitle icon="♥" title="Our Selection" meta={`${selected.length} saved`} />
          <div className={GRID}>{selected.map(card)}</div>
        </section>
      )}

      <section className={SECTION}>
        <SectionTitle icon="🍃" title="The Whole Shelf" meta={`${rest.length} powders`} />
        <div className="flex flex-wrap gap-[9px] mb-[22px]">
          {CATS.map(([k, label]) => (
            <button
              key={k}
              className={"chip" + (cat === k ? " chip--active" : "")}
              onClick={() => setCat(k)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className={GRID}>{shown.map(card)}</div>
      </section>
    </>
  );
}
