"use client";
import { useState, useTransition } from "react";
import { togglePowder } from "@/config/actions";
import PowderCard from "@/features/powders/PowderCard";
import SectionTitle from "@/components/SectionTitle";

const GRID = "card-grid";
const SECTION = "mb-12 max-md:mb-9";
const CATS = [["all", "All"], ["ph", "🇵🇭 PH Homegrown"], ["jp", "🇯🇵 Japanese · in PH"], ["import", "🌏 Imported"]];

export default function PowderGrid({ powders, images, initialSaved }) {
  const [cat, setCat] = useState("all");
  const [saved, setSaved] = useState(initialSaved); // shared state, seeded from the server
  const [, startTransition] = useTransition();

  const savedSet = new Set(saved);
  const toggle = (name) => {
    setSaved((s) => (s.includes(name) ? s.filter((n) => n !== name) : [...s, name]));
    startTransition(() => togglePowder(name));
  };

  const card = (p) => (
    <PowderCard
      key={p.name}
      powder={p}
      img={images[p.name]}
      saved={savedSet.has(p.name)}
      onToggleSave={() => toggle(p.name)}
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
            <button key={k} className={"chip" + (cat === k ? " chip--active" : "")} onClick={() => setCat(k)}>{label}</button>
          ))}
        </div>
        <div className={GRID}>{shown.map(card)}</div>
      </section>
    </>
  );
}
