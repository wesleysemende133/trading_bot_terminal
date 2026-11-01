export class NewsApiClient {
  static async getLatestNews(limit = 5) {
    try {
      const res = await fetch(`http://localhost:8080/api/news/latest?limit=${limit}`);
      if (!res.ok) throw new Error('Falha ao buscar notícias');
      return await res.json();
    } catch (error) {
      console.error('Erro ao buscar notícias:', error);
      return { articles: [], count: 0 };
    }
  }

  static async getBreakingNews(limit = 3) {
    try {
      const res = await fetch(`http://localhost:8080/api/news/breaking?limit=${limit}`);
      if (!res.ok) throw new Error('Falha ao buscar breaking news');
      return await res.json();
    } catch (error) {
      console.error('Erro ao buscar breaking news:', error);
      return { articles: [], count: 0 };
    }
  }
}
