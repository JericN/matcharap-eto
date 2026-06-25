"use client";
import { useState, useTransition } from "react";
import { toggleDrink, attachIngredient, detachIngredient, addIngredient, toggleBase } from "@/config/actions";
import DrinkCard from "@/features/drinks/DrinkCard";
import { TextField, NumberField } from "@/components/form";
import SectionTitle from "@/components/SectionTitle";

const GRID = "card-grid";
const SECTION = "mb-12 max-md:mb-9"; // shared section spacing (matches the calculator)
const EMPTY = { name: "", emoji: "", price: "", link: "" };

export default function DrinksGrid({ drinks, ingredients, initialSaved }) {
  const [saved, setSaved] = useState(initialSaved);
  const [attachMap, setAttachMap] = useState(() => Object.fromEntries(drinks.map((d) => [d.name, d.ingredients])));
  const [baseMap, setBaseMap] = useState(() => Object.fromEntries(drinks.map((d) => [d.name, { matcha: d.hasMatcha, milk: d.hasMilk }])));
  const [cat, setCat] = useState(ingredients);
  const [form, setForm] = useState(EMPTY);
  const [, startTransition] = useTransition();

  const toggle = (name) => {
    setSaved((s) => (s.includes(name) ? s.filter((n) => n !== name) : [...s, name]));
    startTransition(() => toggleDrink(name));
  };

  // attach/detach send a single-ingredient delta; the server merges it into the
  // fresh list (concurrent edits survive). Local state mirrors optimistically.
  const attach = (drink, ing) => {
    setAttachMap((m) => ({ ...m, [drink]: [...m[drink], ing] }));
    startTransition(() => attachIngredient(drink, ing));
  };

  const detach = (drink, ing) => {
    setAttachMap((m) => ({ ...m, [drink]: m[drink].filter((n) => n !== ing) }));
    startTransition(() => detachIngredient(drink, ing));
  };

  const flipBase = (drink, base) => {
    setBaseMap((m) => ({ ...m, [drink]: { ...m[drink], [base]: !m[drink][base] } }));
    startTransition(() => toggleBase(drink, base));
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const create = () => {
    const ing = { name: form.name.trim(), emoji: form.emoji.trim(), price: Number(form.price) || 0, link: form.link.trim() || null };
    if (!ing.name || cat.some((c) => c.name === ing.name)) return;
    setCat((c) => [...c, ing]);
    startTransition(() => addIngredient(ing));
    setForm(EMPTY);
  };

  const savedSet = new Set(saved);
  const card = (d) => (
    <DrinkCard
      key={d.name}
      drink={{ ...d, ingredients: attachMap[d.name], hasMatcha: baseMap[d.name].matcha, hasMilk: baseMap[d.name].milk }}
      saved={savedSet.has(d.name)}
      onToggleSave={() => toggle(d.name)}
      catalog={cat}
      onAttach={(ing) => attach(d.name, ing)}
      onDetach={(ing) => detach(d.name, ing)}
      onToggleBase={(base) => flipBase(d.name, base)}
    />
  );

  const selected = drinks.filter((d) => savedSet.has(d.name));
  const rest = drinks.filter((d) => !savedSet.has(d.name));

  return (
    <>
      {selected.length > 0 && (
        <section className={SECTION}>
          <SectionTitle icon="♥" title="Our Selection" meta={`${selected.length} saved`} />
          <div className={GRID}>{selected.map(card)}</div>
        </section>
      )}

      {rest.length > 0 && (
        <section className={SECTION}>
          <SectionTitle icon="🍵" title="More to Whisk" meta={`${rest.length} on the menu`} />
          <div className={GRID}>{rest.map(card)}</div>
        </section>
      )}

      <section className={SECTION}>
        <SectionTitle title="Ingredients" meta={`${cat.length} add-ons`} />
        <p className="sec-sub mb-4 -mt-3">The shared add-on catalog · ₱ per cup. Attach any of these to a drink above; ones with a ↗ are clickable — hover for detail, click to open the reference.</p>

        <div className="flex flex-wrap gap-[9px] mb-5">
          {cat.map((ing) => {
            const inner = (
              <>
                <span className="text-[1.05rem] leading-none">{ing.emoji}</span>
                <span className="font-doodle font-bold text-[.92rem] text-forest leading-none">{ing.name}</span>
                <span className="font-mono text-[.7rem] text-clay leading-none">₱{ing.price}</span>
                {ing.link && <span className="text-[.95rem] text-olive leading-none" aria-hidden="true">↗</span>}
              </>
            );
            return ing.link ? (
              <a
                key={ing.name}
                href={ing.link}
                target="_blank"
                rel="noopener"
                title={`${ing.emoji} ${ing.name} · ₱${ing.price}/cup — open reference ↗`}
                aria-label={`${ing.name}, ₱${ing.price} per cup — open reference`}
                className="ing-tile flex-row items-center gap-[9px] !py-2 no-underline cursor-pointer transition hover:border-forest hover:-translate-y-0.5"
              >
                {inner}
              </a>
            ) : (
              <div
                key={ing.name}
                title={`${ing.emoji} ${ing.name} · ₱${ing.price}/cup — no reference link yet`}
                className="ing-tile flex-row items-center gap-[9px] !py-2"
              >
                {inner}
              </div>
            );
          })}
        </div>

        {/* compact creator bar — emoji · name · URL · price · Add */}
        <div className="paper-card !static p-[14px]">
          <div className="flex items-baseline gap-2 mb-2.5">
            <span className="font-doodle font-bold text-[.98rem] text-forest leading-none">Add new ingredients</span>
            <span className="font-mono text-[.56rem] tracking-[.04em] text-brown-soft">emoji + name + link + ₱/cup · all optional but the name</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <TextField
              aria-label="Emoji"
              className="shrink-0"
              inputClassName="text-center !w-[54px]"
              value={form.emoji}
              onChange={set("emoji")}
              placeholder="🥥"
            />
            <TextField
              aria-label="Ingredient name"
              className="flex-1 min-w-[150px]"
              value={form.name}
              onChange={set("name")}
              onKeyDown={(e) => e.key === "Enter" && create()}
              placeholder="Name — e.g. Oat foam"
            />
            <TextField
              aria-label="Reference link"
              type="url"
              className="flex-1 min-w-[170px]"
              value={form.link}
              onChange={set("link")}
              onKeyDown={(e) => e.key === "Enter" && create()}
              placeholder="https://… reference (optional)"
            />
            <NumberField
              aria-label="Price per cup"
              prefix="₱"
              className="shrink-0"
              inputClassName="!w-[110px]"
              min="0"
              step="0.5"
              value={form.price}
              onChange={set("price")}
              placeholder="0"
            />
            <button
              type="button"
              onClick={create}
              disabled={!form.name.trim()}
              className="chip chip--active normal-case tracking-normal shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
