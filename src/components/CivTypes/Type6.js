import React from 'react';
import PropTypes from 'prop-types';

export default function Type6({ tier = 6, showTier = false }) {
  return (
    <div className="civStyle">
      <h2>Type VI Civilization {showTier ? <span className="rating">K {tier.toFixed(3)}</span> : null}</h2>
      <h3>Reality Architects</h3>
      <p>
        Type VI is the terminal science-fiction extension of the scale: not merely using universes, but deliberately designing their geometry, causal structure, and birth conditions.
      </p>
      <ul>
        <li>Generates controlled universes and connects regions of spacetime that would otherwise never interact</li>
        <li>Engineers topology, dimensions, or fundamental constants wherever the laws of physics allow</li>
        <li>Would appear godlike to every lower type, but remains a thought experiment rather than a scientific prediction</li>
      </ul>
    </div>
  );
}

Type6.propTypes = {
  tier: PropTypes.number,
  showTier: PropTypes.bool,
};
