// Design Pattern: Singleton & Observer
export class TradingSocketClient {
  static instance = null;
  socket = null;
  listeners = new Set();

  static getInstance() {
    if (!TradingSocketClient.instance) {
      TradingSocketClient.instance = new TradingSocketClient();
    }
    return TradingSocketClient.instance;
  }

  connect(url) {
    if (this.socket) return;
    
    this.socket = new WebSocket(url);
    
    this.socket.onopen = () => this.notify({ type: 'CONNECTION_STATUS', status: 'connected' });
    this.socket.onclose = () => this.notify({ type: 'CONNECTION_STATUS', status: 'disconnected' });
    
    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.notify(data);
      } catch (e) {
        console.error('Erro no parse do WebSocket', e);
      }
    };
  }

  // Observer Pattern: Adicionar/Remover ouvintes
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify(data) {
    this.listeners.forEach(callback => callback(data));
  }
}
