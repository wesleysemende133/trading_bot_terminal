// Core Entity: Representa um Sinal de Trading
export class Signal {
  constructor({ symbol, action, strength, price, reason, timestamp }) {
    this.symbol = symbol;
    this.action = action; // 'BUY', 'SELL', 'HOLD'
    this.strength = strength;
    this.price = price;
    this.reason = reason;
    this.timestamp = timestamp || new Date().toISOString();
  }

  isBuy() { return this.action === 'BUY'; }
  isSell() { return this.action === 'SELL'; }
  isHold() { return this.action === 'HOLD'; }
  
  // Regra de negócio: A força é considerada alta se > 70%
  isStrong() { return this.strength >= 70; }
}
