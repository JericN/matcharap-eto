import { repo } from "@/config/repo";
import SectionHeader from "@/components/SectionHeader";
import EventsGrid from "@/features/events/EventsGrid";

export const dynamic = "force-dynamic"; // read the shared saved state fresh each request

export default async function EventsPage() {
  const events = await repo.events();
  const savedEvents = await repo.savedEvents();
  return (
    <section>
      <SectionHeader
        num="01"
        kicker="pop-up events"
        title="Where to set up a booth"
        sub="upcoming matcha pop-ups, fests & markets around Metro Manila · ♥ the ones you want to book"
      />
      <EventsGrid events={events} initialSaved={savedEvents} />
    </section>
  );
}
