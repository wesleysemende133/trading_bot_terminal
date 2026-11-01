export class PriceApiClient {
  static async getAllPrices() {
    try {
      const res = await fetch('http://localhost:8080/api/price/all');
      if (!res.ok) throw new Error('Falha ao buscar preços');
      return await res.json();
    } catch (error) {
      console.error('Erro ao buscar preços:', error);
      return null;
    }
  }
}
