export class MarketAnalysisClient {
  static async getAnalysis(symbol) {
    try {
      const res = await fetch(`http://localhost:8080/api/market-analysis/${symbol.toLowerCase()}`);
      if (!res.ok) throw new Error('Falha ao buscar análise');
      return await res.json();
    } catch (error) {
      console.error(`Erro ao buscar análise de ${symbol}:`, error);
      return null;
    }
  }
}
