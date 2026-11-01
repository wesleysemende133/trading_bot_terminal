export class SymbolsApiClient {
  static async getSymbols() {
    try {
      const response = await fetch('http://localhost:8080/api/price/symbols');
      if (!response.ok) throw new Error('Falha ao buscar símbolos');
      const symbols = await response.json();
      return symbols.map(s => s.toUpperCase());
    } catch (error) {
      console.error('Erro ao buscar símbolos:', error);
      return ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT'];
    }
  }
}
