import React, { useEffect, useState } from 'react';
import { MarketAnalysisClient } from '../../infrastructure/http/MarketAnalysisClient';
import { TrendingUp, TrendingDown, Minus, Info, ChevronDown, ChevronUp } from 'lucide-react';

export function MarketAnalysisPanel({ symbol }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const fetchAnalysis = () => {
      MarketAnalysisClient.getAnalysis(symbol).then((data) => {
        if (isMounted) {
          setAnalysis(data);
          setLoading(false);
        }
      });
    };

    fetchAnalysis();
    const interval = setInterval(fetchAnalysis, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [symbol]);

  if (loading) {
    return (
      <div className="p-4 bg-tv-panel border-b border-tv-border">
        <div className="text-xs text-gray-400 animate-pulse">A analisar mercado...</div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="p-4 bg-tv-panel border-b border-tv-border">
        <div className="text-xs text-gray-400">Sem análise disponível.</div>
      </div>
    );
  }

  const getTrendIcon = () => {
    if (analysis.trend === 'ALTA') return <TrendingUp className="w-4 h-4 text-tv-green" />;
    if (analysis.trend === 'BAIXA') return <TrendingDown className="w-4 h-4 text-tv-red" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getSentimentColor = () => {
    if (analysis.bias === 'SOBRECOMPRADO') return 'text-tv-red';
    if (analysis.bias === 'SOBREVENDIDO') return 'text-tv-green';
    return 'text-gray-400';
  };

  const details = analysis.details || {};

  return (
    <div className="bg-tv-panel border-b border-tv-border">
      {/* Cabeçalho com resumo (sempre visível) */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <Info className="w-4 h-4 text-tv-blue mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                {getTrendIcon()}
                <span className={`text-xs font-bold ${getSentimentColor()}`}>
                  {analysis.bias || 'NEUTRAL'}
                </span>
                {analysis.trend && (
                  <span className="text-[10px] text-gray-500">
                    • {analysis.trend} ({analysis.trendStrength || '---'})
                  </span>
                )}
              </div>
              <p className="text-xs text-tv-text leading-relaxed">
                {analysis.description}
              </p>
            </div>
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center space-x-1 text-[10px] text-tv-blue hover:text-white transition-colors ml-3 mt-0.5 flex-shrink-0"
          >
            <span>{expanded ? 'Ver menos' : 'Ver detalhes'}</span>
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Painel expandido — com altura máxima e scroll interno */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-tv-border pt-3 max-h-56 overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <IndicatorCell label="RSI" value={details.rsi} status={details.rsiStatus} />
            <IndicatorCell label="ADX" value={details.adx} status={details.adxStatus} />
            <IndicatorCell label="MACD Hist" value={details.macdHist} status={details.momentum} />
            <IndicatorCell label="EMA9" value={details.ema9} />
            <IndicatorCell label="EMA21" value={details.ema21} />
            <IndicatorCell label="MACD Line" value={details.macdLine} />
            <IndicatorCell label="BB Sup" value={details.bbUpper} />
            <IndicatorCell label="BB Média" value={details.bbMiddle} />
            <IndicatorCell label="BB Inf" value={details.bbLower} />
          </div>
        </div>
      )}
    </div>
  );
}

function IndicatorCell({ label, value, status }) {
  const formatted = typeof value === 'number' ? value.toFixed(2) : '---';
  return (
    <div className="bg-tv-bg rounded p-2 border border-tv-border/50">
      <div className="text-[10px] text-gray-500 mb-0.5">{label}</div>
      <div className="text-xs text-white font-mono font-bold">{formatted}</div>
      {status && (
        <div className="text-[9px] text-tv-blue mt-0.5">{status}</div>
      )}
    </div>
  );
}
