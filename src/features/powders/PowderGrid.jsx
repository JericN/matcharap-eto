"use client";
import { useState, useTransition } from "react";
import { togglePowder } from "@/config/actions";
import PowderCard from "@/features/powders/PowderCard";
import SectionTitle from "@/components/SectionTitle";

const GRID = "card-grid";
const SECTION = "mb-12 max-md:mb-9"; // shared section spacing (matches drinks + calculator)

export default function PowderGrid({ powders, images, initialSaved }) {
  const [f, setF] = useState("all");
  const [saved, setSaved] = useState(initialSaved); // shared state, seeded from the server
  const [, startTransition] = useTransition();

  const savedSet = new Set(saved);
  const toggle = (name) => {
    setSaved((s) => (s.includes(name) ? s.filter((n) => n !== name) : [...s, name])); // optimistic
    startTransition(() => togglePowder(name)); // persist to the centralized store
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
  const shown = rest.filter((p) => f === "all" || p.cat === f);

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
        <div className="chiprow flex flex-wrap gap-[9px] mb-[22px]">
          <button className={"chip" + (f === "all" ? " chip--active" : "")} onClick={() => setF("all")}>All</button>
          <button className={"chip" + (f === "ph" ? " chip--active" : "")} onClick={() => setF("ph")}>🇵🇭 PH Homegrown</button>
          <button className={"chip" + (f === "jp" ? " chip--active" : "")} onClick={() => setF("jp")}>🇯🇵 Japanese · in PH</button>
          <button className={"chip" + (f === "import" ? " chip--active" : "")} onClick={() => setF("import")}>🌏 Imported</button>
        </div>
        <div className={GRID}>{shown.map(card)}</div>
      </section>
    </>
  );
}
