'use client';
import { useEffect, useState } from 'react';

// Persists a value to localStorage. SSR-safe: starts from `initial` (matching
// the server render), then hydrates from storage after mount. Used for per-user
// state (saved prices, favourites) — distinct from shared content in config.
export function useLocalStorage(key, initial) {
  const [value, setValue] = useState(initial);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(key);
      if (stored != null) setValue(JSON.parse(stored));
    } catch {}
    setReady(true);
  }, [key]);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value, ready]);

  return [value, setValue];
}
