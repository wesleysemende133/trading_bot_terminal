import React, { useEffect, useState } from 'react';
import { PositionsApiClient } from '../../infrastructure/http/PositionsApiClient';
import { TrendingUp, TrendingDown, Clock } from 'lucide-react';

export function OpenPositionsPanel() {
  const [positions, setPositions] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchPositions = async () => {
      const data = await PositionsApiClient.getPositions();
      if (isMounted) {
        setPositions(data.positions || {});
        setLoading(false);
      }
    };

    fetchPositions();
    const interval = setInterval(fetchPositions, 3000);

    return () => { isMounted = false; clearInterval(interval); };
  }, []);

  const openPositions = Object.values(positions).filter(p => p.isOpen);

  if (loading) {
    return (
      <div className="bg-tv-panel border-b border-tv-border p-4">
        <div className="text-xs text-gray-400 animate-pulse">A carregar posicoes...</div>
      </div>
    );
  }

  return (
    <div className="bg-tv-panel border-b border-tv-border">
      <div className="px-4 py-2 flex items-center justify-between border-b border-tv-border">
        <div className="flex items-center space-x-2">
          <Clock className="w-3 h-3 text-tv-blue" />
          <span className="text-xs font-bold text-white">Posicoes Abertas</span>
        </div>
        <span className="text-[9px] text-gray-500">({openPositions.length})</span>
      </div>

      <div className="max-h-48 overflow-y-auto">
        {openPositions.length === 0 ? (
          <div className="px-4 py-3 text-xs text-gray-500">Sem posicoes abertas.</div>
        ) : (
          openPositions.map((pos, idx) => (
            <div key={idx} className="px-3 py-2 border-b border-tv-border/30">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-1.5">
                  {pos.side === 'BUY'
                    ? <TrendingUp className="w-3 h-3 text-tv-green" />
                    : <TrendingDown className="w-3 h-3 text-tv-red" />}
                  <span className="text-[10px] font-bold text-white">{pos.symbol}</span>
                  <span className="text-[8px] text-gray-500">{pos.side}</span>
                </div>
                <span className="text-[8px] px-1 py-0.5 bg-tv-blue/20 text-tv-blue rounded">ABERTA</span>
              </div>
              <div className="grid grid-cols-2 gap-1 text-[9px] text-gray-400">
                <span>Entrada: {pos.entryPrice?.toFixed(2)}</span>
                <span>Size: {pos.size?.toFixed(4)}</span>
                <span>SL: {pos.stopLoss?.toFixed(2)}</span>
                <span>TP: {pos.takeProfit?.toFixed(2)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
