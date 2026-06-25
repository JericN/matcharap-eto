// Gather drink-SPECIFIC candidate photos from the DuckDuckGo image API (good
// relevance + titles to pre-filter). Title must contain "matcha" (kills the
// nuts/anime/alphabet/ad junk). Global dedup by URL + content hash. Download +
// validate, stage under /tmp/drinkstage, write candidates.json.
import { execSync } from 'node:child_process';
import { mkdirSync, rmSync, existsSync, writeFileSync, copyFileSync, readFileSync } from 'node:fs';

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';
const POOL = 12;
const MINPX = 400, MAXPX = 640;
const STAGE = '/tmp/drinkstage';

// Each query is specific; `must` = extra keyword the title should contain (flavor),
// so e.g. a plain matcha doesn't land under Pistachio. null = just needs "matcha".
const DRINKS = [
  { slug: 'basic-matcha-latte', name: 'Basic Matcha Latte', q: ['iced matcha latte', 'matcha latte recipe'], must: null },
  { slug: 'ichigo-matcha-latte', name: 'Ichigo Matcha Latte', q: ['strawberry matcha latte'], must: 'strawberry' },
  { slug: 'seasalt-matcha-latte', name: 'Seasalt Matcha Latte', q: ['sea salt matcha latte', 'salted cream matcha latte'], must: 'salt' },
  { slug: 'shoyu-matcha', name: 'Shoyu Matcha', q: ['shoyu matcha latte', 'soy sauce matcha latte', 'brown sugar matcha latte'], must: null },
  { slug: 'pistachio-matcha-latte', name: 'Pistachio Matcha Latte', q: ['pistachio matcha latte'], must: 'pistachio' },
  { slug: 'sakura-matcha-latte', name: 'Sakura Matcha Latte', q: ['sakura matcha latte', 'cherry blossom matcha latte'], must: null },
  { slug: 'calamansi-matcha', name: 'Calamansi Matcha', q: ['calamansi matcha drink', 'matcha lemonade', 'yuzu matcha latte'], must: null },
  { slug: 'iced-lychee-matcha', name: 'Iced Lychee Matcha', q: ['lychee matcha latte', 'iced lychee matcha'], must: 'lychee' },
  { slug: 'horchata-matcha', name: 'Horchata Matcha', q: ['horchata matcha latte', 'cinnamon matcha latte'], must: null },
];

const sh = (c) => execSync(c, { stdio: ['ignore', 'pipe', 'ignore'] }).toString();
const sleep = (s) => execSync(`sleep ${s}`);
const enc = (s) => encodeURIComponent(s);

function ddg(q) {
  let vqd = '';
  try {
    const html = sh(`curl -s --max-time 20 -A '${UA}' 'https://duckduckgo.com/?q=${enc(q)}&iax=images&ia=images'`);
    vqd = (html.match(/vqd="?([0-9-]{10,})"?/) || [])[1] || '';
  } catch {}
  if (!vqd) return [];
  try {
    const json = sh(`curl -s --max-time 20 -A '${UA}' -H 'Referer: https://duckduckgo.com/' 'https://duckduckgo.com/i.js?l=us-en&o=json&q=${enc(q)}&vqd=${vqd}&p=1'`);
    return (JSON.parse(json).results || []).map((r) => ({ image: r.image, title: r.title || '', source: r.url || null }));
  } catch { return []; }
}

rmSync(STAGE, { recursive: true, force: true });
mkdirSync(STAGE, { recursive: true });
const seenUrl = new Set(), seenHash = new Set();
const manifest = {};

for (const d of DRINKS) {
  const dir = `${STAGE}/${d.slug}`;
  mkdirSync(dir, { recursive: true });
  const kept = [];
  outer:
  for (const q of d.q) {
    const rows = ddg(q);
    for (const r of rows) {
      if (kept.length >= POOL) break outer;
      const u = r.image, t = r.title.toLowerCase();
      if (!u || !/^https?:\/\//.test(u)) continue;
      if (!/\.(jpe?g|png|webp)(\?|$)/i.test(u) || u.includes('?')) continue;
      if (!t.includes('matcha')) continue;                       // baseline relevance gate
      if (d.must && !t.includes(d.must)) continue;               // flavor gate
      if (seenUrl.has(u)) continue;
      seenUrl.add(u);
      const tmp = '/tmp/ddl.img';
      try {
        execSync(`curl -sL --max-time 18 -A '${UA}' -o "${tmp}" "${u}"`, { stdio: 'ignore' });
        if (!existsSync(tmp)) continue;
        const info = sh(`sips -g pixelWidth -g pixelHeight "${tmp}" 2>/dev/null || true`);
        const w = +(info.match(/pixelWidth: (\d+)/)?.[1] ?? 0), h = +(info.match(/pixelHeight: (\d+)/)?.[1] ?? 0);
        if (w < MINPX || h < MINPX) continue;
        const hash = sh(`md5 -q "${tmp}"`).trim();
        if (seenHash.has(hash)) continue;
        seenHash.add(hash);
        const n = kept.length + 1, dest = `${dir}/${n}.jpg`;
        copyFileSync(tmp, dest);
        execSync(`sips -s format jpeg -s formatOptions 80 --resampleHeightWidthMax ${MAXPX} "${dest}" --out "${dest}"`, { stdio: 'ignore' });
        kept.push({ n, src: dest, url: u, source: r.source, credit: new URL(u).host, title: r.title.slice(0, 70) });
      } catch {}
    }
    sleep(2);
  }
  manifest[d.slug] = { name: d.name, kept };
  console.error(`${d.slug}: ${kept.length}`);
}
writeFileSync(`${STAGE}/candidates.json`, JSON.stringify(manifest, null, 2));
console.error('done');
