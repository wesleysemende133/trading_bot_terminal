export class KlinesApiClient {
  static async getKlines(symbol, limit = 500) {
    try {
      const res = await fetch(`http://localhost:8080/api/klines/${symbol.toLowerCase()}?limit=${limit}`);
      if (!res.ok) throw new Error('Falha ao buscar velas');
      const data = await res.json();
      return data.map(k => ({
        time: Math.floor(k.openTime / 1000),
        open: k.open,
        high: k.high,
        low: k.low,
        close: k.close,
        volume: k.volume
      }));
    } catch (error) {
      console.error(`Erro ao buscar velas de ${symbol}:`, error);
      return [];
    }
  }
}
