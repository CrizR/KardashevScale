import React from 'react';
import PropTypes from 'prop-types';

export default function Type4({ tier = 4, showTier = false }) {
  return (
    <div className="civStyle">
      <h2>Type IV Civilization {showTier ? <span className="rating">K {tier.toFixed(3)}</span> : null}</h2>
      <h3>Universe Masters</h3>
      <p>A hypothetical civilization capable of using energy on the scale of the observable universe.</p>
      <ul>
        <li>Manipulates matter and energy across cosmological distances</li>
        <li>Uses black holes, relativistic systems, and space-time engineering as infrastructure</li>
        <li>Operates far beyond the original three Kardashev categories</li>
      </ul>
    </div>
  );
}

Type4.propTypes = {
  tier: PropTypes.number,
  showTier: PropTypes.bool,
};
