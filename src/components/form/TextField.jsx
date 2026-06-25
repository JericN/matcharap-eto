import Field, { cx } from "./Field";

// Boxed text-style input (no dropdown chevron). `type` allows url/email/search
// etc. `inputClassName` tweaks the control; everything else passes straight to
// the <input> (value, onChange, placeholder, aria-label, onKeyDown, …).
export default function TextField({ label, hint, id, type = "text", className, inputClassName, ...rest }) {
  return (
    <Field label={label} hint={hint} htmlFor={id} className={className}>
      <input id={id} type={type} className={cx("field-box", inputClassName)} {...rest} />
    </Field>
  );
}
