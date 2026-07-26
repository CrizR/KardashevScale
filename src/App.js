import React from 'react';
import Calculator from './components/Calculator/Calculator';
import LifeScale from './components/LifeScale/LifeScale';

function App() {
  const pathname = window.location.pathname.replace(/\/+$/, '') || '/';

  if (pathname === '/calculator') {
    return <Calculator />;
  }

  return <LifeScale />;
}

export default App;
