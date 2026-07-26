import React from 'react';
import PropTypes from 'prop-types';

export default function Type4({ tier = 4, showTier = false }) {
  return (
    <div className="civStyle">
      <h2>Type IV Civilization {showTier ? <span className="rating">K {tier.toFixed(3)}</span> : null}</h2>
      <h3>Cosmic-Web Engineers</h3>
      <p>
        Type IV is a speculative extension beyond Kardashev&apos;s original scale. It describes a civilization using energy on the scale of the observable universe while still obeying light-speed limits and cosmic horizons.
      </p>
      <ul>
        <li>It uses galaxy clusters, quasars, black holes, and the large-scale cosmic web as infrastructure.</li>
        <li>It moves and reorganizes matter across cosmological distances over billions of years.</li>
        <li>It builds knowledge and computation resilient enough to survive the deaths of stars and galaxies.</li>
      </ul>
    </div>
  );
}

Type4.propTypes = {
  tier: PropTypes.number,
  showTier: PropTypes.bool,
};
