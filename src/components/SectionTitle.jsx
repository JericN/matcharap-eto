// Big, consistent sub-section header used across pages (Calculator sections,
// Drinks selection/menu/ingredients, …). Sits ABOVE its content box so every
// section follows the same "title → component" rhythm. Pair with the shared
// section spacing (`mb-12 max-md:mb-9`) on the wrapping element.
//   badge  small mono marker before the title (e.g. "①")
//   icon   emoji rendered inside the title (e.g. "♥")
//   title  the heading text (Title Case)
//   meta   small uppercase note after the title (e.g. "3 saved")
export default function SectionTitle({ badge, icon, title, meta, className = "" }) {
  return (
    <div className={`flex items-baseline gap-2.5 flex-wrap mb-5 ${className}`}>
      {badge != null && (
        <span className="font-mono text-[1rem] leading-none text-clay">{badge}</span>
      )}
      <h3 className="font-doodle font-bold text-[1.5rem] leading-none text-forest max-md:text-[1.25rem]">
        {icon != null && <span className="mr-1.5">{icon}</span>}
        {title}
      </h3>
      {meta != null && (
        <span className="font-mono text-[.6rem] tracking-[.1em] uppercase text-brown-soft self-end mb-1">
          {meta}
        </span>
      )}
    </div>
  );
}
