export class BotControlClient {
  static async getStatus() {
    try {
      const res = await fetch('http://localhost:8080/api/bot/status');
      if (!res.ok) throw new Error('Falha ao buscar status');
      return await res.json();
    } catch (error) {
      console.error('Erro ao buscar status do bot:', error);
      return { state: 'UNKNOWN', mode: 'UNKNOWN', isRunning: false };
    }
  }

  static async pause() {
    try {
      const res = await fetch('http://localhost:8080/api/bot/pause', { method: 'POST' });
      return await res.json();
    } catch (error) {
      console.error('Erro ao pausar bot:', error);
      return null;
    }
  }

  static async resume() {
    try {
      const res = await fetch('http://localhost:8080/api/bot/resume', { method: 'POST' });
      return await res.json();
    } catch (error) {
      console.error('Erro ao retomar bot:', error);
      return null;
    }
  }

  static async stop() {
    try {
      const res = await fetch('http://localhost:8080/api/bot/stop', { method: 'POST' });
      return await res.json();
    } catch (error) {
      console.error('Erro ao parar bot:', error);
      return null;
    }
  }

  static async setMode(mode) {
    try {
      const res = await fetch(`http://localhost:8080/api/bot/mode?mode=${mode}`, { method: 'POST' });
      return await res.json();
    } catch (error) {
      console.error('Erro ao mudar modo:', error);
      return null;
    }
  }
}
