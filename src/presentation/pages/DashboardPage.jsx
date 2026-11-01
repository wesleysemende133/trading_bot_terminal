import React, { useState } from 'react';
import { useMarketStore } from '../../application/store/useMarketStore';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { SignalCard } from '../components/SignalCard';
import { MarketAnalysisPanel } from '../components/MarketAnalysisPanel';
import { PerformancePanel } from '../components/PerformancePanel';
import { TradeHistoryPanel } from '../components/TradeHistoryPanel';
import { NewsPanel } from '../components/NewsPanel';
import { LivePositionsPanel } from '../components/LivePositionsPanel';
import ProChart from '../components/ProChart';
import ProChartFocused from '../components/ProChartFocused';
import { Activity, TrendingUp, TrendingDown, BarChart2, Maximize2 } from 'lucide-react';

export function DashboardPage() {
  const signalsObj = useMarketStore((state) => state.signals);
  const prices = useMarketStore((state) => state.prices);
  const symbols = useMarketStore((state) => state.symbols);

  const [activeSymbol, setActiveSymbol] = useState('BTCUSDT');
  const [chartMode, setChartMode] = useState('complete'); // 'complete' | 'focused'
  const signals = React.useMemo(() => Object.values(signalsObj), [signalsObj]);
  const activeData = prices[activeSymbol] || {};

  const PairRow = ({ symbol }) => {
    const data = prices[symbol] || {};
    const price = data.price;
    const change = data.change || 0;
    const isUp = change >= 0;

    return (
      <div
        onClick={() => setActiveSymbol(symbol)}
        className={`flex items-center justify-between px-3 py-2 cursor-pointer border-b border-tv-border/30 transition-colors ${
          activeSymbol === symbol ? 'bg-tv-border/80' : 'hover:bg-tv-border/50'
        }`}
      >
        <span className={`text-xs font-semibold ${activeSymbol === symbol ? 'text-white' : 'text-gray-400'}`}>
          {symbol}
        </span>
        <div className="flex items-center space-x-2">
          <span className={`text-xs font-mono ${price ? 'text-tv-text' : 'text-gray-500'}`}>
            {price ? price.toFixed(2) : '...'}
          </span>
          <span className={`text-[10px] font-bold ${isUp ? 'text-tv-green' : 'text-tv-red'}`}>
            {isUp ? '+' : ''}{change.toFixed(2)}%
          </span>
        </div>
      </div>
    );
  };

  const Sidebar = (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 border-b border-tv-border">
        <LivePositionsPanel />
      </div>
      <div className="flex-shrink-0 border-b border-tv-border">
        <div className="px-4 py-3 border-b border-tv-border">
          <h2 className="text-sm font-bold text-white">Sinais do Bot</h2>
          <p className="text-xs text-gray-400">Atualização Automática</p>
        </div>
        <div className="p-3 space-y-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {signals.length === 0 ? (
            <div className="text-center text-gray-500 text-sm py-6">
              <Activity className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>Aguardando sinais...</p>
            </div>
          ) : (
            signals.map(sig => <SignalCard key={sig.symbol} signal={sig} />)
          )}
        </div>
      </div>
      <div className="flex-shrink-0 border-b border-tv-border">
        <PerformancePanel />
      </div>
      <div className="flex-shrink-0 border-b border-tv-border" style={{ height: '240px' }}>
        <TradeHistoryPanel />
      </div>
      <div className="flex-shrink-0 border-b border-tv-border" style={{ height: '220px' }}>
        <NewsPanel />
      </div>
    </div>
  );

  return (
    <DashboardLayout sidebar={Sidebar}>
      <div className="flex-1 flex overflow-hidden bg-tv-bg">
        <div className="w-56 flex-shrink-0 border-r border-tv-border bg-tv-panel overflow-y-auto">
          <div className="px-3 py-2 border-b border-tv-border flex items-center justify-between">
            <span className="text-xs font-bold text-white">Pares</span>
            <span className="text-[10px] text-gray-500">({symbols.length})</span>
          </div>
          {symbols.map(sym => <PairRow key={sym} symbol={sym} />)}
        </div>

        <div className="flex-1 border-l border-tv-border flex flex-col overflow-y-auto">
          <div className="h-14 flex items-center px-4 bg-tv-panel border-b border-tv-border flex-shrink-0 justify-between sticky top-0 z-20">
            <div className="flex items-center space-x-4">
              <span className="text-white font-bold text-sm">{activeSymbol}</span>
              <span className={`text-sm font-mono ${activeData.price ? 'text-tv-text' : 'text-gray-500'}`}>
                ${activeData.price ? activeData.price.toFixed(2) : '---'}
              </span>
              <span className={`text-xs font-bold flex items-center space-x-1 ${(activeData.change || 0) >= 0 ? 'text-tv-green' : 'text-tv-red'}`}>
                {(activeData.change || 0) >= 0
                  ? <TrendingUp className="w-3 h-3" />
                  : <TrendingDown className="w-3 h-3" />}
                <span>{(activeData.change || 0) >= 0 ? '+' : ''}{(activeData.change || 0).toFixed(2)}%</span>
              </span>
            </div>

            <div className="flex items-center space-x-4">
              {/* Seletor de modos */}
              <div className="flex items-center space-x-1 bg-tv-bg rounded p-0.5 border border-tv-border">
                <button
                  onClick={() => setChartMode('complete')}
                  className={`flex items-center space-x-1 px-2 py-1 rounded text-[10px] font-bold transition-colors ${
                    chartMode === 'complete' ? 'bg-tv-blue text-white' : 'text-gray-400 hover:text-white'
                  }`}
                  title="Modo Completo (5 paineis)"
                >
                  <BarChart2 className="w-3 h-3" />
                  <span>Completo</span>
                </button>
                <button
                  onClick={() => setChartMode('focused')}
                  className={`flex items-center space-x-1 px-2 py-1 rounded text-[10px] font-bold transition-colors ${
                    chartMode === 'focused' ? 'bg-tv-blue text-white' : 'text-gray-400 hover:text-white'
                  }`}
                  title="Modo Foco (velas grandes + mini-indicadores)"
                >
                  <Maximize2 className="w-3 h-3" />
                  <span>Foco</span>
                </button>
              </div>

              <div className="flex items-center space-x-4 text-[10px] text-gray-400">
                <span>Máx 24h: {activeData.high ? activeData.high.toFixed(2) : '---'}</span>
                <span>Mín 24h: {activeData.low ? activeData.low.toFixed(2) : '---'}</span>
                <span>Vol: {activeData.volume ? (activeData.volume / 1000).toFixed(1) + 'K' : '---'}</span>
              </div>
            </div>
          </div>

          <div className="sticky top-14 z-10">
            <MarketAnalysisPanel symbol={activeSymbol} />
          </div>

          <div className="w-full bg-tv-bg" style={{ height: 'calc(100vh - 220px)', minHeight: '600px' }}>
            {chartMode === 'complete' ? (
              <ProChart symbol={activeSymbol} />
            ) : (
              <ProChartFocused symbol={activeSymbol} />
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
