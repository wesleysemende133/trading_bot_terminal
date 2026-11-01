import { create } from 'zustand';
import { Signal } from '../../core/entities/Signal';

export const useMarketStore = create((set) => ({
  prices: {},
  signals: {},
  symbols: [],
  connectionStatus: 'disconnected',

  setSymbols: (symbols) => set({ symbols }),

  updatePrice: (symbol, info) => set((state) => ({
    prices: { ...state.prices, [symbol]: info }
  })),

  addSignal: (rawSignal) => set((state) => {
    const signal = new Signal(rawSignal);
    return { signals: { ...state.signals, [signal.symbol]: signal } };
  }),

  setConnectionStatus: (status) => set({ connectionStatus: status }),
}));
