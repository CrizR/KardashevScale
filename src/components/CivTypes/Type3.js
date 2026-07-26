import React from 'react';
import PropTypes from 'prop-types';

export default function Type3({ tier = 3, showTier = false }) {
  return (
    <div className="civStyle">
      <h2>Type III Civilization {showTier ? <span className="rating">K {tier.toFixed(3)}</span> : null}</h2>
      <h3>A Galaxy Becomes a Machine</h3>
      <p>
        A Type III civilization commands energy on the scale of an entire galaxy. Because light-speed delays still apply, it would be a distributed network of civilizations and machines rather than one centrally controlled empire.
      </p>
      <ul>
        <li>Turns billions of stellar systems into linked centers of industry, life, and computation</li>
        <li>Uses stellar engines, compact objects, and the central supermassive black hole as infrastructure</li>
        <li>Becomes almost impossible to erase: no single planetary, stellar, or regional catastrophe can end it</li>
      </ul>
    </div>
  );
}

Type3.propTypes = {
  tier: PropTypes.number,
  showTier: PropTypes.bool,
};
