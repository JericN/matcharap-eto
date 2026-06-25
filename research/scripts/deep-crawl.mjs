import { chromium } from 'playwright';
import fs from 'fs';

const cand = JSON.parse(fs.readFileSync(new URL('./candidates.json', import.meta.url)));
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
const dom = u => { try { return new URL(u).hostname.replace(/^www\./,''); } catch { return '?'; } };

const browser = await chromium.launch({ headless: false, args: ['--disable-blink-features=AutomationControlled'] });
const ctx = await browser.newContext({ userAgent: UA, locale: 'en-US', viewport: { width: 1280, height: 950 } });
const page = await ctx.newPage();

const out = [];
let i = 0;
for (const c of cand) {
  i++;
  const rec = { url: c.url, domain: dom(c.url), seedTitle: c.title };
  try {
    await page.goto(c.url, { waitUntil: 'domcontentloaded', timeout: 25000 });
    await page.waitForTimeout(1500);
    const info = await page.evaluate(() => {
      const meta = n => document.querySelector(`meta[property="${n}"], meta[name="${n}"]`)?.content || '';
      const article = document.querySelector('article')?.innerText || '';
      const body = document.body ? document.body.innerText : '';
      return {
        title: document.title,
        ogTitle: meta('og:title'),
        ogDesc: meta('og:description'),
        text: (article || body).replace(/\s+/g, ' ').trim().slice(0, 2500),
      };
    });
    rec.title = info.title;
    rec.ogTitle = info.ogTitle;
    rec.ogDesc = info.ogDesc;
    rec.text = info.text;
    rec.finalUrl = page.url();
  } catch (e) {
    rec.error = e.message;
  }
  out.push(rec);
  console.log(`${i}/${cand.length} [${rec.domain}] ${(rec.ogDesc||rec.title||rec.error||'').slice(0,90)}`);
}

await browser.close();
fs.writeFileSync(new URL('./events-raw.json', import.meta.url), JSON.stringify(out, null, 2));
console.log('SAVED', out.length);
