// Scrape drink-SPECIFIC candidate photos from Bing Images (real market shots),
// dedup globally across drinks, download + validate, stage under /tmp/drinkstage.
// Output: staging dirs + /tmp/drinkstage/candidates.json (for contact sheets).
import { execSync } from 'node:child_process';
import { mkdirSync, rmSync, existsSync, writeFileSync, copyFileSync } from 'node:fs';

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';
const POOL = 14;      // candidates to stage per drink
const MINPX = 400;
const MAXPX = 640;
const STAGE = '/tmp/drinkstage';

// Specific queries per drink — NO generic fallback that bleeds across drinks.
const DRINKS = [
  { slug: 'basic-matcha-latte', name: 'Basic Matcha Latte', q: ['iced matcha latte', 'matcha latte glass', 'hot matcha latte cup'] },
  { slug: 'ichigo-matcha-latte', name: 'Ichigo Matcha Latte', q: ['strawberry matcha latte', 'iced strawberry matcha latte'] },
  { slug: 'seasalt-matcha-latte', name: 'Seasalt Matcha Latte', q: ['sea salt cream matcha latte', 'salted cream foam matcha', 'matcha latte cheese foam'] },
  { slug: 'shoyu-matcha', name: 'Shoyu Matcha', q: ['shoyu matcha latte', 'soy sauce matcha', 'brown sugar matcha latte'] },
  { slug: 'pistachio-matcha-latte', name: 'Pistachio Matcha Latte', q: ['pistachio matcha latte', 'pistachio cream matcha'] },
  { slug: 'sakura-matcha-latte', name: 'Sakura Matcha Latte', q: ['sakura matcha latte', 'cherry blossom matcha latte', 'pink sakura matcha drink'] },
  { slug: 'calamansi-matcha', name: 'Calamansi Matcha', q: ['calamansi matcha', 'matcha lemonade', 'citrus matcha tonic'] },
  { slug: 'iced-lychee-matcha', name: 'Iced Lychee Matcha', q: ['lychee matcha drink', 'iced lychee matcha latte'] },
  { slug: 'horchata-matcha', name: 'Horchata Matcha', q: ['horchata matcha latte', 'cinnamon matcha latte', 'matcha rice milk latte'] },
];

const unescape = (s) => s.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#39;/g, "'");
const sh = (c) => execSync(c, { stdio: ['ignore', 'pipe', 'ignore'] }).toString();
const sleep = (ms) => execSync(`sleep ${ms / 1000}`);

function bing(q, first) {
  const url = `https://www.bing.com/images/search?q=${encodeURIComponent(q)}&form=HDRSC2&first=${first}`;
  let html = '';
  try { html = sh(`curl -s --max-time 25 -A '${UA}' '${url}'`); } catch { return []; }
  const rows = [];
  for (const m of html.matchAll(/m="(\{[^"]*?&quot;murl&quot;[^"]*?\})"/g)) {
    try {
      const obj = JSON.parse(unescape(m[1]));
      if (obj.murl && /^https?:\/\//.test(obj.murl)) rows.push({ murl: obj.murl, purl: obj.purl || null });
    } catch {}
  }
  return rows;
}

rmSync(STAGE, { recursive: true, force: true });
mkdirSync(STAGE, { recursive: true });
const seenUrl = new Set();      // global URL dedup
const seenHash = new Set();     // global image-content dedup
const manifest = {};

for (const d of DRINKS) {
  const dir = `${STAGE}/${d.slug}`;
  mkdirSync(dir, { recursive: true });
  const kept = [];
  outer:
  for (const q of d.q) {
    for (const first of [1, 35]) {
      const rows = bing(q, first);
      for (const r of rows) {
        if (kept.length >= POOL) break outer;
        const u = r.murl;
        if (!/\.(jpe?g|png|webp)(\?|$)/i.test(u)) continue;
        if (u.includes('?')) continue;            // keep clean, directly-downloadable URLs
        const key = u.split('?')[0];
        if (seenUrl.has(key)) continue;
        seenUrl.add(key);
        const tmp = `/tmp/bdl.img`;
        try {
          execSync(`curl -sL --max-time 20 -A '${UA}' -o "${tmp}" "${u}"`, { stdio: 'ignore' });
          if (!existsSync(tmp)) continue;
          const info = sh(`sips -g pixelWidth -g pixelHeight "${tmp}" 2>/dev/null || true`);
          const w = +(info.match(/pixelWidth: (\d+)/)?.[1] ?? 0);
          const h = +(info.match(/pixelHeight: (\d+)/)?.[1] ?? 0);
          if (w < MINPX || h < MINPX) continue;
          const hash = sh(`md5 -q "${tmp}"`).trim();
          if (seenHash.has(hash)) continue;
          seenHash.add(hash);
          const n = kept.length + 1;
          const dest = `${dir}/${n}.jpg`;
          copyFileSync(tmp, dest);
          execSync(`sips -s format jpeg -s formatOptions 80 --resampleHeightWidthMax ${MAXPX} "${dest}" --out "${dest}"`, { stdio: 'ignore' });
          kept.push({ n, src: dest, url: u, source: r.purl, credit: new URL(u).host });
        } catch {}
      }
      sleep(900);
    }
  }
  manifest[d.slug] = { name: d.name, kept };
  console.error(`${d.slug}: ${kept.length} candidates`);
}
writeFileSync(`${STAGE}/candidates.json`, JSON.stringify(manifest, null, 2));
console.error('staged. manifest written.');
