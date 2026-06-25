import { repo } from "@/config/repo";
import SectionHeader from "@/components/SectionHeader";
import DrinksGrid from "@/features/drinks/DrinksGrid";

export const dynamic = "force-dynamic";

export default async function DrinksPage() {
  const drinks = await repo.drinks();
  const ingredients = await repo.ingredients();
  const savedDrinks = await repo.savedDrinks();
  return (
    <section>
      <SectionHeader
        num="05"
        kicker="drink menu"
        title="Your drink menu"
        sub="each drink = matcha + milk + add-ons · ♥ the ones you sell to cost them in the calculator"
      />
      <DrinksGrid drinks={drinks} ingredients={ingredients} initialSaved={savedDrinks} />
    </section>
  );
}
