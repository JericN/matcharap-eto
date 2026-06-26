"use client";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

// Horizontal row of "sheet" tabs for the expense planner. Click selects; the
// trailing ＋ adds; right-click a tab opens a cursor-anchored context menu
// (rename / delete) portaled to document.body — mirrors DrinkCard.jsx. Inline
// rename swaps the active pill for a small text input. All persistence is up
// to the parent via callbacks; this owns only its own UI state.
export default function TabBar({ tabs, activeTabId, onSelect, onAdd, onRename, onDelete }) {
  const [menu, setMenu] = useState(null); // right-click context menu {id, x, y} or null
  const [renameId, setRenameId] = useState(null); // tab id being inline-renamed, or null
  const [draft, setDraft] = useState("");
  const inputRef = useRef(null);

  const canDelete = tabs.length > 1;

  // Close the context menu on Escape (outside-click is handled by the backdrop).
  useEffect(() => {
    if (!menu) return;
    const onKey = (e) => e.key === "Escape" && setMenu(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menu]);

  // Focus + select-all when an inline rename begins.
  useEffect(() => {
    if (renameId && inputRef.current) inputRef.current.select();
  }, [renameId]);

  const startRename = (tab) => {
    setMenu(null);
    setDraft(tab.name);
    setRenameId(tab.id);
  };
  const commitRename = (id) => {
    const v = draft.trim();
    if (v) onRename(id, v);
    setRenameId(null);
  };

  return (
    <div className="flex flex-wrap items-center gap-[7px]">
      {tabs.map((tab) =>
        renameId === tab.id ? (
          <input
            key={tab.id}
            ref={inputRef}
            value={draft}
            autoFocus
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => commitRename(tab.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitRename(tab.id);
              else if (e.key === "Escape") setRenameId(null);
            }}
            aria-label={"Rename sheet " + tab.name}
            className="field-box w-[130px] py-[6px] px-[11px] text-[.64rem]"
          />
        ) : (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelect(tab.id)}
            onContextMenu={(e) => {
              e.preventDefault();
              setMenu({ id: tab.id, x: e.clientX, y: e.clientY });
            }}
            aria-pressed={tab.id === activeTabId}
            className={`chip${tab.id === activeTabId ? " chip--active" : ""}`}
          >
            {tab.name}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={onAdd}
        aria-label="Add sheet"
        className="chip px-[12px]"
      >
        ＋
      </button>

      {menu &&
        typeof document !== "undefined" &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-[55]"
              onClick={() => setMenu(null)}
              onContextMenu={(e) => {
                e.preventDefault();
                setMenu(null);
              }}
              aria-hidden="true"
            />
            <div
              className="fixed z-[56] min-w-[150px] bg-cream-card border-2 border-forest rounded-[10px] shadow-hard-sm p-1"
              style={{ top: menu.y, left: menu.x }}
            >
              <button
                type="button"
                onClick={() => startRename(tabs.find((t) => t.id === menu.id))}
                className="block w-full text-left px-2.5 py-1.5 rounded-[7px] font-mono text-[.66rem] text-forest hover:bg-cream-light transition"
              >
                ✎ Rename
              </button>
              {canDelete && (
                <button
                  type="button"
                  onClick={() => {
                    const id = menu.id;
                    setMenu(null);
                    onDelete(id);
                  }}
                  className="block w-full text-left px-2.5 py-1.5 rounded-[7px] font-mono text-[.66rem] text-clay hover:bg-cream-light transition"
                >
                  🗑 Delete
                </button>
              )}
            </div>
          </>,
          document.body,
        )}
    </div>
  );
}
