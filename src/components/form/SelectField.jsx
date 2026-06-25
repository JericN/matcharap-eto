import Field, { cx } from "./Field";

// Boxed <select> — the ONLY field that carries the dropdown chevron, because it
// genuinely opens a menu. Pass <option>s as children.
export default function SelectField({
  label,
  hint,
  id,
  className,
  selectClassName,
  children,
  ...rest
}) {
  return (
    <Field label={label} hint={hint} htmlFor={id} className={className}>
      <select id={id} className={cx("field-select", selectClassName)} {...rest}>
        {children}
      </select>
    </Field>
  );
}
