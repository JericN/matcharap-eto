'use client';
import { useState } from 'react';
import { MATCHA_OPTS, MILK_OPTS, EXTRAS, DRINKS, INGREDIENTS } from '@/lib/data';

export default function Calculator() {
  const [mi, setMi] = useState(1);
  const [ki, setKi] = useState(1);
  const [dose, setDose] = useState(3);
  const [srps, setSrps] = useState(() => DRINKS.map(d => d.srp));

  const mPerG = MATCHA_OPTS[mi].g;
  const mCost = Math.round(mPerG * dose);
  const kPerMl = MILK_OPTS[ki].ml;

  return (
    <>
      <div className="matchapick">
        <div className="mp-row">
          <div className="field">
            <label>🍵 Matcha powder</label>
            <select value={mi} onChange={e => setMi(+e.target.value)}>
              {MATCHA_OPTS.map((o, i) => (
                <option key={i} value={i}>{o.l} — ₱{o.g.toFixed(2)}/g</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>🥛 Milk</label>
            <select value={ki} onChange={e => setKi(+e.target.value)}>
              {MILK_OPTS.map((o, i) => (
                <option key={i} value={i}>{o.l}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>⚖️ Matcha dose / cup <span className="rangeval">{dose} g</span></label>
            <input type="range" min="1.5" max="6" step="0.5" value={dose} onChange={e => setDose(+e.target.value)} />
          </div>
        </div>
        <div className="mp-read">
          🍵 Matcha <b>₱{mCost}</b>/cup ({dose}g × ₱{mPerG.toFixed(2)}/g) · 🥛 Milk <b>₱{Math.round(180 * kPerMl)}</b>/180ml · 🥤 cup+ice+sugar <b>₱{EXTRAS}</b>
        </div>
      </div>

      <div className="ingredients">
        <h3>🧾 Ingredients used &amp; price sources</h3>
        <div className="ihint">Verified June 2026 — tap “price ↗” to open each source. Prices vary by retailer &amp; quantity.</div>
        <div className="inggrid">
          {INGREDIENTS.map((x, i) => (
            <div className="ing" key={i}>
              <div className="il">{x.il}</div>
              <div className="iv">{x.iv}</div>
              <a href={x.url} target="_blank" rel="noopener">price ↗</a>
            </div>
          ))}
        </div>
      </div>

      <div className="cardgrid" style={{ marginTop: 18 }}>
        {DRINKS.map((d, idx) => {
          const milkCost = d.milkMl * kPerMl;
          const cogs = Math.round(mCost + milkCost + d.fl + EXTRAS);
          const srp = srps[idx];
          const profit = srp - cogs;
          const margin = srp > 0 ? Math.round(profit / srp * 100) : 0;
          const word = margin >= 65 ? 'healthy ✓' : (margin >= 45 ? 'ok' : 'tight');
          return (
            <article className="drink-card" key={d.name}>
              <div className="drink-head">
                <svg width="42" height="42" viewBox="0 0 64 64" aria-hidden="true"><use href="#mm-glass" /></svg>
                <div>
                  <h3 className="drink-name">{d.name}</h3>
                  <span className="drink-sub">{d.note}</span>
                </div>
              </div>
              <div className="cogs-row">
                <div className="cogs-cell">
                  <span className="k">COGS</span>
                  <span className="v">₱{cogs}</span>
                </div>
                <div className="cogs-cell srp-cell">
                  <span className="k">SRP ✎</span>
                  <input
                    className="srp-input"
                    type="number"
                    min="0"
                    step="5"
                    value={srp}
                    inputMode="numeric"
                    aria-label={'Selling price for ' + d.name}
                    onChange={e => {
                      const v = +e.target.value || 0;
                      setSrps(s => { const n = [...s]; n[idx] = v; return n; });
                    }}
                  />
                </div>
                <div className="cogs-cell hl">
                  <span className="k">Profit</span>
                  <span className="v">₱{profit}</span>
                </div>
              </div>
              <div className="margin-lab">
                <span>gross margin · <b className="margin-v">{margin}%</b></span>
                <span>{word}</span>
              </div>
              <div className="margin-bar">
                <div className="margin-fill" style={{ width: Math.max(0, margin) + '%' }}></div>
              </div>
              <div className="bd">
                🧮 matcha ₱{mCost} + milk ₱{Math.round(milkCost)}{d.fl > 0 ? ' + ' + d.flavor + ' ₱' + d.fl : ''} + cup/ice/sugar ₱{EXTRAS} = <b>₱{cogs}</b> · type your price in SRP ✎
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
