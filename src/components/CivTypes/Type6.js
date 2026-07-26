import React from 'react';
import PropTypes from 'prop-types';

export default function Type6({ tier = 6, showTier = false }) {
  return (
    <div className="civStyle">
      <h2>Type VI Civilization {showTier ? <span className="rating">K {tier.toFixed(3)}</span> : null}</h2>
      <h3>Masters of Space-Time</h3>
      <p>A terminal speculative category describing control over space-time and universe creation itself.</p>
      <ul>
        <li>Not part of Kardashev's original proposal</li>
        <li>Useful as science-fiction extrapolation, not an observational classification</li>
      </ul>
    </div>
  );
}

Type6.propTypes = {
  tier: PropTypes.number,
  showTier: PropTypes.bool,
};
