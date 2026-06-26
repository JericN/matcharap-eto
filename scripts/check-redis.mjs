// Smoke-test the Upstash Redis wiring without deploying.
//   npm run check:redis        (loads .env.local automatically)
// Proves the REST creds work end-to-end (set → get → del round-trip) and prints
// the current shared `state` key. Exit 0 = wired correctly.

import { Redis } from "@upstash/redis";

const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

if (!url || !token) {
  console.error("✗ No Redis REST creds found in env.");
  console.error(
    "  Set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN (or the KV_* pair) in .env.local,",
  );
  console.error("  then re-run `npm run check:redis`.");
  process.exit(1);
}

const redis = new Redis({ url, token });
const PROBE_KEY = "__matcha_smoketest__";
const probe = { srp: {}, saved: ["__smoketest__"] };

try {
  await redis.set(PROBE_KEY, probe);
  const back = await redis.get(PROBE_KEY);
  await redis.del(PROBE_KEY);
  const ok = JSON.stringify(back) === JSON.stringify(probe);
  if (!ok) {
    console.error("❌ Round-trip mismatch — got:", JSON.stringify(back));
    process.exit(1);
  }
  console.log("✅ Redis round-trip OK (set → get → del). Remote saving is wired.");
  const state = await redis.get("state");
  console.log(
    "   Current shared `state` key:",
    state ? JSON.stringify(state) : "(empty → defaults to {srp:{},saved:[]})",
  );
  process.exit(0);
} catch (e) {
  console.error("❌ Redis call failed:", e.message);
  console.error("   Double-check the REST URL/token are correct and the database is active.");
  process.exit(1);
}
