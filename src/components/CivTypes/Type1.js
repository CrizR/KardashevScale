import React from 'react';
import PropTypes from 'prop-types';

export default function Type1({ tier = 1, showTier = false }) {
  return (
    <div className="civStyle">
      <h2>Type I Civilization {showTier ? <span className="rating">K {tier.toFixed(3)}</span> : null}</h2>
      <h3>A Planet Becomes Infrastructure</h3>
      <p>
        A Type I civilization can use energy on the scale naturally available to an entire planet, including a substantial fraction of the sunlight, wind, tides, geothermal heat, and other power flowing through its world.
      </p>
      <ul>
        <li>It runs civilization on planetary renewable energy, storage, and potentially fusion systems.</li>
        <li>It actively stabilizes climate and ecosystems while reducing asteroid, volcanic, and other global hazards.</li>
        <li>It builds permanent industry across its moons, orbital space, and neighboring planets.</li>
      </ul>
    </div>
  );
}

Type1.propTypes = {
  tier: PropTypes.number,
  showTier: PropTypes.bool,
};
