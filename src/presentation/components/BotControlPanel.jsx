import React, { useEffect, useState } from 'react';
import { BotControlClient } from '../../infrastructure/http/BotControlClient';
import { Play, Pause, Square } from 'lucide-react';

export function BotControlPanel() {
  const [status, setStatus] = useState(null);

  const fetchStatus = async () => {
    const data = await BotControlClient.getStatus();
    setStatus(data);
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const handlePause = async () => {
    const result = await BotControlClient.pause();
    if (result) setStatus(result);
  };

  const handleResume = async () => {
    const result = await BotControlClient.resume();
    if (result) setStatus(result);
  };

  const handleStop = async () => {
    if (window.confirm('Parar o bot? Isto irá parar de gerar sinais.')) {
      const result = await BotControlClient.stop();
      if (result) setStatus(result);
    }
  };

  const handleModeChange = async (newMode) => {
    if (newMode === 'REAL') {
      if (!window.confirm('⚠️ ATENÇÃO: Mudar para modo REAL irá executar ordens com dinheiro real. Confirmar?')) {
        return;
      }
    }
    const result = await BotControlClient.setMode(newMode);
    if (result) setStatus(result);
  };

  if (!status) {
    return (
      <div className="flex items-center space-x-2 text-xs text-gray-400 animate-pulse">
        <span>A carregar...</span>
      </div>
    );
  }

  const getStateColor = () => {
    if (status.state === 'RUNNING') return 'text-tv-green';
    if (status.state === 'PAUSED') return 'text-yellow-500';
    return 'text-tv-red';
  };

  const getStateIcon = () => {
    if (status.state === 'RUNNING') return '●';
    if (status.state === 'PAUSED') return '⏸';
    return '■';
  };

  return (
    <div className="flex items-center space-x-3">
      {/* Estado + Modo */}
      <div className="flex items-center space-x-2">
        <span className={`text-xs font-bold ${getStateColor()}`}>
          {getStateIcon()} {status.state}
        </span>
        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
          status.mode === 'REAL'
            ? 'bg-tv-red/20 text-tv-red'
            : 'bg-tv-blue/20 text-tv-blue'
        }`}>
          {status.mode}
        </span>
      </div>

      {/* Botões */}
      <div className="flex items-center space-x-1">
        {status.state === 'RUNNING' && (
          <button
            onClick={handlePause}
            className="flex items-center space-x-1 px-2 py-1 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-500 rounded text-[10px] font-bold transition-colors"
            title="Pausar bot"
          >
            <Pause className="w-3 h-3" />
          </button>
        )}

        {status.state === 'PAUSED' && (
          <button
            onClick={handleResume}
            className="flex items-center space-x-1 px-2 py-1 bg-tv-green/20 hover:bg-tv-green/30 text-tv-green rounded text-[10px] font-bold transition-colors"
            title="Retomar bot"
          >
            <Play className="w-3 h-3" />
          </button>
        )}

        {status.state !== 'STOPPED' && (
          <button
            onClick={handleStop}
            className="flex items-center space-x-1 px-2 py-1 bg-tv-red/20 hover:bg-tv-red/30 text-tv-red rounded text-[10px] font-bold transition-colors"
            title="Parar bot"
          >
            <Square className="w-3 h-3" />
          </button>
        )}

        {status.state === 'STOPPED' && (
          <button
            onClick={handleResume}
            className="flex items-center space-x-1 px-2 py-1 bg-tv-green/20 hover:bg-tv-green/30 text-tv-green rounded text-[10px] font-bold transition-colors"
            title="Iniciar bot"
          >
            <Play className="w-3 h-3" />
          </button>
        )}

        {/* Seletor de modo */}
        <select
          value={status.mode}
          onChange={(e) => handleModeChange(e.target.value)}
          className="bg-tv-border text-white text-[10px] px-1.5 py-1 rounded border border-tv-border outline-none"
        >
          <option value="DRY_RUN">DRY RUN</option>
          <option value="REAL">REAL</option>
        </select>
      </div>
    </div>
  );
}
