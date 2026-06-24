// region swatch colours reuse the powder-category greens (themeable via :root --c-cat-*)
const RDOT = { north: "rgb(var(--c-cat-ph))", central: "rgb(var(--c-cat-jp))", south: "rgb(var(--c-cat-import))" };
const BAND = { budget: "₱", mid: "₱₱", premium: "₱₱₱" };
const LINK_META = {
  web: { icon: "🌐", label: "Website" },
  ig: { icon: "📷", label: "Instagram" },
  fb: { icon: "📘", label: "Facebook" },
  tiktok: { icon: "🎵", label: "TikTok" },
  maps: { icon: "🗺️", label: "Reviews" },
  order: { icon: "🛒", label: "Order" },
};
// competitive threat tier → corner stamp (reuses .stamp + variants from globals.css)
const THREAT = {
  strong: { cls: "stamp", label: "🎯 Strong" },
  moderate: { cls: "stamp stamp--soon", label: "🎯 Moderate" },
  niche: { cls: "stamp stamp--ended", label: "🎯 Niche" },
};

function fmtK(n) {
  if (n == null) return "—";
  return n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, "") + "K" : "" + n;
}

export default function CompetitorCard({ c }) {
  const menuTxt = c.menu.map((m) => `${m.i}${m.p ? ` ₱${m.p}` : ""}`).join(" · ");
  const prices = c.menu.map((m) => m.p).filter((p) => typeof p === "number");
  const range = prices.length
    ? (Math.min(...prices) === Math.max(...prices)
        ? `₱${prices[0]}`
        : `₱${Math.min(...prices)}–${Math.max(...prices)}`)
    : "—";
  const threat = THREAT[c.threat] || THREAT.moderate;
  const healthCls =
    c.health === "warn"
      ? "text-clay border-clay bg-clay/10"
      : c.health === "wait"
      ? "text-brown-soft border-brown-soft"
      : "text-olive border-olive bg-olive/10";

  return (
    <article className={`paper-card${c.star ? " is-star" : ""}`}>
      <span className={threat.cls}>{threat.label}</span>

      <div className="flex gap-[13px] items-start px-4 pt-4 pb-2.5">
        <span
          className="shrink-0 w-14 h-14 rounded-full border-[2.4px] border-forest grid place-items-center font-display font-bold text-[1.7rem] text-cream-light leading-none"
          style={{ background: RDOT[c.region] }}
        >
          {c.rank}
        </span>
        <div className="flex-1 min-w-0 pr-[72px]">
          <div className="font-mono text-[.55rem] tracking-[.08em] uppercase text-clay mb-[3px]">
            {c.format} · 📍 {c.area}
          </div>
          <h3 className="font-doodle font-bold text-[1.18rem] text-forest leading-snug">{c.name}</h3>
          <div className="font-body text-[.74rem] text-olive-soft mt-1 leading-snug">{c.hook}</div>
        </div>
      </div>

      <div className="perg-box">
        <span className="font-display font-bold text-[2rem] leading-[.9] text-cream-light whitespace-nowrap">
          ₱{c.price}
        </span>
        <span className="flex flex-col gap-px min-w-0">
          <span className="font-mono text-[.5rem] tracking-[.14em] uppercase text-matcha-bright truncate">
            {BAND[c.band]} · {c.sig}
          </span>
          <span className="font-mono text-[.58rem] tracking-[.02em] text-onforest-soft">
            ⭐ {c.rating} ({c.reviews}) · {c.open ? "open ✓" : "closed"}
          </span>
          <span className="font-mono text-[.55rem] tracking-[.02em] text-onforest-mut">
            menu {range} · 📅 {c.opened}
          </span>
        </span>
      </div>

      <p className="text-[.82rem] text-olive px-4 mb-2">🍵 {c.sourcing}</p>

      <div className="px-4 pb-2.5 flex flex-col gap-[5px]">
        <div className="meta-line normal-case tracking-normal items-start">📋 {menuTxt}</div>
        <div className="meta-line normal-case tracking-normal items-start">
          👥 IG {fmtK(c.ig)} · {c.scale}
        </div>
        {c.note && (
          <div className="meta-line normal-case tracking-normal items-start text-clay">⚠️ {c.note}</div>
        )}
      </div>

      <p className="mx-4 mb-3 px-3 py-2 text-[.78rem] text-forest leading-snug bg-matcha-bright/15 border-l-[3px] border-matcha rounded-[3px_9px_9px_3px]">
        <span className="font-mono text-[.54rem] uppercase tracking-[.1em] text-clay">📌 the read · </span>
        {c.takeaway}
      </p>

      <div className="px-4 pb-2 mt-auto flex items-center justify-between gap-2">
        <span className={`font-mono text-[.55rem] tracking-[.06em] uppercase px-[9px] py-[4px] rounded-pill border-2 ${healthCls}`}>
          {c.healthTxt}
        </span>
        <span className="font-mono text-[.52rem] tracking-[.08em] uppercase text-olive-soft">✓ Verified Jun 2026</span>
      </div>

      <div className="px-4 pb-4 flex flex-wrap gap-[6px]">
        {c.links.map((l) => {
          const meta = LINK_META[l.kind];
          return (
            <a
              key={l.kind + l.url}
              href={l.url}
              target="_blank"
              rel="noopener"
              title={`${meta.label} — opens in a new tab`}
              className="font-mono text-[.56rem] tracking-[.04em] uppercase text-forest bg-cream-light border-2 border-forest rounded-pill px-[9px] py-[5px] no-underline inline-flex items-center gap-[4px] transition-transform hover:-translate-y-px hover:bg-forest hover:text-cream-light"
            >
              <span aria-hidden="true">{meta.icon}</span>
              {meta.label}
            </a>
          );
        })}
      </div>
    </article>
  );
}
