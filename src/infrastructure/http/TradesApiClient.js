export class TradesApiClient {
  static async getHistory() {
    try {
      const res = await fetch('http://localhost:8080/api/trades/history');
      if (!res.ok) throw new Error('Falha ao buscar trades');
      return await res.json();
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      return { trades: [], metrics: {} };
    }
  }
}
