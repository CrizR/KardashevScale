import React from 'react';
import PropTypes from 'prop-types';

export default function Type3({ tier = 3, showTier = false }) {
  return (
    <div className="civStyle">
      <h2>Type III Civilization {showTier ? <span className="rating">K {tier.toFixed(3)}</span> : null}</h2>
      <h3>Galaxy Masters</h3>
      <p>
        A Type III civilization commands energy on the scale of an entire galaxy, coordinating infrastructure across billions of stellar systems.
      </p>
      <ul>
        <li>Uses stars, compact objects, and galactic-scale engineering as energy sources</li>
        <li>Can travel and communicate across interstellar distances at extraordinary scale</li>
        <li>May reshape the distribution of matter and energy throughout a galaxy</li>
        <li><a href="https://www.youtube.com/watch?v=mr7FXvTSYpA" target="_blank" rel="noreferrer">Advanced civilizations</a></li>
      </ul>
    </div>
  );
}

Type3.propTypes = {
  tier: PropTypes.number,
  showTier: PropTypes.bool,
};
