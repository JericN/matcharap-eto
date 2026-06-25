import Field, { cx } from "./Field";

// Slider field. The current value is best surfaced via the label `hint`
// (e.g. hint={`${dose} g`}).
export default function RangeField({ label, hint, id, className, inputClassName, ...rest }) {
  return (
    <Field label={label} hint={hint} htmlFor={id} className={className}>
      <input id={id} type="range" className={cx("range-input", inputClassName)} {...rest} />
    </Field>
  );
}
