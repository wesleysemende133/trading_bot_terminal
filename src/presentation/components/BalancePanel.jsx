import React, { useEffect, useState } from 'react';
import { Wallet, Lock, TrendingUp, TrendingDown } from 'lucide-react';

export function BalancePanel() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/admin/positions/live');
        if (!res.ok) throw new Error('Falha');
        const json = await res.json();
        if (isMounted) {
          setData(json);
          setLoading(false);
        }
      } catch (e) {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 1000); // 1s - tempo real

    return () => { isMounted = false; clearInterval(interval); };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-xs text-gray-400">
        <Wallet className="w-4 h-4" />
        <span>A carregar...</span>
      </div>
    );
  }

  const available = data.availableCapital || 0;
  const reserved = data.reservedCapital || 0;
  const realized = data.realizedPnl || 0;
  const unrealized = data.unrealizedPnl || 0;
  const equity = data.totalEquity || 0;

  const realizedPositive = realized >= 0;
  const unrealizedPositive = unrealized >= 0;

  return (
    <div className="flex items-center space-x-4 text-xs">
      {/* Disponivel */}
      <div className="flex items-center space-x-1.5">
        <Wallet className="w-4 h-4 text-tv-blue" />
        <div>
          <div className="text-[9px] text-gray-500">Disponivel</div>
          <div className={`font-mono font-bold ${available >= 0 ? 'text-tv-green' : 'text-tv-red'}`}>
            ${available.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Reservado */}
      <div className="flex items-center space-x-1.5">
        <Lock className="w-4 h-4 text-yellow-500" />
        <div>
          <div className="text-[9px] text-gray-500">Reservado</div>
          <div className="font-mono font-bold text-yellow-500">
            ${reserved.toFixed(2)}
          </div>
        </div>
      </div>

      {/* PnL Realizado */}
      <div className="flex items-center space-x-1.5">
        {realizedPositive
          ? <TrendingUp className="w-4 h-4 text-tv-green" />
          : <TrendingDown className="w-4 h-4 text-tv-red" />}
        <div>
          <div className="text-[9px] text-gray-500">PnL Real.</div>
          <div className={`font-mono font-bold ${realizedPositive ? 'text-tv-green' : 'text-tv-red'}`}>
            {realizedPositive ? '+' : ''}{realized.toFixed(2)}
          </div>
        </div>
      </div>

      {/* PnL Aberto */}
      <div className="flex items-center space-x-1.5">
        {unrealizedPositive
          ? <TrendingUp className="w-4 h-4 text-tv-green" />
          : <TrendingDown className="w-4 h-4 text-tv-red" />}
        <div>
          <div className="text-[9px] text-gray-500">PnL Aberto</div>
          <div className={`font-mono font-bold ${unrealizedPositive ? 'text-tv-green' : 'text-tv-red'}`}>
            {unrealizedPositive ? '+' : ''}{unrealized.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Equity Total */}
      <div>
        <div className="text-[9px] text-gray-500">Equity</div>
        <div className="font-mono font-bold text-white">
          ${equity.toFixed(2)}
        </div>
      </div>
    </div>
  );
}
