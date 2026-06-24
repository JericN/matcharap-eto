import Calculator from '@/components/Calculator';

export default function CalculatorPage(){
  return (
    <section>
      <span className="section-tag"><b>02</b> cost calculator</span>
      <h2 className="sec-title">Choose your matcha &amp; milk → costs auto-calculate<span className="sub">₱ per 16oz iced cup · tap the SRP box to set your own price · verified vs PH store data, June 2026</span></h2>
      <Calculator/>
    </section>
  );
}
