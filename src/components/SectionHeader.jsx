// `big` opts into a larger title (utilities override the .sec-title size).
export default function SectionHeader({ num, kicker, title, sub, big = false }) {
  return (
    <>
      <span className="section-tag"><b className="text-clay font-medium">{num}</b> {kicker}</span>
      <h2 className={"sec-title" + (big ? " text-[2.9rem] max-md:text-[2.1rem] leading-[1.05]" : "")}>
        {title}
        <span className="sec-sub">{sub}</span>
      </h2>
    </>
  );
}
