import fs from 'fs';
const raw = JSON.parse(fs.readFileSync(new URL('./events-raw.json', import.meta.url)));

const MONTHG = /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*\d{1,2}\s*(?:[-–—]\s*\d{1,2})?,?\s*20\d{2}/gi;
const VENUE = /(BGC|Bonifacio|Burgos Park|Forbes ?Town|Makati|Poblacion|Glorietta|Greenbelt|Trinoma|TriNoma|Eastwood|Alabang|Uptown|SM (?:Mall of Asia|MOA|Megamall|North|Aura|Gensan|City)|Megamall|The Podium|Estancia|Ayala|Quezon City|QC|Marikina|San Juan|Pasig|Pasay|Mandaluyong|Ortigas|Arca South|Taguig|Corner House|The Fun Roof|Assembly Grounds|Gimenez|Travel Club|Cubao|Katipunan|Antipolo|Lima Estate)/gi;

const recs = raw.map(r => {
  const blob = [r.ogTitle, r.ogDesc, r.seedTitle, r.text].filter(Boolean).join('  ||  ');
  const dates = [...new Set([...blob.matchAll(MONTHG)].map(m => m[0].replace(/\s+/g,' ').trim()))];
  const venues = [...new Set([...blob.matchAll(VENUE)].map(m => m[0]))];
  return { domain: r.domain, dates, venues, desc: (r.ogDesc || r.seedTitle || '').slice(0,160), url: r.url, err: r.error ? 'ERR' : '' };
});

// Upcoming filter: any date in/after July 2026, or June 2026 (current month) future-ish
const monthIdx = {jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11};
const TODAY = new Date('2026-06-23');
function isUpcoming(d) {
  const m = d.match(/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*(\d{1,2})/i);
  const y = d.match(/(20\d{2})/);
  if (!m || !y) return false;
  const end = new Date(Number(y[1]), monthIdx[m[1].toLowerCase()], Number(m[2]));
  return end >= TODAY;
}

console.log('===== ALL records with dates =====');
let withDates = recs.filter(r => r.dates.length);
for (const r of withDates) {
  const up = r.dates.some(isUpcoming) ? '🟢UP' : '⚪past';
  console.log(`${up} [${r.domain}] ${r.dates.join(' | ')}  @ ${r.venues.join(', ')}`);
  console.log(`     ${r.desc}`);
  console.log(`     ${r.url}`);
}
console.log(`\nRecords with dates: ${withDates.length}/${recs.length}`);
console.log('Upcoming (>= 2026-06-23):', withDates.filter(r=>r.dates.some(isUpcoming)).length);
console.log('Failed/empty:', recs.filter(r=>r.err).length);

console.log('\n===== records WITHOUT dates (need revisit) =====');
for (const r of recs.filter(r => !r.dates.length)) console.log(`[${r.domain}]${r.err?' '+r.err:''} ${r.desc.slice(0,80)} -- ${r.url}`);
