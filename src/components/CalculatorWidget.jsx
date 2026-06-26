"use client";
import { useEffect, useRef, useState } from "react";
import { useLocalState } from "@/lib/useLocalState";

// A small floating calculator: a bottom-right circle that expands into a basic
// calculator, closes on outside-click / Escape, and remembers its running value
// in localStorage (per-browser, so the current number survives reloads).

const INITIAL = { display: "0", prev: null, op: null, overwrite: true };
const MAXLEN = 14;
const OP_SYM = { "+": "+", "-": "−", "*": "×", "/": "÷" };
const isErr = (s) => s.display === "Error";

// round away float noise (0.1+0.2 → 0.3); "Error" on non-finite (e.g. ÷0)
const compute = (a, op, b) => {
  let r;
  if (op === "+") r = a + b;
  else if (op === "-") r = a - b;
  else if (op === "*") r = a * b;
  else if (op === "/") r = b === 0 ? NaN : a / b;
  else r = b;
  return Number.isFinite(r) ? +r.toPrecision(12) : "Error";
};

// each action takes the state and returns a partial patch
const inputDigit = (s, d) => {
  if (isErr(s) || s.overwrite) return { display: d, overwrite: false };
  if (s.display.length >= MAXLEN) return {};
  return { display: s.display === "0" ? d : s.display + d };
};
const inputDot = (s) => {
  if (isErr(s) || s.overwrite) return { display: "0.", overwrite: false };
  if (s.display.includes(".")) return {};
  return { display: s.display + "." };
};
const backspace = (s) => {
  if (isErr(s) || s.overwrite) return {};
  const d = s.display.length > 1 ? s.display.slice(0, -1) : "0";
  return { display: d === "-" ? "0" : d };
};
const clearAll = () => ({ ...INITIAL });
const percent = (s) => {
  const cur = parseFloat(s.display);
  if (!Number.isFinite(cur)) return {};
  return { display: String(+(cur / 100).toPrecision(12)), overwrite: true };
};
const setOp = (s, nextOp) => {
  const cur = parseFloat(s.display);
  if (!Number.isFinite(cur)) return {};
  if (s.op != null && !s.overwrite) {
    const r = compute(s.prev, s.op, cur);
    if (r === "Error") return { display: "Error", prev: null, op: null, overwrite: true };
    return { display: String(r), prev: r, op: nextOp, overwrite: true };
  }
  return { prev: cur, op: nextOp, overwrite: true };
};
const equals = (s) => {
  if (s.op == null) return { overwrite: true };
  const cur = parseFloat(s.display);
  const r = compute(s.prev, s.op, cur);
  if (r === "Error") return { display: "Error", prev: null, op: null, overwrite: true };
  return { display: String(r), prev: null, op: null, overwrite: true };
};

export default function CalculatorWidget() {
  const [open, setOpen] = useState(false);
  const [calc, setCalc] = useLocalState("calc-widget", INITIAL);
  const rootRef = useRef(null);
  const act = (fn) => setCalc((s) => ({ ...s, ...fn(s) }));

  // close when focus leaves the widget (outside click) or on Escape
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className="fixed bottom-5 right-5 z-[80] flex flex-col items-end gap-2 max-md:bottom-4 max-md:right-4 print:hidden"
    >
      {open && (
        <div className="w-[230px] bg-cream-card border-[2.2px] border-forest rounded-card shadow-hard p-3">
          <div className="h-[14px] mb-0.5 text-right font-mono text-[.62rem] text-brown-soft truncate">
            {calc.op != null ? `${calc.prev} ${OP_SYM[calc.op]}` : ""}
          </div>
          <div className="mb-2.5 px-3 py-2 bg-kraft border-2 border-forest rounded-[10px] text-right font-mono font-bold text-[1.5rem] text-forest overflow-x-auto whitespace-nowrap">
            {calc.display}
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            <Btn kind="fn" onClick={() => act(clearAll)}>
              C
            </Btn>
            <Btn kind="fn" onClick={() => act(backspace)}>
              ⌫
            </Btn>
            <Btn kind="fn" onClick={() => act(percent)}>
              %
            </Btn>
            <Btn kind="op" active={calc.op === "/"} onClick={() => act((s) => setOp(s, "/"))}>
              ÷
            </Btn>

            <Btn onClick={() => act((s) => inputDigit(s, "7"))}>7</Btn>
            <Btn onClick={() => act((s) => inputDigit(s, "8"))}>8</Btn>
            <Btn onClick={() => act((s) => inputDigit(s, "9"))}>9</Btn>
            <Btn kind="op" active={calc.op === "*"} onClick={() => act((s) => setOp(s, "*"))}>
              ×
            </Btn>

            <Btn onClick={() => act((s) => inputDigit(s, "4"))}>4</Btn>
            <Btn onClick={() => act((s) => inputDigit(s, "5"))}>5</Btn>
            <Btn onClick={() => act((s) => inputDigit(s, "6"))}>6</Btn>
            <Btn kind="op" active={calc.op === "-"} onClick={() => act((s) => setOp(s, "-"))}>
              −
            </Btn>

            <Btn onClick={() => act((s) => inputDigit(s, "1"))}>1</Btn>
            <Btn onClick={() => act((s) => inputDigit(s, "2"))}>2</Btn>
            <Btn onClick={() => act((s) => inputDigit(s, "3"))}>3</Btn>
            <Btn kind="op" active={calc.op === "+"} onClick={() => act((s) => setOp(s, "+"))}>
              +
            </Btn>

            <Btn className="col-span-2" onClick={() => act((s) => inputDigit(s, "0"))}>
              0
            </Btn>
            <Btn onClick={() => act(inputDot)}>.</Btn>
            <Btn kind="eq" onClick={() => act(equals)}>
              =
            </Btn>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close calculator" : "Open calculator"}
        aria-expanded={open}
        className="w-14 h-14 rounded-full bg-forest text-cream-light border-[2.5px] border-forest shadow-hard grid place-items-center text-[1.45rem] leading-none hover:scale-105 active:scale-95 transition"
      >
        {open ? "✕" : "🧮"}
      </button>
    </div>
  );
}

function Btn({ children, onClick, kind, active, className = "" }) {
  const skin =
    kind === "op"
      ? active
        ? "bg-olive text-cream-light border-olive"
        : "bg-cream-light text-olive border-olive/50 hover:border-olive"
      : kind === "eq"
        ? "bg-forest text-cream-light border-forest hover:opacity-90"
        : kind === "fn"
          ? "bg-cream-light text-clay border-brown-soft/40 hover:border-clay"
          : "bg-cream-light text-forest border-brown-soft/30 hover:border-forest";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[10px] py-2.5 font-mono text-[.95rem] leading-none border-2 transition active:scale-95 ${skin} ${className}`}
    >
      {children}
    </button>
  );
}
