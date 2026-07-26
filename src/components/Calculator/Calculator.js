import React, { useMemo, useState } from 'react';
import CalcContent from './CalcContent';

const MIN_EXPONENT = 6;
const MAX_EXPONENT = 60;
const TYPE_LABELS = ['Type 0', 'Type I', 'Type II', 'Type III', 'Type IV', 'Type V', 'Type VI'];

function getScaleDestination(tier) {
  const typeIndex = Math.max(0, Math.min(6, Math.floor(Number.isFinite(tier) ? tier : 0)));
  return {
    label: TYPE_LABELS[typeIndex],
    page: 6 - typeIndex,
  };
}

export default function Calculator() {
  const [exponent, setExponent] = useState(13.3);
  const tier = useMemo(() => (exponent - 6) / 10, [exponent]);
  const destination = useMemo(() => getScaleDestination(tier), [tier]);

  const updateExponent = (event) => {
    const value = Number(event.target.value);
    if (Number.isFinite(value)) {
      setExponent(Math.min(MAX_EXPONENT, Math.max(MIN_EXPONENT, value)));
    }
  };

  return (
    <main className="calculator-page">
      <nav className="calculator-nav">
        <a href="/">← Explore the scale</a>
      </nav>

      <section className="calculator-hero">
        <p className="eyebrow">Sagan interpolation</p>
        <h1>Kardashev Calculator</h1>
        <p className="calculator-intro">
          Choose the exponent in 10<sup>x</sup> watts. The scale value uses K = (log<sub>10</sub>P − 6) / 10.
        </p>

        <div className="calculator-card">
          <div className="calculator-value">
            <span>Power usage</span>
            <strong>10<sup>{exponent.toFixed(1)}</sup> W</strong>
          </div>

          <label className="slider-label" htmlFor="energy-exponent">
            Energy exponent
            <input
              id="energy-exponent"
              type="number"
              min={MIN_EXPONENT}
              max={MAX_EXPONENT}
              step="0.1"
              value={exponent}
              onChange={updateExponent}
              inputMode="decimal"
            />
          </label>

          <input
            className="energy-slider"
            type="range"
            min={MIN_EXPONENT}
            max={MAX_EXPONENT}
            step="0.1"
            value={exponent}
            onChange={updateExponent}
            aria-label="Energy exponent"
          />

          <div className="tier-readout">
            <span>Kardashev rating</span>
            <strong>{tier.toFixed(3)}</strong>
          </div>

          <a className="explore-tier-link" href={`/?page=${destination.page}`}>
            Explore {destination.label} in the scale →
          </a>
        </div>
      </section>

      <section className="calculator-result">
        <CalcContent tier={tier} />
      </section>
    </main>
  );
}
