import Hero from '@/components/Hero';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Hero />
      <section className="section">
        <span className="section-tag"><b>·</b> sections</span>
        <h2 className="sec-title">Pick a section<span className="sub">everything you need to run a matcha pop-up booth in Metro Manila</span></h2>
        <div className="home-cards">
          <Link className="home-card" href="/events">
            <span className="hc-num">01</span>
            <svg className="hc-ico" viewBox="0 0 64 64"><use href="#mm-pin" /></svg>
            <div className="hc-title">Pop-up Events</div>
            <p className="hc-desc">Where to set up a booth — upcoming matcha pop-ups, fests &amp; markets around Metro Manila.</p>
            <span className="hc-go">open →</span>
          </Link>
          <Link className="home-card" href="/calculator">
            <span className="hc-num">02</span>
            <svg className="hc-ico" viewBox="0 0 64 64"><use href="#mm-whisk" /></svg>
            <div className="hc-title">Cost Calculator</div>
            <p className="hc-desc">Pick your matcha &amp; milk; see COGS, price &amp; margin per drink — auto-calculated.</p>
            <span className="hc-go">open →</span>
          </Link>
          <Link className="home-card" href="/powders">
            <span className="hc-num">03</span>
            <svg className="hc-ico" viewBox="0 0 64 64"><use href="#mm-leaf" /></svg>
            <div className="hc-title">Powder Guide</div>
            <p className="hc-desc">Best matcha to source — PH-homegrown, Japanese-in-PH &amp; imports, with prices.</p>
            <span className="hc-go">open →</span>
          </Link>
        </div>
      </section>
    </>
  );
}
