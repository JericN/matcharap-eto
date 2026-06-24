import { cache } from 'react';
import { get } from '@vercel/edge-config';
import { SiteDataSchema } from './schemas';
import { seed } from './seed';

// ============================================================================
// LAYER 1 — the only place that talks to the data source and validates it.
// Reads Vercel Edge Config when connected (EDGE_CONFIG env), else the local
// seed. Whatever the source, it is Zod-parsed here, so every consumer above
// this line receives guaranteed-valid data and never needs to re-check.
//
// React cache() memoizes for the duration of a single request (so the many
// repo.* reads in one render share one parse) while staying fresh across
// requests — the idiomatic Next.js approach. A module-level global would
// instead pin stale data for the life of the process (and break dev refresh).
// ============================================================================

async function loadRaw() {
  if (!process.env.EDGE_CONFIG) return seed;
  const fromEdge = await get('siteData');
  return fromEdge ?? seed;
}

export const getSiteData = cache(async () => SiteDataSchema.parse(await loadRaw()));
