"use client";
import { TextField, NumberField } from "@/components/form";
import { lineTotal, grandTotal, sharePct } from "@/features/expenses/calc";

// ₱ with up to 2 decimals (centavos shown only when present).
const peso = (n) => "₱" + n.toLocaleString("en-US", { maximumFractionDigits: 2 });
const num = (v) => Math.max(0, Number(v) || 0);

export default function ExpensesTable({ rows, onAddRow, onEditField, onCommitField, onDeleteRow }) {
  // Presentational: renders one sheet's rows; parent owns state + persistence.
  const grand = grandTotal(rows);

  return (
    <div className="bg-cream-card border-[2.2px] border-forest rounded-card shadow-hard-sm px-5 py-[18px] max-md:p-[14px]">
      {rows.length === 0 ? (
        <p className="text-[.9rem] text-olive-soft text-center py-4">
          No line items yet. Add your first expense to start the plan →
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse">
            <thead>
              <tr className="border-b-2 border-dashed border-brown-soft text-left font-mono text-[.52rem] tracking-[.1em] uppercase text-brown-soft">
                <th className="px-2 py-2 font-medium">Item</th>
                <th className="px-2 py-2 font-medium">Notes</th>
                <th className="px-2 py-2 font-medium text-right w-[120px]">Price ₱</th>
                <th className="px-2 py-2 font-medium text-right w-[90px]">Qty</th>
                <th className="px-2 py-2 font-medium text-right w-[110px]">Total ₱</th>
                <th className="px-2 py-2 font-medium text-right w-[70px]">%</th>
                <th className="px-2 py-2 w-[34px]" aria-label="remove" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-dashed border-brown-soft/40 align-middle">
                  <td className="px-2 py-1.5">
                    <TextField
                      aria-label="Item name"
                      inputClassName="w-full"
                      value={r.item}
                      onChange={(e) => onEditField(r.id, "item", e.target.value)}
                      onBlur={() => onCommitField(r.id, "item")}
                      placeholder="e.g. Matcha powder"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <TextField
                      aria-label="Notes"
                      inputClassName="w-full"
                      value={r.notes}
                      onChange={(e) => onEditField(r.id, "notes", e.target.value)}
                      onBlur={() => onCommitField(r.id, "notes")}
                      placeholder="optional note"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <NumberField
                      aria-label="Price"
                      prefix="₱"
                      inputClassName="w-full text-right"
                      min="0"
                      step="0.5"
                      value={r.price}
                      onChange={(e) => onEditField(r.id, "price", num(e.target.value))}
                      onBlur={() => onCommitField(r.id, "price")}
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <NumberField
                      aria-label="Quantity"
                      inputClassName="w-full text-right"
                      min="0"
                      step="1"
                      value={r.qty}
                      onChange={(e) => onEditField(r.id, "qty", num(e.target.value))}
                      onBlur={() => onCommitField(r.id, "qty")}
                    />
                  </td>
                  <td className="px-2 py-1.5 text-right font-mono text-[.92rem] font-medium text-forest whitespace-nowrap">
                    {peso(lineTotal(r))}
                  </td>
                  <td className="px-2 py-1.5 text-right font-mono text-[.78rem] text-clay whitespace-nowrap">
                    {sharePct(r, grand).toFixed(1)}%
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    <button
                      type="button"
                      onClick={() => onDeleteRow(r.id)}
                      aria-label={`Remove ${r.item || "row"}`}
                      className="font-mono text-[1rem] leading-none text-brown-soft hover:text-clay transition"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-forest font-doodle">
                <td className="px-2 pt-3 font-bold text-[1.05rem] text-forest" colSpan={4}>
                  Grand total
                </td>
                <td className="px-2 pt-3 text-right font-mono text-[1.1rem] font-bold text-forest whitespace-nowrap">
                  {peso(grand)}
                </td>
                <td className="px-2 pt-3 text-right font-mono text-[.82rem] font-semibold text-clay">
                  {grand > 0 ? "100%" : "0%"}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      <div className="mt-4">
        <button
          type="button"
          onClick={onAddRow}
          className="chip chip--active normal-case tracking-normal"
        >
          ＋ Add row
        </button>
      </div>
    </div>
  );
}
