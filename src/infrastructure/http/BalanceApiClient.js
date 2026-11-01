export class BalanceApiClient {
  static async getBalance() {
    try {
      const res = await fetch('http://localhost:8080/api/balance/status');
      if (!res.ok) throw new Error('Falha ao buscar saldo');
      return await res.json();
    } catch (error) {
      console.error('Erro ao buscar saldo:', error);
      return {};
    }
  }
}
