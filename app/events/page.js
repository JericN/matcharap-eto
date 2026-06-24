import EventsGrid from '@/components/EventsGrid';

export default function EventsPage(){
  return (
    <section>
      <span className="section-tag"><b>01</b> pop-up events</span>
      <h2 className="sec-title">Where to set up a booth<span className="sub">upcoming matcha pop-ups, fests &amp; markets around Metro Manila</span></h2>
      <EventsGrid/>
    </section>
  );
}
