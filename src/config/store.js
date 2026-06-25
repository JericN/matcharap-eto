import { cache } from "react";
import { SiteDataSchema } from "./schemas";
import { seed } from "./seed";

// ============================================================================
// LAYER 1 — the only place that produces the validated content blob.
// Content (events, powders, competitors, …) lives in seed.js, the in-repo
// single source of truth, and is Zod-parsed here so every consumer above this
// line receives guaranteed-valid data and never needs to re-check.
//
// (Content is read-heavy and rarely changes, so it ships in the bundle rather
// than a remote store — edits go through seed.js + a redeploy. The mutable bits
// that DO sync live — saved powders + SRP — are in Redis; see state.js.)
//
// React cache() memoizes for one request (so the many repo.* reads in a single
// render share one parse) while staying fresh across requests.
// ============================================================================

export const getSiteData = cache(async () => SiteDataSchema.parse(seed));
