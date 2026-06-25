// Label + control wrapper shared by every form field. `className` sizes the
// wrapper (e.g. flex-1, w-[72px]); the optional label/hint render above it.
// When no label is given it's just a div around the control — so the same
// component works for stacked, labelled fields and bare inline inputs alike.
export default function Field({ label, hint, htmlFor, className, children }) {
  return (
    <div className={className}>
      {label != null && (
        <label htmlFor={htmlFor} className="field-label">
          {label}
          {hint != null && <span className="float-right font-normal normal-case tracking-normal text-olive">{hint}</span>}
        </label>
      )}
      {children}
    </div>
  );
}

export const cx = (...a) => a.filter(Boolean).join(" ");
