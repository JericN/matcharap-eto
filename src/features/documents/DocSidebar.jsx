"use client";

// Presentational list of docs with a create button + per-row delete.
// All state lives in the parent (DocumentsApp); this is pure props in / events out.
export default function DocSidebar({ docs, selectedId, onSelect, onCreate, onDelete }) {
  return (
    <div className="bg-cream-card border-2 border-forest rounded-card p-2">
      <button
        type="button"
        onClick={onCreate}
        className="chip chip--active normal-case tracking-normal w-full mb-2"
      >
        ＋ New document
      </button>

      {docs.length === 0 ? (
        <p className="px-2 py-3 text-center font-mono text-[.66rem] text-brown-soft">
          No documents yet
        </p>
      ) : (
        <ul className="flex flex-col gap-1">
          {docs.map((doc) => {
            const active = doc.id === selectedId;
            return (
              <li key={doc.id} className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onSelect(doc.id)}
                  title={doc.title}
                  className={
                    "flex-1 min-w-0 text-left truncate font-doodle text-[.95rem] rounded-cell px-2 py-1.5 transition " +
                    (active ? "bg-matcha-fill text-forest" : "hover:bg-cream-light")
                  }
                >
                  {doc.title || "Untitled"}
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(doc.id)}
                  title="Delete document"
                  aria-label={`Delete ${doc.title || "Untitled"}`}
                  className="shrink-0 px-1.5 py-1 rounded-cell text-brown-soft hover:text-clay transition"
                >
                  🗑
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
