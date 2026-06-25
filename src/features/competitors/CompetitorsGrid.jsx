"use client";
import { useState, useTransition } from "react";
import { toggleCompetitor } from "@/config/actions";
import CompetitorCard from "@/features/competitors/CompetitorCard";

// left-to-right rows, but each card keeps its natural height (items-start = no row-stretch)
const GRID = "grid gap-[18px] [grid-template-columns:repeat(auto-fill,minmax(min(100%,320px),1fr))] items-start";
const REGIONS = [
  { k: "all", label: "All areas" },
  { k: "north", label: "🧭 North · QC·Caloocan·Marikina" },
  { k: "central", label: "🏙 Central · Makati·BGC·Ortigas" },
  { k: "south", label: "🌴 South · Las Piñas·Parañaque·Alabang" },
];
const BANDS = [
  { k: "all", label: "Any price" },
  { k: "budget", label: "₱ Budget" },
  { k: "mid", label: "₱₱ Mid" },
  { k: "premium", label: "₱₱₱ Premium" },
];
// stacked sections, top → bottom
const SECTIONS = [
  { tier: "giant", emoji: "🍃", title: "Big Leaves", blurb: "the corporate giants & multi-branch chains" },
  { tier: "general", emoji: "🌱", title: "Little Leaves", blurb: "the smaller homegrown Metro Manila field" },
  { tier: "japan", emoji: "🇯🇵", title: "Straight from Japan", blurb: "iconic & one-of-a-kind houses to borrow ideas from · ¥ prices shown as ≈₱ (×0.379)" },
];

export default function CompetitorsGrid({ competitors, initialSaved = [] }) {
  const [region, setRegion] = useState("all");
  const [band, setBand] = useState("all");
  const [saved, setSaved] = useState(initialSaved); // shared Redis state, seeded from the server
  const [, startTransition] = useTransition();

  const savedSet = new Set(saved);
  const toggleSave = (name) => {
    setSaved((s) => (s.includes(name) ? s.filter((n) => n !== name) : [...s, name])); // optimistic
    startTransition(() => toggleCompetitor(name)); // persist centrally
  };

  const match = (c) =>
    (region === "all" || c.region === region) && (band === "all" || c.band === band);

  const chips = (items, val, set) =>
    items.map((x) => (
      <button
        key={x.k}
        className={"chip" + (val === x.k ? " chip--active" : "")}
        onClick={() => set(x.k)}
      >
        {x.label}
      </button>
    ));

  return (
    <>
      <div className="flex flex-col gap-[10px] mb-8">
        <div className="chiprow flex flex-wrap gap-[9px]">{chips(REGIONS, region, setRegion)}</div>
        <div className="chiprow flex flex-wrap gap-[9px]">{chips(BANDS, band, setBand)}</div>
      </div>

      {SECTIONS.map((s) => {
        const cards = competitors
          .filter((c) => c.tier === s.tier && match(c))
          .sort((a, b) => a.rank - b.rank);
        if (!cards.length) return null;
        return (
          <section key={s.tier} className="mt-16 first:mt-4 mb-0">
            <div className="flex items-center gap-[12px] flex-wrap mb-1">
              <h3 className="font-doodle font-bold text-[2.5rem] max-md:text-[2rem] text-forest leading-[1] -rotate-[.8deg]">
                {s.emoji} {s.title}
              </h3>
              <span className="font-mono text-[.65rem] tracking-[.1em] uppercase text-brown bg-cream-light border-2 border-brown rounded-pill px-[11px] py-[4px] -translate-y-1">
                {cards.length}
              </span>
            </div>
            <p className="font-body text-[.9rem] text-olive-soft mb-4">{s.blurb}</p>
            <hr className="border-0 border-t-2 border-dashed border-ink opacity-60 mb-7 mt-0" />
            <div className={GRID}>
              {cards.map((c) => (
                <CompetitorCard
                  key={c.name}
                  c={c}
                  saved={savedSet.has(c.name)}
                  onToggleSave={() => toggleSave(c.name)}
                />
              ))}
            </div>
          </section>
        );
      })}
    </>
  );
}
