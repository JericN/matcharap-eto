// Verify exact PHP prices via Shopify product JSON feeds (/products/<handle>.js)
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

const targets = [
  ['Little Retail — matcha', 'https://littleretailph.com/products/pure-unsweetened-matcha-powder.js'],
  ['JapanMatcha — culinary/ceremonial', 'https://www.japanmatcha.ph/products/matcha-from-japan-ceremonial-and-culinary-grade-uji.js'],
  ['Superfood Grocer — matcha (a)', 'https://www.thesuperfoodgrocer.com/products/organic-matcha-powder-manila-philippines.js'],
  ['Superfood Grocer — matcha (b)', 'https://www.thesuperfoodgrocer.com/products/organic-matcha-powder.js'],
  ['Equilibrium — matcha', 'https://equilibrium.com.ph/products/matcha-green-tea-powder.js'],
  ['Packaging Lab — PET cup', 'https://packaginglabph.com/products/elegant-pet-plastic-cup.js'],
  ['Vegan Grocer — Oatside', 'https://thevegangrocer.com.ph/products/oatside-barista-blend.js'],
  ['Manila Wine — Monin Lychee', 'https://manila-wine.com/products/le-sirop-de-monin-lychee-700ml.js'],
];

for (const [name, url] of targets) {
  try {
    const r = await fetch(url, { headers: { 'User-Agent': UA, 'Accept': 'application/json' } });
    if (!r.ok) { console.log(`\n❌ ${name} — HTTP ${r.status}\n   ${url}`); continue; }
    const j = await r.json();
    console.log(`\n✅ ${name}  [${url}]`);
    console.log(`   TITLE: ${j.title}`);
    (j.variants || []).forEach(v => console.log(`   - ${v.title}: ₱${(v.price/100).toFixed(2)}${v.available?'':' (sold out)'}`));
  } catch (e) {
    console.log(`\n⚠️  ${name} — ${e.message}\n   ${url}`);
  }
}
