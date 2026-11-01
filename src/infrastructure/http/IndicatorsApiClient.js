export class IndicatorsApiClient {
  static async getIndicators(symbol) {
    try {
      const res = await fetch(`http://localhost:8080/api/indicators/${symbol.toLowerCase()}`);
      if (!res.ok) throw new Error('Falha ao buscar indicadores');
      return await res.json();
    } catch (error) {
      console.error(`Erro ao buscar indicadores de ${symbol}:`, error);
      return null;
    }
  }
}
