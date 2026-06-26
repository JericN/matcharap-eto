import { z } from "zod";
import { redis } from "./redis";

// ============================================================================
// DOCUMENTS — shared markdown notes, stored OUTSIDE the global `state` record.
//
// `state.js` reads + Zod-parses ONE big record on every request, so anything
// kept there is paid for on every page load. Docs can be many and large, so
// each gets its own Redis key (`doc:<id>`) plus a tiny metadata index
// (`docs:index`) for the sidebar. That keeps page loads O(1): listing reads
// only the index, opening a doc reads only that one key — large bodies never
// bloat the hot `state` path.
//
// No fallback, no silent errors: if Redis isn't configured we throw loudly,
// mirroring state.js. Validation happens at the boundary (parse on read/write);
// @upstash/redis auto-serializes objects on `.set()` and auto-parses on `.get()`.
// ============================================================================

const DocMetaSchema = z.object({
  id: z.string(),
  title: z.string().default("Untitled"),
  updatedAt: z.number().default(0),
});
const DocSchema = DocMetaSchema.extend({ body: z.string().default("") });
const IndexSchema = z.array(DocMetaSchema).default([]);

const KEY_INDEX = "docs:index";
const docKey = (id) => "doc:" + id;

function client() {
  if (!redis) {
    throw new Error(
      "Redis is not configured. Set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN " +
        "(or the KV_REST_API_* pair) in .env.local (dev) and the Vercel project env (prod). " +
        "Shared documents require it — there is no local fallback.",
    );
  }
  return redis;
}

export async function listDocs() {
  return IndexSchema.parse((await client().get(KEY_INDEX)) ?? []);
}

export async function getDoc(id) {
  const v = await client().get(docKey(id));
  return v == null ? null : DocSchema.parse(v);
}

export async function createDoc(id, title) {
  const now = Date.now();
  const doc = DocSchema.parse({ id, title: title || "Untitled", body: "", updatedAt: now });
  await client().set(docKey(id), doc);
  const index = await listDocs();
  if (!index.some((d) => d.id === id))
    await client().set(KEY_INDEX, [{ id, title: doc.title, updatedAt: now }, ...index]); // newest first
  return doc;
}

export async function updateDoc(id, patch) {
  const now = Date.now();
  const existing = (await getDoc(id)) ?? { id, title: "Untitled", body: "", updatedAt: now };
  const doc = DocSchema.parse({ ...existing, ...patch, id, updatedAt: now });
  await client().set(docKey(id), doc);
  const index = await listDocs();
  const meta = { id, title: doc.title, updatedAt: now };
  const next = index.some((d) => d.id === id)
    ? index.map((d) => (d.id === id ? meta : d))
    : [meta, ...index];
  await client().set(KEY_INDEX, next);
  return doc;
}

export async function deleteDoc(id) {
  await client().del(docKey(id));
  const index = await listDocs();
  await client().set(
    KEY_INDEX,
    index.filter((d) => d.id !== id),
  );
}
