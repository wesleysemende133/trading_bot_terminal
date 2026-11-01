import React, { useEffect, useRef, useState } from 'react';
import {
  createChart,
  CandlestickSeries,
  HistogramSeries,
  LineSeries,
  CrosshairMode,
  LineStyle
} from 'lightweight-charts';
import { KlinesApiClient } from '../../infrastructure/http/KlinesApiClient';
import { IndicatorsApiClient } from '../../infrastructure/http/IndicatorsApiClient';
import { TradingSocketClient } from '../../infrastructure/websocket/TradingSocketClient';
import { ZoomIn, ZoomOut, Maximize2, Minimize2 } from 'lucide-react';

export default function ProChartFocused({ symbol }) {
  const containerRef = useRef();
  const chartRef = useRef(null);
  const seriesRef = useRef({});
  const lastKlineRef = useRef(null);
  const positionLinesRef = useRef([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [indicators, setIndicators] = useState({ rsi: null, macd: null, adx: null, ema9: null, ema21: null });

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: { background: { color: '#131722' }, textColor: '#d1d4dc', attributionLogo: false },
      grid: { vertLines: { color: '#1e222d' }, horzLines: { color: '#1e222d' } },
      crosshair: { mode: CrosshairMode.Normal },
      timeScale: { borderColor: '#2a2e39', timeVisible: true, secondsVisible: false },
      rightPriceScale: { borderColor: '#2a2e39', scaleMargins: { top: 0.1, bottom: 0.2 } },
      autoSize: true,
      handleScroll: { mouseWheel: true, pressedMouseMove: true, horzTouchDrag: true, vertTouchDrag: false },
      handleScale: { axisPressedMouseMove: true, mouseWheel: true, pinch: true },
    });
    chartRef.current = chart;

    const candle = chart.addSeries(CandlestickSeries, {
      upColor: '#089981', downColor: '#f23645', borderVisible: false,
      wickUpColor: '#089981', wickDownColor: '#f23645',
    });
    const ema9 = chart.addSeries(LineSeries, { color: '#ffeb3b', lineWidth: 2, title: 'EMA9', priceLineVisible: false, lastValueVisible: false });
    const ema21 = chart.addSeries(LineSeries, { color: '#2962ff', lineWidth: 2, title: 'EMA21', priceLineVisible: false, lastValueVisible: false });
    const bbUpper = chart.addSeries(LineSeries, { color: 'rgba(0, 230, 118, 0.4)', lineWidth: 1, lastValueVisible: false, priceLineVisible: false, crosshairMarkerVisible: false });
    const bbLower = chart.addSeries(LineSeries, { color: 'rgba(0, 230, 118, 0.4)', lineWidth: 1, lastValueVisible: false, priceLineVisible: false, crosshairMarkerVisible: false });
    const bbMiddle = chart.addSeries(LineSeries, { color: 'rgba(0, 230, 118, 0.25)', lineWidth: 1, lineStyle: LineStyle.Dashed, lastValueVisible: false, priceLineVisible: false, crosshairMarkerVisible: false });
    const volume = chart.addSeries(HistogramSeries, { priceFormat: { type: 'volume' }, priceScaleId: 'volume', priceLineVisible: false });
    volume.priceScale().applyOptions({ scaleMargins: { top: 0.85, bottom: 0 } });

    seriesRef.current = { candle, ema9, ema21, bbUpper, bbLower, bbMiddle, volume };
    return () => { chart.remove(); chartRef.current = null; };
  }, []);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    lastKlineRef.current = null;

    Promise.all([
      KlinesApiClient.getKlines(symbol, 500),
      IndicatorsApiClient.getIndicators(symbol),
    ]).then(([klines, ind]) => {
      if (!isMounted || klines.length === 0 || !seriesRef.current.candle) {
        setIsLoading(false);
        return;
      }
      const s = seriesRef.current;
      s.candle.setData(klines.map(k => ({ time: k.time, open: k.open, high: k.high, low: k.low, close: k.close })));
      s.volume.setData(klines.map(k => ({ time: k.time, value: k.volume, color: k.close > k.open ? '#08998180' : '#f2364580' })));

      if (ind) {
        if (ind.ema9?.length) s.ema9.setData(ind.ema9);
        if (ind.ema21?.length) s.ema21.setData(ind.ema21);
        if (ind.bollinger) {
          if (ind.bollinger.upper?.length) s.bbUpper.setData(ind.bollinger.upper);
          if (ind.bollinger.middle?.length) s.bbMiddle.setData(ind.bollinger.middle);
          if (ind.bollinger.lower?.length) s.bbLower.setData(ind.bollinger.lower);
        }
        setIndicators({
          rsi: ind.rsi?.length ? ind.rsi[ind.rsi.length - 1].value : null,
          macd: ind.macd?.histogram?.length ? ind.macd.histogram[ind.macd.histogram.length - 1].value : null,
          adx: ind.adx?.length ? ind.adx[ind.adx.length - 1].value : null,
          ema9: ind.ema9?.length ? ind.ema9[ind.ema9.length - 1].value : null,
          ema21: ind.ema21?.length ? ind.ema21[ind.ema21.length - 1].value : null,
        });
      }

      lastKlineRef.current = klines[klines.length - 1];
      chartRef.current.timeScale().scrollToRealTime();
      setIsLoading(false);
    });

    return () => { isMounted = false; };
  }, [symbol]);

  useEffect(() => {
    const client = TradingSocketClient.getInstance();
    const unsubscribe = client.subscribe((message) => {
      if (message.type !== 'kline_live') return;
      if (message.symbol.toLowerCase() !== symbol.toLowerCase()) return;
      if (!seriesRef.current.candle) return;

      const kline = { time: message.time, open: message.open, high: message.high, low: message.low, close: message.close, volume: message.volume };
      const last = lastKlineRef.current;
      if (last && kline.time < last.time) return;

      seriesRef.current.candle.update(kline);
      seriesRef.current.volume.update({ time: kline.time, value: kline.volume, color: kline.close > kline.open ? '#08998180' : '#f2364580' });
      lastKlineRef.current = kline;
    });
    return () => unsubscribe();
  }, [symbol]);

  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/admin/positions/live');
        const data = await res.json();
        const pos = data.positions?.[symbol.toUpperCase()];

        if (positionLinesRef.current.length > 0 && seriesRef.current.candle) {
          positionLinesRef.current.forEach(line => {
            try { seriesRef.current.candle.removePriceLine(line); } catch (e) {}
          });
          positionLinesRef.current = [];
        }

        if (!pos || !pos.entryPrice || !seriesRef.current.candle) return;

        const entryLine = seriesRef.current.candle.createPriceLine({ price: pos.entryPrice, color: '#2962ff', lineWidth: 2, lineStyle: LineStyle.Solid, axisLabelVisible: true, title: 'Entry' });
        positionLinesRef.current.push(entryLine);
        if (pos.stopLoss) {
          const slLine = seriesRef.current.candle.createPriceLine({ price: pos.stopLoss, color: '#f23645', lineWidth: 1, lineStyle: LineStyle.Dashed, axisLabelVisible: true, title: 'SL' });
          positionLinesRef.current.push(slLine);
        }
        if (pos.takeProfit) {
          const tpLine = seriesRef.current.candle.createPriceLine({ price: pos.takeProfit, color: '#089981', lineWidth: 1, lineStyle: LineStyle.Dashed, axisLabelVisible: true, title: 'TP' });
          positionLinesRef.current.push(tpLine);
        }
      } catch (e) {}
    };
    fetchPositions();
    const interval = setInterval(fetchPositions, 2000);
    return () => { clearInterval(interval); };
  }, [symbol]);

  const toggleFullscreen = () => {
    const container = containerRef.current?.parentElement?.parentElement;
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      if (chartRef.current) setTimeout(() => chartRef.current.timeScale().fitContent(), 100);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const handleZoomIn = () => {
    if (!chartRef.current) return;
    const range = chartRef.current.timeScale().getVisibleLogicalRange();
    if (range) {
      const mid = (range.from + range.to) / 2;
      const newRange = (range.to - range.from) * 0.8;
      chartRef.current.timeScale().setVisibleLogicalRange({ from: mid - newRange / 2, to: mid + newRange / 2 });
    }
  };

  const handleZoomOut = () => {
    if (!chartRef.current) return;
    const range = chartRef.current.timeScale().getVisibleLogicalRange();
    if (range) {
      const mid = (range.from + range.to) / 2;
      const newRange = (range.to - range.from) * 1.2;
      chartRef.current.timeScale().setVisibleLogicalRange({ from: mid - newRange / 2, to: mid + newRange / 2 });
    }
  };

  const handleResetZoom = () => {
    if (!chartRef.current) return;
    chartRef.current.timeScale().fitContent();
  };

  const MiniIndicator = ({ label, value, thresholds = null }) => {
    const displayValue = typeof value === 'number' ? value.toFixed(1) : '--';
    const getColor = () => {
      if (!thresholds) return 'text-tv-text';
      if (thresholds.over && value > thresholds.over) return 'text-tv-red';
      if (thresholds.under && value < thresholds.under) return 'text-tv-green';
      return 'text-tv-text';
    };
    return (
      <div className="flex flex-col items-center justify-center px-2 py-1 bg-tv-panel border border-tv-border rounded min-w-[60px]">
        <div className="text-[9px] text-gray-500 uppercase">{label}</div>
        <div className={`text-xs font-mono font-bold ${getColor()}`}>{displayValue}</div>
      </div>
    );
  };

  return (
    <div className="relative w-full h-full flex flex-col">
      <div className="absolute top-2 right-2 z-20 flex items-center space-x-1 bg-tv-panel/90 backdrop-blur-sm border border-tv-border rounded px-1 py-1">
        <button onClick={handleZoomIn} className="p-1 hover:bg-tv-border rounded" title="Zoom In"><ZoomIn className="w-3.5 h-3.5 text-gray-400 hover:text-white" /></button>
        <button onClick={handleZoomOut} className="p-1 hover:bg-tv-border rounded" title="Zoom Out"><ZoomOut className="w-3.5 h-3.5 text-gray-400 hover:text-white" /></button>
        <button onClick={handleResetZoom} className="p-1 hover:bg-tv-border rounded" title="Reset"><Maximize2 className="w-3.5 h-3.5 text-gray-400 hover:text-white" /></button>
        <div className="w-px h-4 bg-tv-border mx-0.5"></div>
        <button onClick={toggleFullscreen} className="p-1 hover:bg-tv-border rounded" title="Fullscreen">
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-tv-blue" /> : <Maximize2 className="w-3.5 h-3.5 text-gray-400 hover:text-white" />}
        </button>
      </div>

      <div className="absolute top-2 left-2 z-20 flex items-center space-x-1">
        <MiniIndicator label="RSI" value={indicators.rsi} thresholds={{ over: 70, under: 30 }} />
        <MiniIndicator label="ADX" value={indicators.adx} thresholds={{ over: 35 }} />
        <MiniIndicator label="MACD" value={indicators.macd} />
        <MiniIndicator label="EMA9" value={indicators.ema9} />
        <MiniIndicator label="EMA21" value={indicators.ema21} />
      </div>

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-tv-bg/50 z-10">
          <span className="text-gray-400 text-sm animate-pulse">A carregar...</span>
        </div>
      )}
      <div ref={containerRef} className="w-full h-full bg-tv-bg" />
    </div>
  );
}
