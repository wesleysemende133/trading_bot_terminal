# Algo Trader Pro - Frontend

Dashboard profissional para o bot de trading em Java. Construido com React, Vite, Tailwind CSS e lightweight-charts.

## Funcionalidades

- Grafico de velas com 5 paineis: Velas + EMA + Bollinger, Volume, RSI, MACD e ADX.
- Analise de mercado descritiva (RSI, ADX, MACD traduzidos em texto).
- Sinais do bot em tempo real via WebSocket.
- Historico de trades com PnL.
- Painel de performance com metricas (win rate, profit factor, drawdown).
- Grafico de equity curve (evolucao do PnL acumulado).
- Noticias de cripto (via Free Crypto News API).
- Controlo do bot (pausar/retomar/parar) no header.
- Lista de pares com precos em tempo real.

## Stack Tecnologico

| Tecnologia | Versao | Funcao |
| :--- | :--- | :--- |
| React | 19 | UI |
| Vite | 6+ | Build tool |
| Tailwind CSS | 3.4 | Estilizacao |
| lightweight-charts | 5.0 | Graficos |
| Zustand | 5+ | Estado global |
| Lucide React | - | Icones |

## Estrutura do Projeto

    trading_terminal/
    +-- src/
    |   +-- application/
    |   |   +-- hooks/
    |   |   |   +-- useTradingEngine.js
    |   |   +-- store/
    |   |       +-- useMarketStore.js
    |   +-- core/
    |   |   +-- entities/
    |   |       +-- Signal.js
    |   +-- infrastructure/
    |   |   +-- http/
    |   |   |   +-- IndicatorsApiClient.js
    |   |   |   +-- KlinesApiClient.js
    |   |   |   +-- MarketAnalysisClient.js
    |   |   |   +-- NewsApiClient.js
    |   |   |   +-- PerformanceApiClient.js
    |   |   |   +-- PriceApiClient.js
    |   |   |   +-- SymbolsApiClient.js
    |   |   |   +-- TradesApiClient.js
    |   |   +-- websocket/
    |   |       +-- TradingSocketClient.js
    |   +-- presentation/
    |   |   +-- components/
    |   |   |   +-- BotControlPanel.jsx
    |   |   |   +-- EquityCurveChart.jsx
    |   |   |   +-- MarketAnalysisPanel.jsx
    |   |   |   +-- NewsPanel.jsx
    |   |   |   +-- PerformancePanel.jsx
    |   |   |   +-- ProChart.jsx
    |   |   |   +-- SignalCard.jsx
    |   |   |   +-- TradeHistoryPanel.jsx
    |   |   +-- layouts/
    |   |   |   +-- DashboardLayout.jsx
    |   |   +-- pages/
    |   |       +-- DashboardPage.jsx
    |   +-- App.jsx
    |   +-- main.jsx
    +-- index.html
    +-- package.json
    +-- tailwind.config.js
    +-- vite.config.js

## Como Executar

### Pre-requisitos

- Node.js 18+
- Backend Java (trading_boot) a correr em `http://localhost:8080`

### Instalacao

    git clone https://github.com/wesleysemende133/trading_bot_terminal.git
    cd trading_bot_terminal
    npm install

### Desenvolvimento

    npm run dev

Acede a `http://localhost:5173`.

### Build para producao

    npm run build
    npm run preview

## Backend

O frontend liga-se ao backend Java em `http://localhost:8080`. Os endpoints usados sao:

| Metodo | Endpoint | Descricao |
| :--- | :--- | :--- |
| GET | `/api/price/all` | Precos de todos os pares |
| GET | `/api/price/symbols` | Lista de pares monitorizados |
| GET | `/api/klines/{symbol}` | Velas historicas |
| GET | `/api/indicators/{symbol}` | Indicadores (RSI, MACD, BB, ADX, EMA) |
| GET | `/api/market-analysis/{symbol}` | Analise descritiva do mercado |
| GET | `/api/performance/metrics` | Metricas de performance |
| GET | `/api/performance/equity-curve` | Curva de equity |
| GET | `/api/trades/history` | Historico de trades |
| GET | `/api/news/latest` | Noticias de cripto |
| GET | `/api/bot/status` | Estado atual do bot |
| POST | `/api/bot/pause` | Pausar bot |
| POST | `/api/bot/resume` | Retomar bot |
| POST | `/api/bot/stop` | Parar bot |
| POST | `/api/bot/mode` | Mudar modo (DRY_RUN / REAL) |
| WS | `/ws/signals` | Sinais e precos em tempo real |

## Configuracao do WebSocket

O frontend liga-se ao WebSocket em `ws://localhost:8080/ws/signals` para receber:

- Sinais do bot (`type: "signal"`): BUY/SELL/HOLD com forca e motivo.
- Precos em tempo real (`type: "price"`): atualizacao a cada tick.
- Velas em tempo real (`type: "kline_live"`): atualizacao da ultima vela.

## Aviso Legal

Este projeto e para fins educacionais e de estudo. O trading de criptomoedas envolve risco elevado de perda de capital. Nunca invistas dinheiro que nao podes perder. O autor nao se responsabiliza por quaisquer perdas financeiras resultantes do uso deste software.

## Licenca

MIT

## Contacto

- GitHub: https://github.com/wesleysemende133
- Backend: https://github.com/wesleysemende133/trading_boot
