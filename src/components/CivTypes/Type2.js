import React from 'react';
import PropTypes from 'prop-types';

export default function Type2({ tier = 2, showTier = false }) {
  return (
    <div className="civStyle">
      <h2>Type II Civilization {showTier ? <span className="rating">K {tier.toFixed(3)}</span> : null}</h2>
      <h3>Star Masters</h3>
      <p>
        A Type II civilization can use energy comparable to the total output of its star, potentially through a Dyson swarm or other stellar-scale infrastructure.
      </p>
      <ul>
        <li>Routine travel and industry across its entire stellar system</li>
        <li><a href="https://www.youtube.com/watch?v=pP44EPBMb8A" target="_blank" rel="noreferrer">Dyson structures</a> could collect a large fraction of stellar output</li>
        <li>May use black-hole accretion, star lifting, and stellar engineering</li>
      </ul>
    </div>
  );
}

Type2.propTypes = {
  tier: PropTypes.number,
  showTier: PropTypes.bool,
};
