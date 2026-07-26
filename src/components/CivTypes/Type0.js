import React from 'react';
import PropTypes from 'prop-types';

export default function Type0({ tier, showTier }) {
  return (
    <div className="civStyle">
      <h2>Type 0 Civilization {showTier ? <span className="rating">K {tier.toFixed(3)}</span> : null}</h2>
      <h3>Planet Dependents</h3>
      <p>A civilization that harnesses some of its home planet's available energy, but not its full potential.</p>
      <ul>
        <li>Relies heavily on finite or inefficient energy sources</li>
        <li>Uses planetary resources without complete control of planetary-scale systems</li>
      </ul>
    </div>
  );
}

Type0.propTypes = {
  tier: PropTypes.number,
  showTier: PropTypes.bool,
};

Type0.defaultProps = {
  tier: 0,
  showTier: false,
};
