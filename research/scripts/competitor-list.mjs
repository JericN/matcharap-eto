// One-off: dump the competitor list (name, slug, links) as JSON for the
// logo-discovery workflow + the download step.
import { seed } from '../src/config/seed.js';

const slug = (s) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // strip combining accents
    .replace(/×/g, 'x')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const list = seed.competitors.map((c) => ({
  name: c.name,
  slug: slug(c.name),
  tier: c.tier ?? 'general',
  rank: c.rank,
  area: c.area,
  links: Object.fromEntries(c.links.map((l) => [l.kind, l.url])),
}));

console.log(JSON.stringify(list, null, 2));
