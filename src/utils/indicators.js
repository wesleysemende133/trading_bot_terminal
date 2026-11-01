export function calculateEMA(data, period, key = 'close') {
  const k = 2 / (period + 1);
  const result = [];
  let ema = data.slice(0, period).reduce((a, b) => a + b[key], 0) / period;
  result.push({ time: data[period - 1].time, value: ema });
  for (let i = period; i < data.length; i++) {
    ema = data[i][key] * k + ema * (1 - k);
    result.push({ time: data[i].time, value: ema });
  }
  return result;
}

export function calculateSMA(data, period, key = 'close') {
  const result = [];
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) sum += data[i - j][key];
    result.push({ time: data[i].time, value: sum / period });
  }
  return result;
}

export function calculateRSI(data, period = 14) {
  const result = [];
  let gains = 0, losses = 0;
  for (let i = 1; i <= period; i++) {
    const diff = data[i].close - data[i - 1].close;
    if (diff >= 0) gains += diff; else losses -= diff;
  }
  let avgGain = gains / period;
  let avgLoss = losses / period;
  result.push({ time: data[period].time, value: 100 - (100 / (1 + avgGain / (avgLoss || 1))) });
  for (let i = period + 1; i < data.length; i++) {
    const diff = data[i].close - data[i - 1].close;
    avgGain = (avgGain * (period - 1) + (diff > 0 ? diff : 0)) / period;
    avgLoss = (avgLoss * (period - 1) + (diff < 0 ? -diff : 0)) / period;
    result.push({ time: data[i].time, value: 100 - (100 / (1 + avgGain / (avgLoss || 1))) });
  }
  return result;
}

export function calculateMACD(data, fast = 12, slow = 26, signal = 9) {
  const emaFast = calculateEMA(data, fast);
  const emaSlow = calculateEMA(data, slow);
  const macdLine = [];
  const offset = slow - fast;
  for (let i = 0; i < emaFast.length; i++) {
    if (i >= offset) {
      macdLine.push({ time: emaFast[i].time, value: emaFast[i].value - emaSlow[i - offset].value });
    }
  }
  const signalLine = calculateEMA(macdLine, signal, 'value');
  const histogram = macdLine.slice(signal - 1).map((m, i) => ({
    time: m.time,
    value: m.value - signalLine[i].value,
    color: m.value - signalLine[i].value >= 0 ? '#08998180' : '#f2364580'
  }));
  return { macdLine, signalLine, histogram };
}

export function calculateBollingerBands(data, period = 20, mult = 2) {
  const sma = calculateSMA(data, period);
  const upper = [], lower = [];
  for (let i = 0; i < sma.length; i++) {
    const slice = data.slice(i, i + period);
    const mean = sma[i].value;
    const variance = slice.reduce((a, b) => a + Math.pow(b.close - mean, 2), 0) / period;
    const stdDev = Math.sqrt(variance);
    upper.push({ time: sma[i].time, value: mean + mult * stdDev });
    lower.push({ time: sma[i].time, value: mean - mult * stdDev });
  }
  return { upper, middle: sma, lower };
}
