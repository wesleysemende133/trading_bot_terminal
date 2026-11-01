import React, { useEffect, useState } from 'react';
import { TradesApiClient } from '../../infrastructure/http/TradesApiClient';
import { BarChart3, TrendingUp, TrendingDown, Clock } from 'lucide-react';

export function TradeHistoryPanel() {
  const [data, setData] = useState({ trades: [], metrics: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchTrades = async () => {
      const result = await TradesApiClient.getHistory();
      if (isMounted) {
        setData(result);
        setLoading(false);
      }
    };

    fetchTrades();
    const interval = setInterval(fetchTrades, 10000); // 10s

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const { trades, metrics } = data;

  if (loading) {
    return (
      <div className="bg-tv-panel h-full flex flex-col">
        <div className="px-3 py-2 flex items-center space-x-2 border-b border-tv-border">
          <BarChart3 className="w-3 h-3 text-tv-blue" />
          <span className="text-[11px] font-bold text-white">Histórico</span>
        </div>
        <div className="p-3 text-[10px] text-gray-400 animate-pulse">A carregar...</div>
      </div>
    );
  }

  return (
    <div className="bg-tv-panel h-full flex flex-col">
      {/* Cabeçalho */}
      <div className="px-3 py-2 flex items-center justify-between border-b border-tv-border flex-shrink-0">
        <div className="flex items-center space-x-1.5">
          <BarChart3 className="w-3 h-3 text-tv-blue" />
          <span className="text-[11px] font-bold text-white">Histórico</span>
        </div>
        <span className="text-[9px] text-gray-500">({metrics.total || 0})</span>
      </div>

      {/* Métricas resumidas */}
      <div className="grid grid-cols-3 gap-1 px-2 py-1.5 border-b border-tv-border/50 flex-shrink-0">
        <MetricCell label="Win" value={`${metrics.winRate || 0}%`} color={metrics.winRate >= 50 ? 'text-tv-green' : 'text-tv-red'} />
        <MetricCell label="PnL" value={`${metrics.totalPnl >= 0 ? '+' : ''}${metrics.totalPnl || 0}`} color={metrics.totalPnl >= 0 ? 'text-tv-green' : 'text-tv-red'} />
        <MetricCell label="PF" value={metrics.profitFactor || 0} color={metrics.profitFactor >= 1.5 ? 'text-tv-green' : 'text-yellow-500'} />
      </div>

      {/* Lista de trades com scroll */}
      <div className="flex-1 overflow-y-auto">
        {trades.length === 0 ? (
          <div className="px-3 py-2 text-[10px] text-gray-500">Sem trades registadas.</div>
        ) : (
          trades.slice().reverse().map((trade, idx) => (
            <TradeRow key={idx} trade={trade} />
          ))
        )}
      </div>
    </div>
  );
}

function MetricCell({ label, value, color }) {
  return (
    <div className="text-center">
      <div className="text-[8px] text-gray-500">{label}</div>
      <div className={`text-[10px] font-bold font-mono ${color}`}>{value}</div>
    </div>
  );
}

function TradeRow({ trade }) {
  const isOpen = trade.isOpen;
  const isProfit = trade.pnl > 0;
  const isBuy = trade.side === 'BUY';

  return (
    <div className="px-3 py-1.5 border-b border-tv-border/30 hover:bg-tv-border/50 transition-colors">
      <div className="flex items-center justify-between mb-0.5">
        <div className="flex items-center space-x-1.5">
          {isBuy
            ? <TrendingUp className="w-2.5 h-2.5 text-tv-green" />
            : <TrendingDown className="w-2.5 h-2.5 text-tv-red" />}
          <span className="text-[10px] font-bold text-white">{trade.symbol}</span>
          <span className="text-[8px] text-gray-500">{trade.side}</span>
        </div>
        {isOpen ? (
          <span className="text-[8px] px-1 py-0.5 bg-tv-blue/20 text-tv-blue rounded flex items-center space-x-0.5">
            <Clock className="w-2 h-2" />
            <span>ABERTO</span>
          </span>
        ) : (
          <span className={`text-[10px] font-mono font-bold ${isProfit ? 'text-tv-green' : 'text-tv-red'}`}>
            {isProfit ? '+' : ''}{trade.pnl?.toFixed(2) || 0}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between text-[8px] text-gray-500">
        <span>Entrada: {trade.entryPrice?.toFixed(2)}</span>
        {!isOpen && <span>Saída: {trade.exitPrice?.toFixed(2)}</span>}
      </div>
      {!isOpen && trade.exitReason && (
        <div className="text-[8px] text-gray-600 mt-0.5">
          {trade.exitReason}
        </div>
      )}
    </div>
  );
}
