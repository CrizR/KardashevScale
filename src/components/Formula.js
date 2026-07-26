import React from 'react';

export default function Formula({ tex }) {
  return (
    <div className="formula" role="math" aria-label="K equals log base ten of power minus six, divided by ten">
      {tex}
    </div>
  );
}
