import React, { useEffect, useRef, useState } from 'react';
import { createChart, LineSeries, AreaSeries, LineStyle, CrosshairMode } from 'lightweight-charts';
import { PerformanceApiClient } from '../../infrastructure/http/PerformanceApiClient';
import { TrendingUp } from 'lucide-react';

export default function EquityCurveChart() {
  const containerRef = useRef();
  const chartRef = useRef(null);
  const lineSeriesRef = useRef(null);
  const areaSeriesRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { color: '#131722' },
        textColor: '#d1d4dc',
        attributionLogo: false, // 🔥 Esconde o logotipo do TradingView
      },
      grid: {
        vertLines: { color: '#1e222d' },
        horzLines: { color: '#1e222d' },
      },
      crosshair: { mode: CrosshairMode.Normal },
      timeScale: { borderColor: '#2a2e39', timeVisible: true, secondsVisible: false },
      rightPriceScale: { borderColor: '#2a2e39' },
      autoSize: true,
    });
    chartRef.current = chart;

    const areaSeries = chart.addSeries(AreaSeries, {
      lineColor: '#089981',
      topColor: 'rgba(8, 153, 129, 0.4)',
      bottomColor: 'rgba(8, 153, 129, 0.0)',
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: true,
    });
    areaSeriesRef.current = areaSeries;

    const lineSeries = chart.addSeries(LineSeries, {
      color: '#089981',
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: true,
    });
    lineSeriesRef.current = lineSeries;

    areaSeries.createPriceLine({
      price: 0,
      color: '#787b86',
      lineWidth: 1,
      lineStyle: LineStyle.Dashed,
      axisLabelVisible: false,
    });

    return () => { chart.remove(); chartRef.current = null; };
  }, []);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    PerformanceApiClient.getEquityCurve().then((curve) => {
      if (!isMounted || !lineSeriesRef.current || !curve || curve.length === 0) {
        setIsLoading(false);
        return;
      }

      const formatted = curve.map((point) => ({
        time: Math.floor(new Date(point.time).getTime() / 1000),
        value: point.cumulativePnl,
      }));

      lineSeriesRef.current.setData(formatted);
      areaSeriesRef.current.setData(formatted);

      const finalPnl = formatted[formatted.length - 1].value;
      const color = finalPnl >= 0 ? '#089981' : '#f23645';
      const colorRgba = finalPnl >= 0 ? 'rgba(8, 153, 129, 0.4)' : 'rgba(242, 54, 69, 0.4)';
      const colorZero = finalPnl >= 0 ? 'rgba(8, 153, 129, 0.0)' : 'rgba(242, 54, 69, 0.0)';

      areaSeriesRef.current.applyOptions({ lineColor: color, topColor: colorRgba, bottomColor: colorZero });
      lineSeriesRef.current.applyOptions({ color });

      chartRef.current.timeScale().fitContent();
      setIsLoading(false);
    });

    return () => { isMounted = false; };
  }, []);

  return (
    <div className="bg-tv-panel border-b border-tv-border">
      <div className="px-4 py-2 flex items-center justify-between border-b border-tv-border">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-3 h-3 text-tv-blue" />
          <span className="text-xs font-bold text-white">Equity Curve</span>
        </div>
        <span className="text-[9px] text-gray-500">PnL acumulado</span>
      </div>
      <div className="relative w-full" style={{ height: '180px' }}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-tv-bg/50 z-10">
            <span className="text-gray-400 text-xs animate-pulse">A carregar...</span>
          </div>
        )}
        <div ref={containerRef} className="w-full h-full" />
      </div>
    </div>
  );
}
