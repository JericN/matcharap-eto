import { chromium } from 'playwright';

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

// ---------- PART 1: Shopify JSON feeds (exact) ----------
const feeds = [
  ['Little Retail — matcha', 'https://littleretailph.com/products/pure-unsweetened-matcha-powder.js'],
  ['JapanMatcha — matcha', 'https://www.japanmatcha.ph/products/matcha-from-japan-ceremonial-and-culinary-grade-uji.js'],
  ['Packaging Lab — cups/lids', 'https://packaginglabph.com/products/elegant-pet-plastic-cup.js'],
];
console.log('===== PART 1: Shopify feeds (re-check) =====');
for (const [name, url] of feeds) {
  try {
    const r = await fetch(url, { headers: { 'User-Agent': UA } });
    if (!r.ok) { console.log(`❌ ${name} HTTP ${r.status}`); continue; }
    const j = await r.json();
    const avail = (j.variants||[]).filter(v=>v.available).map(v=>`${v.title} ₱${(v.price/100).toFixed(2)}`);
    console.log(`✅ ${name}: ${avail.slice(0,6).join(' | ')}`);
  } catch(e){ console.log(`⚠️ ${name} ${e.message}`); }
}

// ---------- PART 2: headful price scrape for non-Shopify ----------
const pages = [
  ['Oatside 1L (Landers)', 'https://www.landers.ph/dairy-chilled/oatside-barista-blend-oat-milk-1-l-145862-40293'],
  ['Magnolia Fresh Milk 1L (SM)', 'https://smmarkets.ph/10123686-magnolia-fresh-milk-1l.html'],
  ['Monin Lychee 700ml (Manila Wine)', 'https://manila-wine.com/le-sirop-de-monin-lychee-700ml-%7C-french-flavored-syrup'],
  ['Emborg Whipping Cream 1L (Shopee)', 'https://shopee.ph/Emborg-UHT-Whipping-Cream-1L-i.144900856.5540159124'],
];
console.log('\n===== PART 2: headful page scrape (₱ amounts found) =====');
const browser = await chromium.launch({ headless: false, args: ['--disable-blink-features=AutomationControlled'] });
const ctx = await browser.newContext({ userAgent: UA, locale: 'en-US', viewport: { width: 1280, height: 950 } });
const page = await ctx.newPage();
for (const [name, url] of pages) {
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3500);
    const body = await page.evaluate(() => document.body ? document.body.innerText : '');
    const prices = [...new Set((body.match(/₱\s?[\d,]+(?:\.\d{2})?|P\s?[\d,]+\.\d{2}|PHP\s?[\d,]+(?:\.\d{2})?/g) || []))].slice(0, 8);
    const title = await page.title();
    console.log(`\n• ${name}\n   title: ${title.slice(0,70)}\n   prices: ${prices.join('  ') || '(none — JS/anti-bot wall)'}`);
  } catch(e){ console.log(`\n• ${name} — ERROR ${e.message}`); }
}
await browser.close();
console.log('\nDONE');
