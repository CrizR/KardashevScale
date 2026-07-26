import React from 'react';
import PropTypes from 'prop-types';

export default function Type6({ tier = 6, showTier = false }) {
  return (
    <div className="civStyle">
      <h2>Type VI Civilization {showTier ? <span className="rating">K {tier.toFixed(3)}</span> : null}</h2>
      <h3>Reality Architects</h3>
      <p>
        Type VI is the terminal science-fiction extension of the scale. It describes a civilization that does not merely use universes, but deliberately designs their geometry, causal structure, and birth conditions.
      </p>
      <ul>
        <li>It generates controlled universes and connects regions of spacetime that would otherwise never interact.</li>
        <li>It engineers topology, dimensions, or fundamental constants wherever the laws of physics allow.</li>
        <li>It would appear godlike to every lower type, but it remains a thought experiment rather than a scientific prediction.</li>
      </ul>
    </div>
  );
}

Type6.propTypes = {
  tier: PropTypes.number,
  showTier: PropTypes.bool,
};
