// Gather commercial-license (modification-OK) photo candidates per drink from
// Openverse. Writes a candidate manifest to /tmp/drink-img-candidates.json.
const UA = 'matcharap-eto-research/1.0 (vendor research board; contact briarbear)';
const DRINKS = [
  { slug: 'basic-matcha-latte', name: 'Basic Matcha Latte', queries: ['matcha latte', 'iced matcha latte', 'matcha latte art', 'hot matcha latte'] },
  { slug: 'ichigo-matcha-latte', name: 'Ichigo Matcha Latte', queries: ['strawberry matcha latte', 'strawberry matcha', 'iced strawberry matcha', 'strawberry milk matcha'] },
  { slug: 'seasalt-matcha-latte', name: 'Seasalt Matcha Latte', queries: ['matcha latte foam', 'matcha latte cream', 'matcha cheese foam', 'matcha latte'] },
  { slug: 'shoyu-matcha', name: 'Shoyu Matcha', queries: ['matcha latte', 'iced matcha', 'matcha drink glass', 'matcha green tea latte'] },
  { slug: 'pistachio-matcha-latte', name: 'Pistachio Matcha Latte', queries: ['pistachio matcha', 'pistachio latte', 'matcha latte', 'nut matcha latte'] },
  { slug: 'sakura-matcha-latte', name: 'Sakura Matcha Latte', queries: ['matcha latte', 'iced matcha latte', 'pink matcha', 'matcha latte cafe'] },
  { slug: 'calamansi-matcha', name: 'Calamansi Matcha', queries: ['iced matcha', 'matcha lemonade', 'matcha citrus', 'matcha tonic'] },
  { slug: 'iced-lychee-matcha', name: 'Iced Lychee Matcha', queries: ['iced matcha', 'lychee matcha', 'matcha drink', 'matcha soda'] },
  { slug: 'horchata-matcha', name: 'Horchata Matcha', queries: ['iced matcha latte', 'matcha latte', 'matcha oat milk', 'matcha cinnamon'] },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function search(q) {
  // commercial,modification => BY / BY-SA / CC0 / PDM only (excludes NC* and ND),
  // so resizing into thumbnails is licence-compliant.
  const url = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(q)}&page_size=16&license_type=commercial,modification&mature=false`;
  const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
  if (!res.ok) { console.error(`  ! ${q}: HTTP ${res.status}`); return []; }
  const data = await res.json();
  return (data.results ?? []).map((r) => ({
    url: r.url,
    source: r.foreign_landing_url ?? null,
    credit: [r.creator, (r.license || '').toUpperCase(), r.source].filter(Boolean).join(' · '),
    title: r.title ?? '',
  })).filter((x) => x.url && /^https:\/\//.test(x.url));
}

const out = {};
for (const d of DRINKS) {
  const seen = new Set();
  const cands = [];
  for (const q of d.queries) {
    const rows = await search(q);
    for (const r of rows) { if (!seen.has(r.url)) { seen.add(r.url); cands.push(r); } }
    await sleep(800);
    if (cands.length >= 24) break;
  }
  out[d.slug] = { name: d.name, candidates: cands };
  console.error(`${d.slug}: ${cands.length} candidates`);
}
console.log(JSON.stringify(out, null, 2));
