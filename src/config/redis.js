import { Redis } from '@upstash/redis';

// ============================================================================
// Upstash Redis client — the shared store for mutable state (hearts + SRP).
// Accepts EITHER the Upstash-native or the Vercel-KV-style REST env vars, so it
// works however the store was provisioned (Upstash console or the Vercel
// Marketplace "Upstash for Redis" integration). Free tier: 256 MB / 500K cmds.
//
// `redis` is null only when unconfigured. There is NO local-file fallback:
// state.js throws loudly if it ever gets null, so a missing/typo'd credential
// fails fast instead of silently diverging per-machine. Set the env vars below
// in web/.env.local for dev and in the Vercel project env for prod.
// ============================================================================

const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

export const redis = url && token ? new Redis({ url, token }) : null;
