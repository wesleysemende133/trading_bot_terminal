import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export function SignalCard({ signal }) {
  const isBuy = signal.action === 'BUY';
  const isSell = signal.action === 'SELL';
  
  const colors = isBuy ? 'text-tv-green border-tv-green/30 bg-tv-green/10' 
               : isSell ? 'text-tv-red border-tv-red/30 bg-tv-red/10' 
               : 'text-gray-400 border-gray-500/30 bg-gray-500/10';

  const Icon = isBuy ? TrendingUp : isSell ? TrendingDown : Minus;
  const barColor = isBuy ? 'bg-tv-green' : isSell ? 'bg-tv-red' : 'bg-gray-500';

  return (
    <div className={`p-3 rounded border ${colors} transition-all duration-200`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Icon className="w-4 h-4" />
          <span className="font-bold text-white text-sm">{signal.symbol}</span>
        </div>
        <span className="text-xs font-bold">{signal.action}</span>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-xs mb-2">
        <div>
          <span className="text-gray-400">Preço: </span>
          <span className="text-white font-mono">{signal.price?.toFixed(2) || '---'}</span>
        </div>
        <div>
          <span className="text-gray-400">Força: </span>
          <span className="text-white font-mono">{signal.strength?.toFixed(1) || 0}%</span>
        </div>
      </div>

      <div className="w-full bg-black/30 h-1.5 rounded overflow-hidden">
        <div className={`h-full ${barColor}`} style={{ width: `${signal.strength || 0}%` }} />
      </div>
    </div>
  );
}
