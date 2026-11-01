import React from 'react';
import { DashboardPage } from './presentation/pages/DashboardPage';
import { useTradingEngine } from './application/hooks/useTradingEngine';

function App() {
  // Inicializa a ligação com o Java
  useTradingEngine();

  return <DashboardPage />;
}

export default App;
