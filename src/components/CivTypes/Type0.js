import React from 'react';
import PropTypes from 'prop-types';

export default function Type0({ tier = 0, showTier = false }) {
  return (
    <div className="civStyle">
      <h2>Type 0 Civilization {showTier ? <span className="rating">K {tier.toFixed(3)}</span> : null}</h2>
      <h3>The First Planetary Nervous System</h3>
      <p>
        A Type 0 civilization cannot yet command its planet&apos;s full energy budget, but it has begun linking billions of people, machines, sensors, and spacecraft into one civilization-scale system.
      </p>
      <ul>
        <li>Its global networks can monitor weather, oceans, disease, and near-Earth space almost in real time.</li>
        <li>AI, robotics, gene editing, and fusion research give it its first tools for redesigning life, matter, and energy.</li>
        <li>Its defining challenge is coordination because it has planetary power without planetary control.</li>
      </ul>
    </div>
  );
}

Type0.propTypes = {
  tier: PropTypes.number,
  showTier: PropTypes.bool,
};
