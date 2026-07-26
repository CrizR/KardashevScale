import React from 'react';
import KardashevEquation from '../KardashevEquation';
import Type0 from '../CivTypes/Type0';
import Type1 from '../CivTypes/Type1';
import Type2 from '../CivTypes/Type2';
import Type3 from '../CivTypes/Type3';
import Type4 from '../CivTypes/Type4';
import Type5 from '../CivTypes/Type5';
import Type6 from '../CivTypes/Type6';

function BaseContent() {
  return (
    <div className="civStyle result-copy">
      <KardashevEquation />
      <p>
        Carl Sagan proposed this formula to interpolate between Kardashev's original civilization types. Increase the power input to see the corresponding level.
      </p>
    </div>
  );
}

export default function CalcContent({ tier }) {
  if (!Number.isFinite(tier) || tier <= 0) {
    return <BaseContent />;
  }

  const types = [Type0, Type1, Type2, Type3, Type4, Type5, Type6];
  const index = Math.min(types.length - 1, Math.floor(tier));
  const Civilization = types[index];

  return (
    <div className="result-panel">
      <Civilization tier={tier} showTier />
    </div>
  );
}
