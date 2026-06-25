"use client";
import { useState, useTransition } from "react";
import { toggleEvent } from "@/config/actions";
import EventCard from "@/features/events/EventCard";

const GRID = "card-grid";
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// Chronological: dated events ascending (soonest first); recurring (no start) last.
const byDate = (a, b) => {
  if (a.start && b.start) return a.start < b.start ? -1 : a.start > b.start ? 1 : 0;
  if (a.start) return -1;
  if (b.start) return 1;
  return 0;
};

const bucketKey = (e) => (e.start ? e.start.slice(0, 7) : "recurring"); // "2026-08" | "recurring"
const bucketLabel = (key) => {
  if (key === "recurring") return "Recurring & year-round";
  const [y, m] = key.split("-");
  return `${MONTHS[+m - 1]} ${y}`;
};

export default function EventsGrid({ events, initialSaved }) {
  const [saved, setSaved] = useState(initialSaved); // shared state, seeded from the store
  const [, startTransition] = useTransition();

  const savedSet = new Set(saved);
  const toggle = (name) => {
    setSaved((s) => (s.includes(name) ? s.filter((n) => n !== name) : [...s, name])); // optimistic
    startTransition(() => toggleEvent(name)); // persist to the centralized store
  };

  const card = (e) => (
    <EventCard key={e.name} event={e} saved={savedSet.has(e.name)} onToggleSave={() => toggle(e.name)} />
  );

  const selected = events.filter((e) => savedSet.has(e.name)).sort(byDate);
  const rest = events.filter((e) => !savedSet.has(e.name)).sort(byDate);

  // Bucket the (already date-sorted) rest into month groups; recurring lands last.
  const groups = [];
  const byKey = {};
  for (const e of rest) {
    const key = bucketKey(e);
    if (!(key in byKey)) { byKey[key] = groups.length; groups.push({ key, items: [] }); }
    groups[byKey[key]].items.push(e);
  }

  return (
    <>
      {selected.length > 0 && (
        <section className="mb-9">
          <div className="flex items-baseline gap-2 mb-3">
            <h3 className="font-doodle font-bold text-[1.2rem] text-forest">♥ Our selection</h3>
            <span className="font-mono text-[.6rem] tracking-[.08em] uppercase text-brown-soft">{selected.length} saved</span>
          </div>
          <div className={GRID}>{selected.map(card)}</div>
          <hr className="rule" />
        </section>
      )}

      {groups.map((g) => (
        <section key={g.key} className="mb-9">
          <div className="flex items-baseline gap-2 mb-3">
            <h3 className="font-doodle font-bold text-[1.2rem] text-forest">
              {bucketLabel(g.key)}
              {g.key === "recurring" && <span className="font-mono text-[.62rem] tracking-[.04em] normal-case text-brown-soft ml-2">(no date confirmed yet)</span>}
            </h3>
            <span className="font-mono text-[.6rem] tracking-[.08em] uppercase text-brown-soft">{g.items.length} event{g.items.length > 1 ? "s" : ""}</span>
          </div>
          <div className={GRID}>{g.items.map(card)}</div>
        </section>
      ))}
    </>
  );
}
