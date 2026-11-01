import React from 'react';
import { AdvancedRealTimeChart } from 'react-ts-tradingview-widgets';

export default function TradingViewWidget({ symbol }) {
  const tvSymbol = `BINANCE:${symbol.toUpperCase()}`;

  return (
    <div className="w-full h-full">
      <AdvancedRealTimeChart
        symbol={tvSymbol}
        theme="dark"
        locale="pt"
        autosize
        interval="15"
        timezone="Etc/UTC"
        style="1" // Velas Japonesas
        enable_publishing={false}
        hide_top_toolbar={false}
        hide_legend={false}
        save_image={false}
        container_id="tradingview_chart"
        // 🔥 TODOS OS INDICADORES DO TEU BOT
        studies={[
          "MAExp@tv-basicstudies",      // Média Móvel Exponencial (EMA)
          "MAExp@tv-basicstudies",      // Segunda EMA (para 9 e 21)
          "BB@tv-basicstudies",         // Bandas de Bollinger
          "MACD@tv-basicstudies",       // MACD
          "RSI@tv-basicstudies",        // RSI
          "ADX@tv-basicstudies",        // ADX (Força da tendência)
          "Volume@tv-basicstudies"      // Volume
        ]}
        overrides={{
          "paneProperties.background": "#131722",
          "paneProperties.vertGridProperties.color": "#1e222d",
          "paneProperties.horzGridProperties.color": "#1e222d",
          "scalesProperties.textColor": "#d1d4dc",
          "mainSeriesProperties.candleStyle.upColor": "#089981",
          "mainSeriesProperties.candleStyle.downColor": "#f23645",
          "mainSeriesProperties.candleStyle.borderUpColor": "#089981",
          "mainSeriesProperties.candleStyle.borderDownColor": "#f23645",
          "mainSeriesProperties.candleStyle.wickUpColor": "#089981",
          "mainSeriesProperties.candleStyle.wickDownColor": "#f23645",
        }}
      />
    </div>
  );
}
