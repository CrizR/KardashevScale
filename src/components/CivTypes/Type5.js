import React from 'react';
import PropTypes from 'prop-types';

export default function Type5({ tier = 5, showTier = false }) {
  return (
    <div className="civStyle">
      <h2>Type V Civilization {showTier ? <span className="rating">K {tier.toFixed(3)}</span> : null}</h2>
      <h3>Universe Foundries</h3>
      <p>
        Type V is pure theoretical extrapolation: a civilization able to access, create, or manipulate more than one universe. No observation or accepted engineering pathway shows that this is possible.
      </p>
      <ul>
        <li>Creates baby universes or traversable links between otherwise separate cosmic regions, if physics permits</li>
        <li>Uses entire universes as laboratories, habitats, archives, or computational substrates</li>
        <li>Could select different vacuum states—and therefore different effective physical laws—in newly created universes</li>
      </ul>
    </div>
  );
}

Type5.propTypes = {
  tier: PropTypes.number,
  showTier: PropTypes.bool,
};
