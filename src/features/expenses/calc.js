// Pure expense math — no React, no I/O, trivially testable (mirrors cost.js).
// A row is { item, notes, price, qty }; price is ₱ per unit.

export const lineTotal = (row) => row.price * row.qty;

export const grandTotal = (rows) => rows.reduce((sum, r) => sum + lineTotal(r), 0);

// Each row's line total as a percentage of the grand total (0 when nothing spent).
export const sharePct = (row, grand) => (grand > 0 ? (lineTotal(row) / grand) * 100 : 0);
