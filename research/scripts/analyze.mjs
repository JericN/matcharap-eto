import fs from 'fs';
const data = JSON.parse(fs.readFileSync(new URL('./search-results.json', import.meta.url)));

const EVENT = /(matcha|hojicha)/i;
const KIND = /(fest|festival|market|pop[\s-]?up|bazaar|fair|collective|expo|merchants?)/i;
const MONTH = /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*\d{1,2}(\s*[-–to]+\s*\d{1,2})?,?\s*20\d{2}/i;
const MONTHG = /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*\d{1,2}(\s*[-–to]+\s*\d{1,2})?,?\s*20\d{2}/gi;

const dom = u => { try { return new URL(u).hostname.replace(/^www\./,''); } catch { return '?'; } };

const cand = data.filter(d => {
  const t = (d.title + ' ' + d.snippet);
  return EVENT.test(t) && KIND.test(t);
});

// group by domain
const byDom = {};
for (const d of cand) { (byDom[dom(d.url)] ||= []).push(d); }

console.log('=== TOTAL candidates:', cand.length, 'of', data.length, '===');
console.log('=== by domain ===');
for (const [k,v] of Object.entries(byDom).sort((a,b)=>b[1].length-a[1].length)) console.log(`${v.length}\t${k}`);

console.log('\n=== candidates with DATE hits ===');
let n=0;
for (const d of cand) {
  const text = d.title + ' || ' + d.snippet;
  const dates = [...text.matchAll(MONTHG)].map(m=>m[0]);
  if (dates.length) {
    n++;
    console.log(`\n#${n} [${dom(d.url)}] ${d.title}`);
    console.log(`   DATES: ${[...new Set(dates)].join(' | ')}`);
    console.log(`   ${d.snippet.slice(0,200)}`);
    console.log(`   ${d.url}`);
  }
}
console.log(`\n(${n} candidates carried explicit dates in their snippet)`);
fs.writeFileSync(new URL('./candidates.json', import.meta.url), JSON.stringify(cand, null, 2));
