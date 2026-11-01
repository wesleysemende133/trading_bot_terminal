import React from 'react';
import { Activity } from 'lucide-react';
import { useMarketStore } from '../../application/store/useMarketStore';
import { BotControlPanel } from '../components/BotControlPanel';
import { BalancePanel } from '../components/BalancePanel';

export function DashboardLayout({ children, sidebar }) {
  const connectionStatus = useMarketStore((state) => state.connectionStatus);

  return (
    <div className="flex flex-col h-screen bg-tv-bg text-tv-text overflow-hidden">
      
      {/* HEADER */}
      <header className="flex items-center justify-between px-4 py-2 bg-tv-panel border-b border-tv-border h-14 shrink-0">
        <div className="flex items-center space-x-4">
          <Activity className="text-tv-blue w-6 h-6" />
          <h1 className="text-lg font-bold text-white tracking-wider">ALGO TRADER PRO</h1>
        </div>

        <div className="flex items-center space-x-6">
          <BalancePanel />
          <BotControlPanel />
          <div className="flex items-center space-x-2 bg-tv-bg px-3 py-1 rounded border border-tv-border">
            <span className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-tv-green animate-pulse' : 'bg-tv-red'}`} />
            <span className="text-xs font-semibold">
              {connectionStatus === 'connected' ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      </header>

      {/* CONTEÚDO */}
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 relative flex flex-col overflow-hidden">
          {children}
        </main>

        {/* SIDEBAR DIREITA — com scroll */}
        <aside className="w-80 bg-tv-bg border-l border-tv-border flex flex-col shrink-0 overflow-y-auto">
          {sidebar}
        </aside>
      </div>
    </div>
  );
}
