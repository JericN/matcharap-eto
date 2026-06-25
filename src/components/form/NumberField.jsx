import Field, { cx } from "./Field";

// Numeric input in two skins:
//   variant="box"        boxed, matches TextField/SelectField (default)
//   variant="underline"  inline dashed-underline (cups / SRP / price overrides)
// `prefix` (e.g. "₱") and `suffix` (e.g. "/g") render as non-interactive
// adornments inside the box variant. Spinners are stripped via CSS.
export default function NumberField({
  label, hint, id, variant = "box", prefix, suffix, className, inputClassName, ...rest
}) {
  const base = variant === "underline" ? "field-underline" : "field-box";
  const input = (
    <input
      id={id}
      type="number"
      inputMode="decimal"
      className={cx(base, prefix && "!pl-6", suffix && "!pr-7", inputClassName)}
      {...rest}
    />
  );
  return (
    <Field label={label} hint={hint} htmlFor={id} className={className}>
      {prefix || suffix ? (
        <div className="relative">
          {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-[.78rem] text-brown-soft pointer-events-none">{prefix}</span>}
          {input}
          {suffix && <span className="absolute right-2.5 top-1/2 -translate-y-1/2 font-mono text-[.6rem] text-brown-soft pointer-events-none">{suffix}</span>}
        </div>
      ) : input}
    </Field>
  );
}
