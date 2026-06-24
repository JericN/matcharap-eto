'use client';
import { useState } from 'react';
import { POWDERS, PDOT, POWDER_IMG } from '@/lib/data';

export default function PowderGrid(){
  const [f,setF]=useState('all');
  const filters=[
    {l:'All',v:'all'},
    {l:'🇵🇭 PH Homegrown',v:'ph'},
    {l:'🇯🇵 Japanese · in PH',v:'jp'},
    {l:'🌏 Imported',v:'import'},
  ];
  return (
    <>
      <div className="chiprow">
        {filters.map(b=>(
          <button key={b.v} className={f===b.v?'pfilter active':'pfilter'} onClick={()=>setF(b.v)}>{b.l}</button>
        ))}
      </div>
      <div className="cardgrid">
        {POWDERS.filter(p=> f==='all'||p.cat===f).map(p=>{
          const m=p.price.match(/₱[\d.]+(?:[–-][\d.]+)?\s*\/\s*g/);
          const perg=(m?m[0]:'—').replace(/\s*\/\s*g/,'');
          return (
            <article className={'event-card powder-card'+(p.star?' star':'')} key={p.name}>
              {p.star && <span className="stamp">top pick</span>}
              <div className="event-top">
                <span className="pdot" style={{background:PDOT[p.cat]}}>
                  {POWDER_IMG[p.name] && <img src={POWDER_IMG[p.name]} alt={p.name} loading="lazy" referrerPolicy="no-referrer" onError={e=>e.currentTarget.remove()} />}
                </span>
                <div className="event-meta">
                  <div className="ptag">{p.catlabel}</div>
                  <h3 className="event-name">{p.name}</h3>
                  <div className="event-org">🌿 {p.origin}</div>
                </div>
              </div>
              <div className="perg-box">
                <span className="perg-num">{perg}</span>
                <span className="perg-meta">
                  <span className="perg-lab">per gram</span>
                  <span className="perg-serv">☕ {p.serving} / serving</span>
                </span>
              </div>
              <p className="p-taste">{p.taste}</p>
              <div className="p-rows">
                <div className="meta-line">💴 {p.price}</div>
                <div className="meta-line">🔥 {p.hype}</div>
              </div>
              <a className="buylink" href={p.url} target="_blank" rel="noopener">🛒 Where to buy ↗<span>{p.buy}</span></a>
            </article>
          );
        })}
      </div>
    </>
  );
}
