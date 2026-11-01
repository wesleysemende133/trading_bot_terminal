import React, { useEffect, useState } from 'react';
import { PerformanceApiClient } from '../../infrastructure/http/PerformanceApiClient';
import { TrendingUp, TrendingDown, Activity, DollarSign, BarChart3, Target } from 'lucide-react';
import EquityCurveChart from './EquityCurveChart';

export function PerformancePanel() {
  const [metrics, setMetrics] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchMetrics = async () => {
      const data = await PerformanceApiClient.getMetrics();
      if (isMounted) {
        setMetrics(data);
        setLoading(false);
      }
    };
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 15000);
    return () => { isMounted = false; clearInterval(interval); };
  }, []);

  if (loading) {
    return (
      <div className="p-4 bg-tv-panel border-b border-tv-border">
        <div className="text-xs text-gray-400 animate-pulse">A carregar performance...</div>
      </div>
    );
  }

  const pnlPositive = (metrics.totalPnl || 0) >= 0;

  return (
    <div className="bg-tv-panel border-b border-tv-border">
      <div className="px-4 py-3 flex items-center space-x-2 border-b border-tv-border">
        <BarChart3 className="w-4 h-4 text-tv-blue" />
        <span className="text-sm font-bold text-white">Performance</span>
      </div>

      <div className="grid grid-cols-2 gap-2 p-3">
        <MetricCard
          icon={pnlPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          label="PnL Total"
          value={`${pnlPositive ? '+' : ''}${metrics.totalPnl || 0}`}
          color={pnlPositive ? 'text-tv-green' : 'text-tv-red'}
        />
        <MetricCard
          icon={<Target className="w-3 h-3" />}
          label="Win Rate"
          value={`${metrics.winRate || 0}%`}
          color={(metrics.winRate || 0) >= 50 ? 'text-tv-green' : 'text-yellow-500'}
        />
        <MetricCard
          icon={<Activity className="w-3 h-3" />}
          label="Profit Factor"
          value={metrics.profitFactor || 0}
          color={(metrics.profitFactor || 0) >= 1.5 ? 'text-tv-green' : 'text-gray-400'}
        />
        <MetricCard
          icon={<DollarSign className="w-3 h-3" />}
          label="Max Drawdown"
          value={metrics.maxDrawdown || 0}
          color="text-tv-red"
        />
      </div>

      <div className="grid grid-cols-3 gap-2 px-3 pb-3 text-[10px]">
        <div className="text-center">
          <div className="text-gray-500">Trades</div>
          <div className="text-white font-mono font-bold">{metrics.totalTrades || 0}</div>
        </div>
        <div className="text-center">
          <div className="text-gray-500">Wins</div>
          <div className="text-tv-green font-mono font-bold">{metrics.wins || 0}</div>
        </div>
        <div className="text-center">
          <div className="text-gray-500">Losses</div>
          <div className="text-tv-red font-mono font-bold">{metrics.losses || 0}</div>
        </div>
      </div>

      <EquityCurveChart />
    </div>
  );
}

function MetricCard({ icon, label, value, color }) {
  return (
    <div className="bg-tv-bg rounded p-2 border border-tv-border/50">
      <div className="flex items-center space-x-1 mb-0.5">
        <span className={color}>{icon}</span>
        <span className="text-[9px] text-gray-500">{label}</span>
      </div>
      <div className={`text-sm font-mono font-bold ${color}`}>{value}</div>
    </div>
  );
}
