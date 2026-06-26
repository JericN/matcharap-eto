"use client";
import { useEffect, useRef, useState } from "react";

// The big price badge on a powder/milk card, made inline-editable: double-click
// to turn it into a field; Enter or blur (click away) saves, Escape cancels.
// Purpose-built for the forest `.perg-box` badge (cream-light text). `onCommit`
// receives the trimmed input string — "" (or the unchanged default) means the
// caller should clear the override. `editable=false` renders plain static text.
export default function EditablePrice({ display, value, editable = true, onCommit }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    if (editing) ref.current?.select();
  }, [editing]);

  if (!editable) {
    return (
      <span className="font-display font-bold text-[2rem] leading-[.9] text-cream-light whitespace-nowrap">
        {display}
      </span>
    );
  }

  const start = () => {
    setDraft(value != null ? String(value) : "");
    setEditing(true);
  };
  const commit = () => {
    setEditing(false);
    onCommit(draft.trim());
  };

  if (editing) {
    return (
      <span className="inline-flex items-baseline">
        <span className="font-display font-bold text-[1.7rem] leading-[.9] text-cream-light/70">
          ₱
        </span>
        <input
          ref={ref}
          type="text"
          inputMode="decimal"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            else if (e.key === "Escape") setEditing(false);
          }}
          aria-label="Edit price"
          className="w-[5ch] bg-transparent text-cream-light border-b-2 border-matcha-bright outline-none font-display font-bold text-[1.7rem] leading-[.9]"
        />
      </span>
    );
  }

  return (
    <span
      onDoubleClick={start}
      title="Double-click to edit · Enter or click away to save"
      className="font-display font-bold text-[2rem] leading-[.9] text-cream-light whitespace-nowrap cursor-text"
    >
      {display}
    </span>
  );
}
