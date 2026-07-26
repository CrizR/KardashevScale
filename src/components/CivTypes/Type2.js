import React from 'react';
import PropTypes from 'prop-types';

export default function Type2({ tier = 2, showTier = false }) {
  return (
    <div className="civStyle">
      <h2>Type II Civilization {showTier ? <span className="rating">K {tier.toFixed(3)}</span> : null}</h2>
      <h3>A Star Becomes a Power Plant</h3>
      <p>
        A Type II civilization can use energy comparable to the total output of its star. The most plausible image is not a solid shell, but a vast Dyson swarm of independent collectors, habitats, factories, and computers in orbit.
      </p>
      <ul>
        <li>It surrounds its star with enough infrastructure to capture a major share of its light.</li>
        <li>It uses star lifting, orbital habitats, and automated industry to turn a solar system into engineered territory.</li>
        <li>It launches interstellar probes and settlements while using stellar or black-hole systems for power and computation.</li>
      </ul>
    </div>
  );
}

Type2.propTypes = {
  tier: PropTypes.number,
  showTier: PropTypes.bool,
};
