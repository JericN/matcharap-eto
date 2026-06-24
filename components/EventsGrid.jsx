'use client';
import { useState } from 'react';
import { EVENTS, STAMP } from '@/lib/data';

export default function EventsGrid(){
  const [f,setF]=useState('all');
  const filters=[['All','all'],['Upcoming','upcoming'],['Recurring','recurring'],['Best fit','star']];
  return (
    <>
      <div className="chiprow">
        {filters.map(([label,val])=>(
          <button key={val} className={f===val?'filter active':'filter'} onClick={()=>setF(val)}>{label}</button>
        ))}
      </div>
      <div className="cardgrid">
        {EVENTS.filter(e=> f==='all'||e.tags.includes(f)).map(e=>(
          <article className={'event-card'+(e.star?' star':'')} key={e.name}>
            <span className={'stamp '+(STAMP[e.status[1]]||'')}>{e.status[0].replace(/^[^A-Za-z]+/,'').trim()}</span>
            <div className="event-top">
              <svg className="event-doodle" viewBox="0 0 64 64" aria-hidden="true"><use href="#mm-tent"/></svg>
              <div className="event-meta">
                <h3 className="event-name">{e.name}</h3>
                <div className="event-org">{e.org}</div>
                <div className="meta-line"><svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="#6b4f2f" strokeWidth="1.8"><rect x="1.5" y="2.5" width="11" height="9.5" rx="1.5"/><path d="M1.5 5h11M4 1v3M10 1v3"/></svg> {e.date}</div>
                <div className="meta-line"><svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="#6b4f2f" strokeWidth="1.8"><path d="M7 1c3 0 5 2.2 5 5 0 3.5-5 7-5 7S2 9.5 2 6c0-2.8 2-5 5-5Z"/><circle cx="7" cy="6" r="1.7"/></svg> {e.venue}</div>
              </div>
            </div>
            <div className="event-body"><p className="ev-theme">{e.theme}</p><div className="ev-stats"><span className="ev-stat">🎪 {e.size}</span><span className="ev-stat">👥 {e.people}</span></div></div>
            <div className="event-foot"><span className={'tag '+(e.vendor.c==='open'?'go':e.vendor.c==='warn'?'warn':'wait')}>{e.vendor.ic} {e.vendor.t}</span>{e.star && <span className="fit-tag">⭐ fit</span>}</div>
          </article>
        ))}
      </div>
    </>
  );
}
