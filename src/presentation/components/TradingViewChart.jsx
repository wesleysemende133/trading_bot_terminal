import React from 'react';
import { AdvancedRealTimeChart } from 'react-ts-tradingview-widgets';

export default function TradingViewChart({ symbol }) {
  // O widget do TradingView precisa do formato "BINANCE:BTCUSDT"
  const tvSymbol = `BINANCE:${symbol.toUpperCase()}`;

  return (
    <div className="w-full h-full">
      <AdvancedRealTimeChart
        symbol={tvSymbol}
        theme="dark"
        locale="pt"
        autosize
        interval="15" // 15 minutos (igual ao teu bot)
        timezone="Etc/UTC"
        style="1" // 1 = Velas Japonesas (Candles)
        enable_publishing={false}
        hide_top_toolbar={false}
        hide_legend={false}
        save_image={false}
        container_id="tradingview_chart"
        // Adicionando os indicadores que queres ver
        studies={[
          "MAExp@tv-basicstudies", // EMA
          "RSI@tv-basicstudies",   // RSI
          "MACD@tv-basicstudies",  // MACD
          "Volume@tv-basicstudies" // Volume
        ]}
        // Ajustes de cores para ficar exatamente como a imagem
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
