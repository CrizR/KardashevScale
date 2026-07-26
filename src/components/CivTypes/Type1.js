import React from 'react';
import PropTypes from 'prop-types';

export default function Type1({ tier = 1, showTier = false }) {
  return (
    <div className="civStyle">
      <h2>Type I Civilization {showTier ? <span className="rating">K {tier.toFixed(3)}</span> : null}</h2>
      <h3>Planet Masters</h3>
      <p>
        A Type I civilization can use energy on the scale available to its home planet, including a substantial share of the stellar energy reaching it.
      </p>
      <ul>
        <li>Uses planetary-scale renewable or fusion energy systems</li>
        <li>Can deliberately manage climate, ecosystems, and natural hazards</li>
        <li>Travels throughout its planetary system routinely</li>
        <li><a href="https://www.youtube.com/watch?v=HEpNiOM6lto" target="_blank" rel="noreferrer">Becoming Type I</a></li>
      </ul>
    </div>
  );
}

Type1.propTypes = {
  tier: PropTypes.number,
  showTier: PropTypes.bool,
};
