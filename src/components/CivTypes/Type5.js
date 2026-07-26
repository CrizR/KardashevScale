import React from 'react';
import PropTypes from 'prop-types';

export default function Type5({ tier = 5, showTier = false }) {
  return (
    <div className="civStyle">
      <h2>Type V Civilization {showTier ? <span className="rating">K {tier.toFixed(3)}</span> : null}</h2>
      <h3>Multiverse Masters</h3>
      <p>A speculative civilization capable of accessing or manipulating energy across multiple universes.</p>
      <ul>
        <li>Entirely hypothetical and well beyond the original Kardashev framework</li>
        <li>Would require control over physics at a scale current science cannot test</li>
      </ul>
    </div>
  );
}

Type5.propTypes = {
  tier: PropTypes.number,
  showTier: PropTypes.bool,
};
