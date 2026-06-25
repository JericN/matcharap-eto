import { repo } from "@/config/repo";
import { toMatchaOptions } from "@/features/powders/pricing";
import SectionHeader from "@/components/SectionHeader";
import Calculator from "@/features/calculator/Calculator";

export const dynamic = "force-dynamic"; // read the shared saved state fresh each request

export default async function CalculatorPage() {
  // Matcha options come from the powders the team has hearted on /powders (single
  // source of truth); fall back to the full guide when nothing is hearted yet.
  const powders = await repo.powders();
  const savedPowders = await repo.savedPowders();
  const savedOptions = toMatchaOptions(powders.filter((p) => savedPowders.includes(p.name)));
  const usingAllPowders = savedOptions.length === 0;
  const matchaOptions = usingAllPowders ? toMatchaOptions(powders) : savedOptions;

  const [milkOptions, drinks, savedDrinks, ingredients, costs, srp, priceOverrides] =
    await Promise.all([
      repo.milkOptions(),
      repo.drinks(),
      repo.savedDrinks(),
      repo.ingredients(),
      repo.costs(),
      repo.srp(),
      repo.priceOverrides(),
    ]);

  return (
    <section>
      <SectionHeader
        num="02"
        kicker="cost calculator"
        title="Cost your menu"
        sub="pick matcha & milk, price the ingredients, set cups per drink → COGS, revenue & profit · prices verified vs PH store data, June 2026"
      />
      <Calculator
        matchaOptions={matchaOptions}
        usingAllPowders={usingAllPowders}
        milkOptions={milkOptions}
        drinks={drinks}
        savedDrinks={savedDrinks}
        ingredients={ingredients}
        costs={costs}
        srp={srp}
        priceOverrides={priceOverrides}
      />
    </section>
  );
}
