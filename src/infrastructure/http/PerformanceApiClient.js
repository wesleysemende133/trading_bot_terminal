export class PerformanceApiClient {
  static async getMetrics() {
    try {
      const res = await fetch('http://localhost:8080/api/performance/metrics');
      if (!res.ok) throw new Error('Falha ao buscar métricas');
      return await res.json();
    } catch (error) {
      console.error('Erro ao buscar métricas:', error);
      return {};
    }
  }

  static async getEquityCurve() {
    try {
      const res = await fetch('http://localhost:8080/api/performance/equity-curve');
      if (!res.ok) throw new Error('Falha ao buscar equity curve');
      return await res.json();
    } catch (error) {
      console.error('Erro ao buscar equity curve:', error);
      return [];
    }
  }
}
