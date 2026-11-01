import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Wallet, Lock, Activity } from 'lucide-react';

export function LivePositionsPanel() {
  const [data, setData] = useState({ positions: {}, count: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchPositions = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/admin/positions/live');
        if (!res.ok) throw new Error('Falha no fetch');
        const json = await res.json();
        if (isMounted) {
          setData(json);
          setLoading(false);
          setError(null);
        }
      } catch (e) {
        if (isMounted) {
          setError(e.message);
          setLoading(false);
        }
      }
    };

    fetchPositions();
    const interval = setInterval(fetchPositions, 1000);

    return () => { isMounted = false; clearInterval(interval); };
  }, []);

  if (loading) {
    return (
      <div className="bg-tv-panel p-4">
        <div className="text-xs text-gray-400 animate-pulse">A carregar posicoes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-tv-panel p-4">
        <div className="text-xs text-tv-red">Erro: {error}</div>
      </div>
    );
  }

  const positions = Object.values(data.positions || {});
  const available = data.availableCapital || 0;
  const reserved = data.reservedCapital || 0;
  const realized = data.realizedPnl || 0;
  const unrealized = data.unrealizedPnl || 0;
  const equity = data.totalEquity || 0;

  return (
    <div className="bg-tv-panel">
      <div className="px-4 py-2 flex items-center justify-between border-b border-tv-border">
        <div className="flex items-center space-x-2">
          <Activity className="w-3 h-3 text-tv-blue" />
          <span className="text-xs font-bold text-white">Posicoes Live</span>
        </div>
        <span className="text-[9px] text-gray-500">({positions.length})</span>
      </div>

      {/* Capital em tempo real */}
      <div className="grid grid-cols-2 gap-2 p-2 border-b border-tv-border">
        <div className="bg-tv-bg rounded p-1.5">
          <div className="flex items-center space-x-1">
            <Wallet className="w-2.5 h-2.5 text-tv-blue" />
            <span className="text-[8px] text-gray-500">Disponivel</span>
          </div>
          <div className="text-[10px] font-mono font-bold text-white">${available.toFixed(2)}</div>
        </div>
        <div className="bg-tv-bg rounded p-1.5">
          <div className="flex items-center space-x-1">
            <Lock className="w-2.5 h-2.5 text-yellow-500" />
            <span className="text-[8px] text-gray-500">Reservado</span>
          </div>
          <div className="text-[10px] font-mono font-bold text-yellow-500">${reserved.toFixed(2)}</div>
        </div>
        <div className="bg-tv-bg rounded p-1.5">
          <div className="flex items-center space-x-1">
            <TrendingUp className={`w-2.5 h-2.5 ${realized >= 0 ? 'text-tv-green' : 'text-tv-red'}`} />
            <span className="text-[8px] text-gray-500">PnL Realizado</span>
          </div>
          <div className={`text-[10px] font-mono font-bold ${realized >= 0 ? 'text-tv-green' : 'text-tv-red'}`}>
            {realized >= 0 ? '+' : ''}{realized.toFixed(2)}
          </div>
        </div>
        <div className="bg-tv-bg rounded p-1.5">
          <div className="flex items-center space-x-1">
            <Activity className={`w-2.5 h-2.5 ${unrealized >= 0 ? 'text-tv-green' : 'text-tv-red'}`} />
            <span className="text-[8px] text-gray-500">PnL Aberto</span>
          </div>
          <div className={`text-[10px] font-mono font-bold ${unrealized >= 0 ? 'text-tv-green' : 'text-tv-red'}`}>
            {unrealized >= 0 ? '+' : ''}{unrealized.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Equity total */}
      <div className="px-3 py-1.5 bg-tv-bg border-b border-tv-border">
        <div className="flex justify-between text-[9px]">
          <span className="text-gray-500">Equity Total</span>
          <span className="font-mono font-bold text-white">${equity.toFixed(2)}</span>
        </div>
      </div>

      {/* Lista de posicoes */}
      <div className="max-h-40 overflow-y-auto">
        {positions.length === 0 ? (
          <div className="px-4 py-2 text-[10px] text-gray-500">Sem posicoes abertas</div>
        ) : (
          positions.map((pos, idx) => (
            <div key={idx} className="px-3 py-1.5 border-b border-tv-border/30">
              <div className="flex items-center justify-between mb-0.5">
                <div className="flex items-center space-x-1">
                  {pos.side === 'BUY'
                    ? <TrendingUp className="w-2.5 h-2.5 text-tv-green" />
                    : <TrendingDown className="w-2.5 h-2.5 text-tv-red" />}
                  <span className="text-[10px] font-bold text-white">{pos.symbol}</span>
                  <span className="text-[8px] text-gray-500">{pos.side}</span>
                </div>
                <span className={`text-[10px] font-mono font-bold ${pos.unrealizedPnl >= 0 ? 'text-tv-green' : 'text-tv-red'}`}>
                  {pos.unrealizedPnl >= 0 ? '+' : ''}{(pos.unrealizedPnl || 0).toFixed(2)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1 text-[8px] text-gray-500">
                <span>Entrada: {pos.entryPrice?.toFixed(2)}</span>
                <span>SL: {pos.stopLoss?.toFixed(2)}</span>
                <span>Size: {pos.size?.toFixed(4)}</span>
                <span>TP: {pos.takeProfit?.toFixed(2)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
