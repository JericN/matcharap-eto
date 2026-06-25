import { cache } from "react";
import { redis } from "./redis";
import { StateSchema } from "./schemas";

// ============================================================================
// SHARED STATE — ONE global record for everyone (NOT per-user). Stored under
// the Redis `state` key via Upstash. This is the data that must sync to every
// user: saved powders/drinks, SRP + price overrides, drink↔ingredient
// attachments, user-added ingredients, and packaging/additional cost overrides.
//
// No fallback, no silent errors: if Redis isn't configured we throw loudly.
// Validation happens once here (StateSchema, every field defaulted); every
// consumer above this boundary trusts the result and never re-checks.
// ============================================================================

const KEY = "state";

function client() {
  if (!redis) {
    throw new Error(
      "Redis is not configured. Set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN " +
        "(or the KV_REST_API_* pair) in .env.local (dev) and the Vercel project env (prod). " +
        "Shared state requires it — there is no local fallback.",
    );
  }
  return redis;
}

// Per-request memoized: one read per render shared by all repo.* calls; fresh
// on the next request so writes show up immediately.
export const getState = cache(async () => {
  const value = await client().get(KEY); // @upstash/redis auto-parses stored JSON
  return StateSchema.parse(value ?? {}); // empty/fresh store → all fields default
});

export async function writeState(next) {
  const value = StateSchema.parse(next);
  await client().set(KEY, value); // @upstash/redis JSON-serializes objects
  return value;
}
