"use client";
import { useState, useRef, useEffect, useTransition } from "react";
import { createDoc, updateDoc, deleteDoc, getDoc } from "@/config/actions";
import DocSidebar from "./DocSidebar";
import DocEditor from "./DocEditor";

const SAVE_DELAY = 600;

export default function DocumentsApp({ initialDocs }) {
  const [docs, setDocs] = useState(initialDocs); // meta list [{ id, title, updatedAt }]
  const [selectedId, setSelectedId] = useState(initialDocs[0]?.id ?? null);
  const [bodies, setBodies] = useState({}); // { [id]: { title, body } } — lazily loaded cache
  const timer = useRef(null); // pending debounce-save handle
  const [, startTransition] = useTransition();

  // LAZY LOAD — fetch the selected doc's full body the first time it's opened.
  useEffect(() => {
    if (!selectedId || bodies[selectedId] !== undefined) return;
    let cancelled = false;
    getDoc(selectedId).then((doc) => {
      if (cancelled || !doc) return; // doc may have been deleted meanwhile
      setBodies((b) => ({ ...b, [selectedId]: { title: doc.title, body: doc.body } }));
    });
    return () => {
      cancelled = true;
    };
  }, [selectedId, bodies]);

  // Immediately persist a pending edit (used before we navigate away from a doc).
  const flushPending = () => {
    if (!timer.current) return;
    clearTimeout(timer.current);
    timer.current = null;
    const prev = selectedId;
    const cached = prev && bodies[prev];
    if (cached) {
      startTransition(() => updateDoc(prev, { title: cached.title, body: cached.body }));
    }
  };

  const selectDoc = (id) => {
    if (id === selectedId) return;
    flushPending(); // don't lose unsaved edits when clicking away
    setSelectedId(id);
  };

  const createDocument = () => {
    flushPending();
    const id = crypto.randomUUID();
    const meta = { id, title: "Untitled", updatedAt: Date.now() };
    setDocs((d) => [meta, ...d]);
    setBodies((b) => ({ ...b, [id]: { title: "Untitled", body: "" } }));
    setSelectedId(id);
    startTransition(() => createDoc(id, "Untitled"));
  };

  const removeDocument = (id) => {
    setDocs((d) => d.filter((x) => x.id !== id));
    setBodies((b) => {
      const next = { ...b };
      delete next[id];
      return next;
    });
    if (id === selectedId) {
      if (timer.current) {
        clearTimeout(timer.current); // its pending save targets the doc we're deleting
        timer.current = null;
      }
      const remaining = docs.filter((x) => x.id !== id);
      setSelectedId(remaining[0]?.id ?? null);
    }
    startTransition(() => deleteDoc(id));
  };

  // EDIT — DocEditor hands back { title } or { body } for the selected doc.
  const onEdit = (patch) => {
    const id = selectedId;
    const merged = { ...bodies[id], ...patch };
    setBodies((b) => ({ ...b, [id]: merged }));
    if (patch.title !== undefined) {
      // keep the sidebar title in sync live
      setDocs((d) => d.map((x) => (x.id === id ? { ...x, title: patch.title } : x)));
    }
    // debounce-save the freshest merged values
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      timer.current = null;
      startTransition(() => updateDoc(id, { title: merged.title, body: merged.body }));
    }, SAVE_DELAY);
  };

  return (
    <div className="flex gap-5 max-md:flex-col items-start">
      <div className="w-[240px] max-md:w-full shrink-0 sticky top-[74px] max-md:static">
        <DocSidebar
          docs={docs}
          selectedId={selectedId}
          onSelect={selectDoc}
          onCreate={createDocument}
          onDelete={removeDocument}
        />
      </div>
      <div className="flex-1 min-w-0">
        {selectedId && bodies[selectedId] ? (
          <DocEditor key={selectedId} doc={bodies[selectedId]} onChange={onEdit} />
        ) : (
          <div className="bg-cream-card border-2 border-forest rounded-card min-h-[64vh] grid place-items-center p-8 text-center font-mono text-[.7rem] text-brown-soft">
            {selectedId ? "Loading…" : "No document selected — create one →"}
          </div>
        )}
      </div>
    </div>
  );
}
