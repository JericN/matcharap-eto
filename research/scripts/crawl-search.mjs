import { chromium } from 'playwright';
import fs from 'fs';

const queries = [
  'matcha fest Manila 2026',
  'matcha market Manila 2026',
  'matcha pop-up Manila 2026',
  'matcha bazaar Philippines 2026',
  'matcha festival Manila 2026',
  'matcha collective pop-up Philippines 2026',
  'call for merchants matcha fest 2026 Manila',
  'matcha fest BGC Makati Quezon City 2026',
  'soukpopup matcha fest schedule 2026',
  'moonlit market matcha fest 2026',
  'the modern market matcha hojicha collective 2026',
  'matcha pop up market Manila July August September October 2026',
  'matcha night market Manila 2026',
  'matcha fair Manila 2026',
  'manila market club matcha fest 2026',
  'matcha bazaar SM Ayala Glorietta Trinoma 2026',
  'matcha cafe pop up bazaar Philippines 2026 merchants',
  'matcha weekend market Metro Manila 2026',
];

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
const results = new Map();
const norm = u => { try { const x = new URL(u); return (x.origin + x.pathname).replace(/\/$/, ''); } catch { return u; } };

const browser = await chromium.launch({ headless: false, args: ['--disable-blink-features=AutomationControlled'] });
const ctx = await browser.newContext({ userAgent: UA, locale: 'en-US', viewport: { width: 1280, height: 950 } });
const page = await ctx.newPage();

async function brave(q) {
  await page.goto('https://search.brave.com/search?q=' + encodeURIComponent(q) + '&source=web', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.evaluate(() => window.scrollBy(0, 2500));
  await page.waitForTimeout(800);
  return await page.$$eval('#results > div, #results .snippet', els => els.map(el => {
    const a = el.querySelector('a[href^="http"]');
    if (!a) return null;
    const title = (el.querySelector('.title') || a).innerText.trim();
    const desc = (el.querySelector('.snippet-description, .snippet-content, [class*="description"]')?.innerText || '').trim();
    return { title, url: a.href, snippet: desc };
  }).filter(x => x && x.url && !x.url.includes('brave.com')));
}

async function google(q) {
  await page.goto('https://www.google.com/search?q=' + encodeURIComponent(q) + '&num=30&hl=en', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(1800);
  return await page.$$eval('a:has(h3)', els => els.map(a => ({
    title: a.querySelector('h3')?.innerText.trim() || '',
    url: a.href,
    snippet: ''
  })).filter(x => x.title && x.url.startsWith('http') && !x.url.includes('google.com')));
}

for (const q of queries) {
  for (const [name, fn] of [['brave', brave], ['google', google]]) {
    try {
      const items = await fn(q);
      let added = 0;
      for (const it of items) {
        const key = norm(it.url);
        if (!results.has(key)) { results.set(key, { ...it, query: q, engine: name }); added++; }
        else if (it.snippet && !results.get(key).snippet) results.get(key).snippet = it.snippet;
      }
      console.log(`[${name}] ${q} -> ${items.length} (new ${added})`);
    } catch (e) {
      console.log(`[${name} ERR] ${q}: ${e.message}`);
    }
  }
}

await browser.close();
const arr = [...results.values()];
fs.writeFileSync(new URL('./search-results.json', import.meta.url), JSON.stringify(arr, null, 2));
console.log('TOTAL UNIQUE URLS:', arr.length);
