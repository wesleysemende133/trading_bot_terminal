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

export default function ProChart({ symbol }) {
  const containerRef = useRef();
  const chartRef = useRef(null);
  const seriesRef = useRef({});
  const lastKlineRef = useRef(null);
  const positionLinesRef = useRef([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 1. Inicializar o grafico
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { color: '#131722' },
        textColor: '#d1d4dc',
        attributionLogo: false,
        panes: { separatorColor: '#2a2e39', separatorHoverColor: '#2962ff', enableResize: true },
      },
      grid: { vertLines: { color: '#1e222d' }, horzLines: { color: '#1e222d' } },
      crosshair: { mode: CrosshairMode.Normal },
      timeScale: { borderColor: '#2a2e39', timeVisible: true, secondsVisible: false },
      rightPriceScale: { borderColor: '#2a2e39', scaleMargins: { top: 0.05, bottom: 0.05 } },
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
    const bbUpper = chart.addSeries(LineSeries, { color: 'rgba(0, 230, 118, 0.4)', lineWidth: 1, title: 'BB Sup', lastValueVisible: true, priceLineVisible: true, priceLineStyle: LineStyle.Dashed, priceLineColor: 'rgba(0, 230, 118, 0.3)', crosshairMarkerVisible: false });
    const bbLower = chart.addSeries(LineSeries, { color: 'rgba(0, 230, 118, 0.4)', lineWidth: 1, title: 'BB Inf', lastValueVisible: true, priceLineVisible: true, priceLineStyle: LineStyle.Dashed, priceLineColor: 'rgba(0, 230, 118, 0.3)', crosshairMarkerVisible: false });
    const bbMiddle = chart.addSeries(LineSeries, { color: 'rgba(0, 230, 118, 0.25)', lineWidth: 1, lineStyle: LineStyle.Dashed, title: 'BB Media', lastValueVisible: true, priceLineVisible: true, priceLineStyle: LineStyle.Dotted, priceLineColor: 'rgba(0, 230, 118, 0.2)', crosshairMarkerVisible: false });

    const volume = chart.addSeries(HistogramSeries, { priceFormat: { type: 'volume' }, title: 'Volume', priceLineVisible: false });
    volume.moveToPane(1);
    volume.priceScale().applyOptions({ scaleMargins: { top: 0.1, bottom: 0 } });

    const rsi = chart.addSeries(LineSeries, { color: '#b39ddb', lineWidth: 2, title: 'RSI', priceLineVisible: false, lastValueVisible: false });
    rsi.moveToPane(2);
    rsi.createPriceLine({ price: 70, color: '#787b86', lineWidth: 1, lineStyle: LineStyle.Dashed, axisLabelVisible: true });
    rsi.createPriceLine({ price: 30, color: '#787b86', lineWidth: 1, lineStyle: LineStyle.Dashed, axisLabelVisible: true });

    const macdLine = chart.addSeries(LineSeries, { color: '#2962ff', lineWidth: 2, title: 'MACD', priceLineVisible: false, lastValueVisible: false });
    macdLine.moveToPane(3);
    const macdSignal = chart.addSeries(LineSeries, { color: '#ff6d00', lineWidth: 2, title: 'Signal', priceLineVisible: false, lastValueVisible: false });
    macdSignal.moveToPane(3);
    const macdHist = chart.addSeries(HistogramSeries, { title: 'Hist', priceLineVisible: false });
    macdHist.moveToPane(3);

    const adx = chart.addSeries(LineSeries, { color: '#ffab00', lineWidth: 2, title: 'ADX', priceLineVisible: false, lastValueVisible: false });
    adx.moveToPane(4);
    adx.createPriceLine({ price: 25, color: '#787b86', lineWidth: 1, lineStyle: LineStyle.Dashed, axisLabelVisible: true });
    adx.createPriceLine({ price: 35, color: '#f23645', lineWidth: 1, lineStyle: LineStyle.Dashed, axisLabelVisible: true });

    seriesRef.current = { candle, volume, ema9, ema21, bbUpper, bbLower, bbMiddle, rsi, macdLine, macdSignal, macdHist, adx };

    return () => { chart.remove(); chartRef.current = null; };
  }, []);

  // 2. Carregar dados historicos
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    lastKlineRef.current = null;

    Promise.all([
      KlinesApiClient.getKlines(symbol, 500),
      IndicatorsApiClient.getIndicators(symbol),
    ]).then(([klines, indicators]) => {
      if (!isMounted || klines.length === 0 || !seriesRef.current.candle) {
        setIsLoading(false);
        return;
      }
      const s = seriesRef.current;
      s.candle.setData(klines.map(k => ({ time: k.time, open: k.open, high: k.high, low: k.low, close: k.close })));
      s.volume.setData(klines.map(k => ({ time: k.time, value: k.volume, color: k.close > k.open ? '#08998180' : '#f2364580' })));

      if (indicators) {
        if (indicators.ema9?.length) s.ema9.setData(indicators.ema9);
        if (indicators.ema21?.length) s.ema21.setData(indicators.ema21);
        if (indicators.bollinger) {
          if (indicators.bollinger.upper?.length) s.bbUpper.setData(indicators.bollinger.upper);
          if (indicators.bollinger.middle?.length) s.bbMiddle.setData(indicators.bollinger.middle);
          if (indicators.bollinger.lower?.length) s.bbLower.setData(indicators.bollinger.lower);
        }
        if (indicators.rsi?.length) s.rsi.setData(indicators.rsi);
        if (indicators.macd) {
          if (indicators.macd.macdLine?.length) s.macdLine.setData(indicators.macd.macdLine);
          if (indicators.macd.signalLine?.length) s.macdSignal.setData(indicators.macd.signalLine);
          if (indicators.macd.histogram?.length) s.macdHist.setData(indicators.macd.histogram);
        }
        if (indicators.adx?.length) s.adx.setData(indicators.adx);
      }

      lastKlineRef.current = klines[klines.length - 1];
      chartRef.current.timeScale().scrollToRealTime();
      setIsLoading(false);
    });

    return () => { isMounted = false; };
  }, [symbol]);

  // 3. Atualizacao em tempo real (velas)
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

  // 4. Desenhar linhas das posicoes abertas (entrada, SL, TP)
  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/admin/positions/live');
        const data = await res.json();
        const pos = data.positions?.[symbol.toUpperCase()];

        // Limpar linhas antigas
        if (positionLinesRef.current.length > 0 && seriesRef.current.candle) {
          positionLinesRef.current.forEach(line => {
            try { seriesRef.current.candle.removePriceLine(line); } catch (e) {}
          });
          positionLinesRef.current = [];
        }

        if (!pos || !pos.entryPrice || !seriesRef.current.candle) return;

        // Linha de entrada (azul)
        const entryLine = seriesRef.current.candle.createPriceLine({
          price: pos.entryPrice,
          color: '#2962ff',
          lineWidth: 2,
          lineStyle: LineStyle.Solid,
          axisLabelVisible: true,
          title: 'Entry',
        });
        positionLinesRef.current.push(entryLine);

        // Linha de SL (vermelha)
        if (pos.stopLoss) {
          const slLine = seriesRef.current.candle.createPriceLine({
            price: pos.stopLoss,
            color: '#f23645',
            lineWidth: 1,
            lineStyle: LineStyle.Dashed,
            axisLabelVisible: true,
            title: 'SL',
          });
          positionLinesRef.current.push(slLine);
        }

        // Linha de TP (verde)
        if (pos.takeProfit) {
          const tpLine = seriesRef.current.candle.createPriceLine({
            price: pos.takeProfit,
            color: '#089981',
            lineWidth: 1,
            lineStyle: LineStyle.Dashed,
            axisLabelVisible: true,
            title: 'TP',
          });
          positionLinesRef.current.push(tpLine);
        }
      } catch (e) {
        // Ignorar erros de fetch
      }
    };

    fetchPositions();
    const interval = setInterval(fetchPositions, 2000);

    return () => {
      clearInterval(interval);
      if (positionLinesRef.current.length > 0 && seriesRef.current.candle) {
        positionLinesRef.current.forEach(line => {
          try { seriesRef.current.candle.removePriceLine(line); } catch (e) {}
        });
        positionLinesRef.current = [];
      }
    };
  }, [symbol]);

  // 5. Fullscreen
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

  return (
    <div className="relative w-full h-full flex flex-col">
      <div className="absolute top-2 right-2 z-20 flex items-center space-x-1 bg-tv-panel/90 backdrop-blur-sm border border-tv-border rounded px-1 py-1">
        <button onClick={handleZoomIn} className="p-1 hover:bg-tv-border rounded transition-colors" title="Zoom In">
          <ZoomIn className="w-3.5 h-3.5 text-gray-400 hover:text-white" />
        </button>
        <button onClick={handleZoomOut} className="p-1 hover:bg-tv-border rounded transition-colors" title="Zoom Out">
          <ZoomOut className="w-3.5 h-3.5 text-gray-400 hover:text-white" />
        </button>
        <button onClick={handleResetZoom} className="p-1 hover:bg-tv-border rounded transition-colors" title="Reset Zoom">
          <Maximize2 className="w-3.5 h-3.5 text-gray-400 hover:text-white" />
        </button>
        <div className="w-px h-4 bg-tv-border mx-0.5"></div>
        <button onClick={toggleFullscreen} className="p-1 hover:bg-tv-border rounded transition-colors" title="Fullscreen">
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-tv-blue" /> : <Maximize2 className="w-3.5 h-3.5 text-gray-400 hover:text-white" />}
        </button>
      </div>

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-tv-bg/50 z-10">
          <span className="text-gray-400 text-sm animate-pulse">A carregar dados e indicadores...</span>
        </div>
      )}
      <div ref={containerRef} className="w-full h-full bg-tv-bg" />
    </div>
  );
}
