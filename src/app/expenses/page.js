import { repo } from "@/config/repo";
import SectionHeader from "@/components/SectionHeader";
import ExpensesTable from "@/features/expenses/ExpensesTable";

export const dynamic = "force-dynamic"; // read the shared expense rows fresh each request

export default async function ExpensesPage() {
  const expenses = await repo.expenses();
  return (
    <section>
      <SectionHeader
        num="06"
        kicker="expense planner"
        title="Plan the spend"
        sub="add a line per cost — item, notes, price & quantity; totals, shares & a grand total auto-calculate · shared with the team"
      />
      <ExpensesTable initialExpenses={expenses} />
    </section>
  );
}
