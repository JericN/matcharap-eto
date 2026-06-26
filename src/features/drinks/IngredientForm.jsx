"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { TextField, NumberField } from "@/components/form";

// Edit an add-on ingredient. The name is the key (name-keyed catalog +
// overlays) → read-only; renaming would orphan references.
export default function IngredientForm({ ingredient, onSave, onClose }) {
  const [emoji, setEmoji] = useState(ingredient.emoji);
  const [price, setPrice] = useState(ingredient.price);
  const [link, setLink] = useState(ingredient.link ?? "");

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const trimmedLink = link.trim();
  const linkValid =
    trimmedLink === "" ||
    (() => {
      try {
        new URL(trimmedLink);
        return true;
      } catch {
        return false;
      }
    })();
  const valid = linkValid;

  const submit = () => {
    if (!valid) return;
    onSave({
      emoji: emoji.trim(),
      price: Number(price) || 0,
      link: trimmedLink || null,
    });
  };

  if (typeof document === "undefined") return null;
  return createPortal(
    <div
      className="fixed inset-0 z-[60] bg-forest/85 backdrop-blur-sm overflow-y-auto p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Edit ${ingredient.name}`}
    >
      <div
        className="paper-card !static w-full max-w-[460px] mx-auto my-6 p-5 max-md:p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-baseline gap-2 mb-4">
          <h3 className="font-doodle font-bold text-[1.4rem] text-forest leading-none">
            Edit ingredient
          </h3>
          <span className="font-mono text-[.56rem] tracking-[.06em] uppercase text-brown-soft">
            synced to everyone
          </span>
        </div>

        <div className="flex flex-col gap-3">
          <TextField
            label="Name"
            id="if-name"
            value={ingredient.name}
            disabled
            inputClassName="opacity-60 cursor-not-allowed"
          />
          <TextField
            label="Emoji"
            id="if-emoji"
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            placeholder="🍓"
          />
          <NumberField
            label="Price"
            id="if-price"
            prefix="₱"
            min="0"
            step="0.5"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <TextField
            label="Reference link"
            id="if-link"
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://… (optional)"
          />
          {!linkValid && (
            <p className="font-mono text-[.58rem] text-clay -mt-2">
              Enter a valid URL or leave it blank.
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button type="button" onClick={onClose} className="chip normal-case tracking-normal">
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!valid}
            className="chip chip--active normal-case tracking-normal disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save changes
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
