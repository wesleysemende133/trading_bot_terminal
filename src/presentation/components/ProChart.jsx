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

export default function ProChart({ symbol }) {
  const containerRef = useRef();
  const chartRef = useRef(null);
  const seriesRef = useRef({});
  const lastKlineRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { color: '#131722' },
        textColor: '#d1d4dc',
        attributionLogo: false, // 🔥 Esconde o logotipo do TradingView
        panes: {
          separatorColor: '#2a2e39',
          separatorHoverColor: '#2962ff',
          enableResize: true,
        },
      },
      grid: {
        vertLines: { color: '#1e222d' },
        horzLines: { color: '#1e222d' },
      },
      crosshair: { mode: CrosshairMode.Normal },
      timeScale: { borderColor: '#2a2e39', timeVisible: true, secondsVisible: false },
      rightPriceScale: { borderColor: '#2a2e39', scaleMargins: { top: 0.05, bottom: 0.05 } },
      autoSize: true,
    });
    chartRef.current = chart;

    const candle = chart.addSeries(CandlestickSeries, {
      upColor: '#089981', downColor: '#f23645', borderVisible: false,
      wickUpColor: '#089981', wickDownColor: '#f23645',
    });
    const ema9 = chart.addSeries(LineSeries, {
      color: '#ffeb3b', lineWidth: 2, title: 'EMA9',
      priceLineVisible: false, lastValueVisible: false,
    });
    const ema21 = chart.addSeries(LineSeries, {
      color: '#2962ff', lineWidth: 2, title: 'EMA21',
      priceLineVisible: false, lastValueVisible: false,
    });

    const bbUpper = chart.addSeries(LineSeries, {
      color: 'rgba(0, 230, 118, 0.4)', lineWidth: 1, title: 'BB Sup',
      lastValueVisible: true, priceLineVisible: true, priceLineStyle: LineStyle.Dashed,
      priceLineColor: 'rgba(0, 230, 118, 0.3)', priceFormat: { type: 'price', precision: 2, minMove: 0.01 },
      crosshairMarkerVisible: false,
    });
    const bbLower = chart.addSeries(LineSeries, {
      color: 'rgba(0, 230, 118, 0.4)', lineWidth: 1, title: 'BB Inf',
      lastValueVisible: true, priceLineVisible: true, priceLineStyle: LineStyle.Dashed,
      priceLineColor: 'rgba(0, 230, 118, 0.3)', priceFormat: { type: 'price', precision: 2, minMove: 0.01 },
      crosshairMarkerVisible: false,
    });
    const bbMiddle = chart.addSeries(LineSeries, {
      color: 'rgba(0, 230, 118, 0.25)', lineWidth: 1, lineStyle: LineStyle.Dashed, title: 'BB Média',
      lastValueVisible: true, priceLineVisible: true, priceLineStyle: LineStyle.Dotted,
      priceLineColor: 'rgba(0, 230, 118, 0.2)', priceFormat: { type: 'price', precision: 2, minMove: 0.01 },
      crosshairMarkerVisible: false,
    });

    const volume = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' }, title: 'Volume', priceLineVisible: false,
    });
    volume.moveToPane(1);
    volume.priceScale().applyOptions({ scaleMargins: { top: 0.1, bottom: 0 } });

    const rsi = chart.addSeries(LineSeries, {
      color: '#b39ddb', lineWidth: 2, title: 'RSI',
      priceLineVisible: false, lastValueVisible: false,
    });
    rsi.moveToPane(2);
    rsi.createPriceLine({ price: 70, color: '#787b86', lineWidth: 1, lineStyle: LineStyle.Dashed, axisLabelVisible: true });
    rsi.createPriceLine({ price: 30, color: '#787b86', lineWidth: 1, lineStyle: LineStyle.Dashed, axisLabelVisible: true });

    const macdLine = chart.addSeries(LineSeries, {
      color: '#2962ff', lineWidth: 2, title: 'MACD',
      priceLineVisible: false, lastValueVisible: false,
    });
    macdLine.moveToPane(3);
    const macdSignal = chart.addSeries(LineSeries, {
      color: '#ff6d00', lineWidth: 2, title: 'Signal',
      priceLineVisible: false, lastValueVisible: false,
    });
    macdSignal.moveToPane(3);
    const macdHist = chart.addSeries(HistogramSeries, { title: 'Hist', priceLineVisible: false });
    macdHist.moveToPane(3);

    const adx = chart.addSeries(LineSeries, {
      color: '#ffab00', lineWidth: 2, title: 'ADX',
      priceLineVisible: false, lastValueVisible: false,
    });
    adx.moveToPane(4);
    adx.createPriceLine({ price: 25, color: '#787b86', lineWidth: 1, lineStyle: LineStyle.Dashed, axisLabelVisible: true });
    adx.createPriceLine({ price: 35, color: '#f23645', lineWidth: 1, lineStyle: LineStyle.Dashed, axisLabelVisible: true });

    seriesRef.current = {
      candle, volume, ema9, ema21, bbUpper, bbLower, bbMiddle,
      rsi, macdLine, macdSignal, macdHist, adx,
    };

    return () => { chart.remove(); chartRef.current = null; };
  }, []);

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

  useEffect(() => {
    const client = TradingSocketClient.getInstance();
    const unsubscribe = client.subscribe((message) => {
      if (message.type !== 'kline_live') return;
      if (message.symbol.toLowerCase() !== symbol.toLowerCase()) return;
      if (!seriesRef.current.candle) return;

      const kline = {
        time: message.time, open: message.open, high: message.high,
        low: message.low, close: message.close, volume: message.volume,
      };

      const last = lastKlineRef.current;
      if (last && kline.time < last.time) return;

      seriesRef.current.candle.update(kline);
      seriesRef.current.volume.update({
        time: kline.time, value: kline.volume,
        color: kline.close > kline.open ? '#08998180' : '#f2364580',
      });
      lastKlineRef.current = kline;
    });
    return () => unsubscribe();
  }, [symbol]);

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-tv-bg/50 z-10">
          <span className="text-gray-400 text-sm animate-pulse">A carregar dados e indicadores...</span>
        </div>
      )}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
