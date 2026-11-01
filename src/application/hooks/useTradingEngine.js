import { useEffect, useRef } from 'react';
import { TradingSocketClient } from '../../infrastructure/websocket/TradingSocketClient';
import { PriceApiClient } from '../../infrastructure/http/PriceApiClient';
import { SymbolsApiClient } from '../../infrastructure/http/SymbolsApiClient';
import { useMarketStore } from '../store/useMarketStore';

export function useTradingEngine() {
  const updatePrice = useMarketStore((state) => state.updatePrice);
  const addSignal = useMarketStore((state) => state.addSignal);
  const setConnectionStatus = useMarketStore((state) => state.setConnectionStatus);
  const setSymbols = useMarketStore((state) => state.setSymbols);

  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // 1. Lista de pares
    SymbolsApiClient.getSymbols().then((symbols) => {
      setSymbols(symbols);
    });

    // 2. WebSocket (sinais e preços)
    const client = TradingSocketClient.getInstance();
    client.connect('ws://localhost:8080/ws/signals');

    const unsubscribe = client.subscribe((message) => {
      if (message.type === 'CONNECTION_STATUS') {
        setConnectionStatus(message.status);
      } else if (message.type === 'signal') {
        addSignal(message.data);
      } else if (message.type === 'price') {
        const symbol = message.symbol.toUpperCase();
        const current = useMarketStore.getState().prices[symbol] || {};
        updatePrice(symbol, { ...current, price: message.price });
      }
    });

    // 3. REST (dados completos das 24h)
    const fetchPrices = async () => {
      const data = await PriceApiClient.getAllPrices();
      if (data) {
        Object.entries(data).forEach(([symbol, info]) => {
          updatePrice(symbol.toUpperCase(), info);
        });
        setConnectionStatus('connected');
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 5000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);
}
