import { repo } from "@/config/repo";
import SectionHeader from "@/components/SectionHeader";
import CompetitorsGrid from "@/features/competitors/CompetitorsGrid";

export const dynamic = "force-dynamic"; // read the shared saved state fresh each request

export const metadata = {
  title: "Competitors · Matcharap Eto",
  description:
    "Who else is whisking? 🍃 Big Leaves + 🌱 Little Leaves in Metro Manila, plus 🇯🇵 Japan-only houses for ideas.",
};

export default async function CompetitorsPage() {
  const [competitors, savedCompetitors] = await Promise.all([
    repo.competitors(),
    repo.savedCompetitors(),
  ]);
  return (
    <section>
      <SectionHeader
        big
        num="04"
        kicker="the competition"
        title="Who else is whisking? 🍵"
        sub="🍃 Big Leaves (PH corporate giants) → 🌱 Little Leaves (homegrown locals) → 🇯🇵 Straight from Japan (authentic Japan-only houses, for ideas you can't get here) · verified on Google Maps + the brands' own sites"
      />
      <CompetitorsGrid competitors={competitors} initialSaved={savedCompetitors} />
    </section>
  );
}
