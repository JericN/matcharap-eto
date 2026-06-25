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
// top-left badge — PH = competitive threat, Japan = why it made the cut. Opaque so it reads over anything.
const THREAT = {
  strong: { label: "🎯 Strong", color: "text-clay border-clay" },
  moderate: { label: "🎯 Moderate", color: "text-olive border-olive" },
  niche: { label: "🎯 Niche", color: "text-brown-soft border-brown-soft" },
};
const SPOTLIGHT = {
  unique: { label: "✨ Unique", color: "text-clay border-clay" },
  iconic: { label: "🌟 Iconic", color: "text-olive border-olive" },
};
const JPY_TO_PHP = 0.379; // ¥→₱ conversion rate (open.er-api, Jun 2026)

function fmtK(n) {
  if (n == null) return "—";
  return n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, "") + "K" : "" + n;
}

export default function CompetitorCard({ c, saved, onToggleSave }) {
  const isGiant = c.tier === "giant";
  const isJapan = c.tier === "japan";
  const toPeso = (n) => (isJapan ? Math.round(n * JPY_TO_PHP) : n); // Japan menu data is stored in ¥
  const menuTxt = c.menu.map((m) => `${m.i}${m.p ? ` ₱${toPeso(m.p)}` : ""}`).join(" · ");
  const prices = c.menu.map((m) => m.p).filter((p) => typeof p === "number").map(toPeso);
  const range = prices.length
    ? (Math.min(...prices) === Math.max(...prices) ? `₱${prices[0]}` : `₱${Math.min(...prices)}–${Math.max(...prices)}`)
    : "—";
  const stamp = isJapan ? (SPOTLIGHT[c.spotlight] || SPOTLIGHT.unique) : (THREAT[c.threat] || THREAT.moderate);
  const dotBg = isJapan ? "rgb(var(--c-clay))" : isGiant ? "rgb(var(--c-brown))" : RDOT[c.region];
  const leaf = isJapan
    ? { txt: "🇯🇵 Japan", cls: "text-clay" }
    : isGiant
    ? { txt: "🍃 Big Leaf", cls: "text-brown" }
    : { txt: "🌱 Little Leaf", cls: "text-olive" };
  // every top-row pill shares one colour (aligned), regardless of threat/health value
  const PILL = "font-mono text-[.55rem] font-medium uppercase tracking-[.06em] px-[9px] py-[3px] rounded-pill border-2 bg-cream-card text-forest border-forest";

  return (
    <article className="paper-card">
      {/* top bar: status tags + verified ✓ (left) · heart (right) */}
      <div className="flex items-start justify-between gap-2 px-3.5 pt-3 pb-1">
        <div className="flex flex-wrap items-center gap-[6px] min-w-0">
          <span className={PILL}>{stamp.label}</span>
          <span className={PILL}>{c.healthTxt}</span>
          <span className={`${PILL} shrink-0`} title="Verified · Jun 2026" aria-label="Verified June 2026">✓ Verified</span>
        </div>
        <button
          type="button"
          onClick={onToggleSave}
          aria-pressed={saved}
          aria-label={saved ? `Remove ${c.name} from saved` : `Save ${c.name}`}
          title={saved ? "Saved — click to remove" : "Save to your shortlist"}
          className={`shrink-0 w-8 h-8 grid place-items-center rounded-full border-2 border-clay transition hover:scale-110 ${saved ? "bg-clay text-cream-light" : "bg-cream-card text-clay"}`}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
            <path d="M12 21s-7-4.6-9.5-9C1 9 2.5 5.5 6 5.5c2 0 3.2 1.2 4 2.3.8-1.1 2-2.3 4-2.3 3.5 0 5 3.5 3.5 6.5C19 16.4 12 21 12 21z" />
          </svg>
        </button>
      </div>

      {/* header: rank + tier·format + name */}
      <div className="flex gap-[13px] items-center px-4 pt-1 pb-1.5">
        <span
          className="shrink-0 w-14 h-14 rounded-full border-[2.4px] border-forest grid place-items-center font-display font-bold text-[1.7rem] text-cream-light leading-none"
          style={{ background: dotBg }}
        >
          {c.rank}
        </span>
        <div className="flex-1 min-w-0">
          <div className="font-mono text-[.55rem] tracking-[.08em] uppercase text-clay mb-[3px]">
            <span className={`${leaf.cls} font-medium`}>{leaf.txt}</span> · {c.format}
          </div>
          <h3 className="font-doodle font-bold text-[1.18rem] text-forest leading-snug">{c.name}</h3>
        </div>
      </div>
      {/* short description — its own full-width line under the icon/name */}
      <p className="font-body text-[.82rem] text-olive-soft px-4 pb-2 leading-snug">{c.hook}</p>

      {/* price box */}
      <div className="perg-box">
        <span className="font-display font-bold text-[2rem] leading-[.9] text-cream-light whitespace-nowrap">
          {isJapan ? "≈" : ""}₱{toPeso(c.price)}
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

      {/* the claim */}
      <p className="text-[.82rem] text-olive px-4 mt-2.5 mb-2">🍵 {c.sourcing}</p>

      {/* description: location · menu · reach */}
      <div className="px-4 pb-3 flex flex-col gap-[5px]">
        <div className="meta-line normal-case tracking-normal items-start">📍 {c.area}</div>
        <div className="meta-line normal-case tracking-normal items-start">📋 {menuTxt}</div>
        <div className="meta-line normal-case tracking-normal items-start">
          {c.ig != null ? <>👥 IG {fmtK(c.ig)} · {c.scale}</> : <>🏠 {c.scale}</>}
        </div>
        {c.note && (
          <div className="meta-line normal-case tracking-normal items-start text-clay">⚠️ {c.note}</div>
        )}
      </div>

      {/* links — the only pill-shaped, tappable elements */}
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
