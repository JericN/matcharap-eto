"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { TextField, NumberField } from "@/components/form";

// localStorage draft so an in-progress form survives closing/reopening. Keyed
// per form identity (the new-drink form, or a specific drink being edited).
const draftKey = (isNew, name) => (isNew ? "df:new" : `df:edit:${name}`);
const readDraft = (k) => {
  try {
    const raw = window.localStorage.getItem(k);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};
const writeDraft = (k, v) => {
  try {
    window.localStorage.setItem(k, JSON.stringify(v));
  } catch {
    /* ignore unavailable storage */
  }
};
const clearDraft = (k) => {
  try {
    window.localStorage.removeItem(k);
  } catch {
    /* ignore */
  }
};

// Add/edit a drink — one modal form for both. On a new drink the name is the
// key (must be unique); on edit it's read-only (renaming would orphan overlays).
// Only ever rendered client-side (after a click), so reading localStorage in the
// lazy initializer is hydration-safe.
export default function DrinkForm({ drink, isNew, existingNames, catalog, onSave, onClose }) {
  const dkey = draftKey(isNew, drink.name);
  const [snap] = useState(() => ({ ...drink, ...(readDraft(dkey) ?? {}) }));
  const [name, setName] = useState(snap.name);
  const [note, setNote] = useState(snap.note);
  const [desc, setDesc] = useState(snap.desc);
  const [srp, setSrp] = useState(snap.srp);
  const [ingredients, setIngredients] = useState(snap.ingredients);
  const [hasMatcha, setHasMatcha] = useState(snap.hasMatcha);
  const [hasMilk, setHasMilk] = useState(snap.hasMilk);
  const [addOpen, setAddOpen] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // remember the in-progress values so closing & reopening keeps them
  useEffect(() => {
    writeDraft(dkey, { name, note, desc, srp, ingredients, hasMatcha, hasMilk });
  }, [dkey, name, note, desc, srp, ingredients, hasMatcha, hasMilk]);

  const trimmed = name.trim();
  const dup = isNew && existingNames.includes(trimmed);
  const valid = trimmed.length > 0 && !dup;

  const toggleIng = (n) =>
    setIngredients((arr) => (arr.includes(n) ? arr.filter((x) => x !== n) : [...arr, n]));

  const unattached = catalog.filter((i) => !ingredients.includes(i.name));
  const filtered = unattached.filter((i) =>
    i.name.toLowerCase().includes(q.trim().toLowerCase()),
  );

  const reset = () => {
    setName(drink.name);
    setNote(drink.note);
    setDesc(drink.desc);
    setSrp(drink.srp);
    setIngredients(drink.ingredients);
    setHasMatcha(drink.hasMatcha);
    setHasMilk(drink.hasMilk);
    setAddOpen(false);
    setQ("");
    clearDraft(dkey);
  };

  const submit = () => {
    if (!valid) return;
    clearDraft(dkey);
    onSave(
      {
        name: trimmed,
        note: note.trim(),
        desc: desc.trim(),
        srp: Number(srp) || 0,
        ingredients,
        hasMatcha,
        hasMilk,
      },
      isNew,
    );
  };

  if (typeof document === "undefined") return null;
  return createPortal(
    <div
      className="fixed inset-0 z-[60] bg-forest/85 backdrop-blur-sm overflow-y-auto p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={isNew ? "Add a new drink" : `Edit ${drink.name}`}
    >
      <div
        className="paper-card !static w-full max-w-[460px] mx-auto my-6 p-5 max-md:p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-baseline gap-2 mb-4">
          <h3 className="font-doodle font-bold text-[1.4rem] text-forest leading-none">
            {isNew ? "Add a drink" : "Edit drink"}
          </h3>
          <span className="font-mono text-[.56rem] tracking-[.06em] uppercase text-brown-soft">
            synced to everyone
          </span>
        </div>

        <div className="flex flex-col gap-3">
          <TextField
            label="Name"
            id="df-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Hojicha Matcha Latte"
            disabled={!isNew}
            inputClassName={isNew ? "" : "opacity-60 cursor-not-allowed"}
          />
          {dup && (
            <p className="font-mono text-[.58rem] text-clay -mt-2">
              A drink named “{trimmed}” already exists.
            </p>
          )}
          <TextField
            label="Subtitle"
            id="df-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="short tagline — e.g. roasty & smooth"
          />
          <div>
            <label htmlFor="df-desc" className="field-label">
              Description
            </label>
            <textarea
              id="df-desc"
              className="field-box leading-relaxed"
              rows={4}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="a sentence or two about the drink & how it fits the market…"
            />
          </div>
          <NumberField
            label="SRP"
            id="df-srp"
            prefix="₱"
            min="0"
            step="5"
            value={srp}
            onChange={(e) => setSrp(e.target.value)}
          />
          <div className="flex gap-2">
            <Toggle on={hasMatcha} onClick={() => setHasMatcha((v) => !v)} label="🍵 Matcha" />
            <Toggle on={hasMilk} onClick={() => setHasMilk((v) => !v)} label="🥛 Milk" />
          </div>

          {/* add-ons: attached pills + a "+ add" pill that opens a search picker */}
          <div>
            <span className="field-label">Add-on ingredients</span>
            <div className="flex flex-wrap gap-[6px] items-center">
              {ingredients.map((nm) => {
                const ing = catalog.find((i) => i.name === nm);
                return (
                  <span
                    key={nm}
                    className="font-mono text-[.58rem] uppercase tracking-[.04em] border-2 bg-matcha-fill border-olive text-forest rounded-pill px-[9px] py-[4px] inline-flex items-center gap-[5px]"
                  >
                    {ing?.emoji} {nm}
                    <button
                      type="button"
                      aria-label={"Remove " + nm}
                      onClick={() => toggleIng(nm)}
                      className="text-clay hover:text-forest leading-none"
                    >
                      ✕
                    </button>
                  </span>
                );
              })}
              {unattached.length > 0 && (
                <button
                  type="button"
                  onClick={() => setAddOpen((o) => !o)}
                  aria-expanded={addOpen}
                  className="font-mono text-[.58rem] uppercase tracking-[.06em] text-olive bg-cream-card border-2 border-dashed border-olive rounded-pill px-[10px] py-[4px] hover:border-forest hover:text-forest transition"
                >
                  ＋ add
                </button>
              )}
              {ingredients.length === 0 && unattached.length === 0 && (
                <span className="font-mono text-[.58rem] text-brown-soft">
                  No ingredients in the catalog.
                </span>
              )}
            </div>

            {addOpen && unattached.length > 0 && (
              <div className="mt-2 border-2 border-forest rounded-[11px] bg-cream-card p-2">
                <TextField
                  aria-label="Search ingredients"
                  autoFocus
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      e.stopPropagation();
                      setAddOpen(false);
                      setQ("");
                    }
                  }}
                  placeholder="Search ingredients…"
                  className="mb-2"
                />
                <div className="max-h-[180px] overflow-auto flex flex-col gap-[3px]">
                  {filtered.map((ing) => (
                    <button
                      key={ing.name}
                      type="button"
                      onClick={() => {
                        toggleIng(ing.name);
                        setQ("");
                      }}
                      className="text-left px-2.5 py-1.5 rounded-[7px] font-mono text-[.66rem] text-forest hover:bg-cream-light transition flex items-center gap-2"
                    >
                      <span className="text-[.95rem] leading-none">{ing.emoji}</span>
                      <span className="flex-1">{ing.name}</span>
                      <span className="text-clay">₱{ing.price}</span>
                    </button>
                  ))}
                  {filtered.length === 0 && (
                    <div className="px-2.5 py-2 font-mono text-[.6rem] text-brown-soft">
                      No matches.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 mt-5">
          <button
            type="button"
            onClick={reset}
            className="chip normal-case tracking-normal !text-clay"
          >
            ↺ Reset
          </button>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="chip normal-case tracking-normal">
              Cancel
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={!valid}
              className="chip chip--active normal-case tracking-normal disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isNew ? "Add drink" : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function Toggle({ on, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`flex-1 font-mono text-[.62rem] uppercase tracking-[.06em] border-2 rounded-[10px] py-2 transition ${
        on
          ? "bg-matcha-fill border-olive text-forest"
          : "bg-cream-light border-brown-soft/40 text-brown-soft"
      }`}
    >
      {on ? "✓ " : "✕ "}
      {label}
    </button>
  );
}
