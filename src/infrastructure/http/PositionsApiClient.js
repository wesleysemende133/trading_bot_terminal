export class PositionsApiClient {
  static async getPositions() {
    try {
      const res = await fetch('http://localhost:8080/api/admin/positions');
      if (!res.ok) throw new Error('Falha ao buscar posicoes');
      return await res.json();
    } catch (error) {
      console.error('Erro ao buscar posicoes:', error);
      return { count: 0, positions: {} };
    }
  }
}
