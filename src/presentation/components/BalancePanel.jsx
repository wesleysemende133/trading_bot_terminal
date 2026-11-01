import React, { useEffect, useState } from 'react';
import { BalanceApiClient } from '../../infrastructure/http/BalanceApiClient';
import { Wallet, TrendingUp, TrendingDown, Lock } from 'lucide-react';

export function BalancePanel() {
  const [balance, setBalance] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchBalance = async () => {
      const data = await BalanceApiClient.getBalance();
      if (isMounted) {
        setBalance(data);
        setLoading(false);
      }
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 5000);
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

  const available = balance.availableBalance || 0;
  const reserved = balance.reservedCapital || 0;
  const realized = balance.realizedPnl || 0;
  const equity = balance.totalEquity || 0;
  const realizedPositive = realized >= 0;

  return (
    <div className="flex items-center space-x-4 text-xs">
      <div className="flex items-center space-x-1.5">
        <Wallet className="w-4 h-4 text-tv-blue" />
        <div>
          <div className="text-[9px] text-gray-500">Disponivel</div>
          <div className={`font-mono font-bold ${available >= 0 ? 'text-tv-green' : 'text-tv-red'}`}>
            ${available.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-1.5">
        <Lock className="w-4 h-4 text-yellow-500" />
        <div>
          <div className="text-[9px] text-gray-500">Reservado</div>
          <div className="font-mono font-bold text-yellow-500">${reserved.toFixed(2)}</div>
        </div>
      </div>

      <div className="flex items-center space-x-1.5">
        {realizedPositive
          ? <TrendingUp className="w-4 h-4 text-tv-green" />
          : <TrendingDown className="w-4 h-4 text-tv-red" />}
        <div>
          <div className="text-[9px] text-gray-500">PnL</div>
          <div className={`font-mono font-bold ${realizedPositive ? 'text-tv-green' : 'text-tv-red'}`}>
            {realizedPositive ? '+' : ''}{realized.toFixed(2)}
          </div>
        </div>
      </div>

      <div>
        <div className="text-[9px] text-gray-500">Equity</div>
        <div className="font-mono font-bold text-white">${equity.toFixed(2)}</div>
      </div>
    </div>
  );
}
