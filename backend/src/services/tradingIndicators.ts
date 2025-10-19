/**
 * Advanced Trading Indicators Service
 * Provides technical analysis tools for trading strategies
 */

export interface PriceData {
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface IndicatorResult {
  timestamp: Date;
  value: number;
}

export interface RSIResult extends IndicatorResult {
  signal: 'overbought' | 'oversold' | 'neutral';
}

export interface MACDResult {
  timestamp: Date;
  macd: number;
  signal: number;
  histogram: number;
  trend: 'bullish' | 'bearish' | 'neutral';
}

export interface BollingerBandsResult {
  timestamp: Date;
  upper: number;
  middle: number;
  lower: number;
  bandwidth: number;
  percentB: number;
}

/**
 * Calculate Simple Moving Average (SMA)
 */
export function calculateSMA(data: number[], period: number): number[] {
  const result: number[] = [];

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(NaN);
      continue;
    }

    const slice = data.slice(i - period + 1, i + 1);
    const sum = slice.reduce((acc, val) => acc + val, 0);
    result.push(sum / period);
  }

  return result;
}

/**
 * Calculate Exponential Moving Average (EMA)
 */
export function calculateEMA(data: number[], period: number): number[] {
  const result: number[] = [];
  const multiplier = 2 / (period + 1);

  // First EMA is SMA
  let ema = data.slice(0, period).reduce((acc, val) => acc + val, 0) / period;

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(NaN);
    } else if (i === period - 1) {
      result.push(ema);
    } else {
      ema = (data[i] - ema) * multiplier + ema;
      result.push(ema);
    }
  }

  return result;
}

/**
 * Calculate Relative Strength Index (RSI)
 */
export function calculateRSI(prices: PriceData[], period: number = 14): RSIResult[] {
  const changes: number[] = [];
  const gains: number[] = [];
  const losses: number[] = [];

  // Calculate price changes
  for (let i = 1; i < prices.length; i++) {
    const change = prices[i].close - prices[i - 1].close;
    changes.push(change);
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }

  const result: RSIResult[] = [];

  // Calculate initial average gain/loss
  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

  for (let i = 0; i < prices.length; i++) {
    if (i < period) {
      result.push({
        timestamp: prices[i].timestamp,
        value: NaN,
        signal: 'neutral',
      });
      continue;
    }

    // Smooth the averages
    avgGain = (avgGain * (period - 1) + gains[i - 1]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i - 1]) / period;

    const rs = avgGain / (avgLoss || 0.0001);
    const rsi = 100 - (100 / (1 + rs));

    let signal: 'overbought' | 'oversold' | 'neutral' = 'neutral';
    if (rsi > 70) signal = 'overbought';
    else if (rsi < 30) signal = 'oversold';

    result.push({
      timestamp: prices[i].timestamp,
      value: rsi,
      signal,
    });
  }

  return result;
}

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 */
export function calculateMACD(
  prices: PriceData[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): MACDResult[] {
  const closePrices = prices.map((p) => p.close);

  // Calculate fast and slow EMAs
  const fastEMA = calculateEMA(closePrices, fastPeriod);
  const slowEMA = calculateEMA(closePrices, slowPeriod);

  // Calculate MACD line
  const macdLine: number[] = [];
  for (let i = 0; i < closePrices.length; i++) {
    if (isNaN(fastEMA[i]) || isNaN(slowEMA[i])) {
      macdLine.push(NaN);
    } else {
      macdLine.push(fastEMA[i] - slowEMA[i]);
    }
  }

  // Calculate signal line (EMA of MACD)
  const signalLine = calculateEMA(macdLine.filter((v) => !isNaN(v)), signalPeriod);

  // Pad signal line to match length
  const paddedSignal: number[] = [];
  let signalIndex = 0;
  for (let i = 0; i < macdLine.length; i++) {
    if (isNaN(macdLine[i])) {
      paddedSignal.push(NaN);
    } else {
      paddedSignal.push(signalLine[signalIndex++] || NaN);
    }
  }

  const result: MACDResult[] = [];
  for (let i = 0; i < prices.length; i++) {
    const macd = macdLine[i];
    const signal = paddedSignal[i];
    const histogram = isNaN(macd) || isNaN(signal) ? NaN : macd - signal;

    let trend: 'bullish' | 'bearish' | 'neutral' = 'neutral';
    if (!isNaN(histogram)) {
      if (histogram > 0 && macd > signal) trend = 'bullish';
      else if (histogram < 0 && macd < signal) trend = 'bearish';
    }

    result.push({
      timestamp: prices[i].timestamp,
      macd: isNaN(macd) ? 0 : macd,
      signal: isNaN(signal) ? 0 : signal,
      histogram: isNaN(histogram) ? 0 : histogram,
      trend,
    });
  }

  return result;
}

/**
 * Calculate Bollinger Bands
 */
export function calculateBollingerBands(
  prices: PriceData[],
  period: number = 20,
  stdDev: number = 2
): BollingerBandsResult[] {
  const closePrices = prices.map((p) => p.close);
  const sma = calculateSMA(closePrices, period);

  const result: BollingerBandsResult[] = [];

  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      result.push({
        timestamp: prices[i].timestamp,
        upper: NaN,
        middle: NaN,
        lower: NaN,
        bandwidth: NaN,
        percentB: NaN,
      });
      continue;
    }

    const slice = closePrices.slice(i - period + 1, i + 1);
    const mean = sma[i];

    // Calculate standard deviation
    const variance = slice.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / period;
    const std = Math.sqrt(variance);

    const upper = mean + stdDev * std;
    const lower = mean - stdDev * std;
    const bandwidth = (upper - lower) / mean;
    const percentB = (closePrices[i] - lower) / (upper - lower);

    result.push({
      timestamp: prices[i].timestamp,
      upper,
      middle: mean,
      lower,
      bandwidth,
      percentB,
    });
  }

  return result;
}

/**
 * Calculate Average True Range (ATR) - Volatility indicator
 */
export function calculateATR(prices: PriceData[], period: number = 14): IndicatorResult[] {
  const trueRanges: number[] = [];

  for (let i = 1; i < prices.length; i++) {
    const high = prices[i].high;
    const low = prices[i].low;
    const prevClose = prices[i - 1].close;

    const tr = Math.max(
      high - low,
      Math.abs(high - prevClose),
      Math.abs(low - prevClose)
    );

    trueRanges.push(tr);
  }

  const atr = calculateSMA(trueRanges, period);

  const result: IndicatorResult[] = [];
  for (let i = 0; i < prices.length; i++) {
    result.push({
      timestamp: prices[i].timestamp,
      value: i === 0 ? NaN : atr[i - 1] || NaN,
    });
  }

  return result;
}

/**
 * Calculate On-Balance Volume (OBV)
 */
export function calculateOBV(prices: PriceData[]): IndicatorResult[] {
  const result: IndicatorResult[] = [];
  let obv = 0;

  for (let i = 0; i < prices.length; i++) {
    if (i === 0) {
      result.push({
        timestamp: prices[i].timestamp,
        value: 0,
      });
      continue;
    }

    if (prices[i].close > prices[i - 1].close) {
      obv += prices[i].volume;
    } else if (prices[i].close < prices[i - 1].close) {
      obv -= prices[i].volume;
    }

    result.push({
      timestamp: prices[i].timestamp,
      value: obv,
    });
  }

  return result;
}

/**
 * Calculate Volume Weighted Average Price (VWAP)
 */
export function calculateVWAP(prices: PriceData[]): IndicatorResult[] {
  const result: IndicatorResult[] = [];
  let cumulativeTPV = 0; // Typical Price * Volume
  let cumulativeVolume = 0;

  for (let i = 0; i < prices.length; i++) {
    const typicalPrice = (prices[i].high + prices[i].low + prices[i].close) / 3;
    cumulativeTPV += typicalPrice * prices[i].volume;
    cumulativeVolume += prices[i].volume;

    const vwap = cumulativeVolume > 0 ? cumulativeTPV / cumulativeVolume : NaN;

    result.push({
      timestamp: prices[i].timestamp,
      value: vwap,
    });
  }

  return result;
}

/**
 * Calculate Stochastic Oscillator
 */
export function calculateStochastic(
  prices: PriceData[],
  period: number = 14,
  kSmooth: number = 3,
  dSmooth: number = 3
): { k: IndicatorResult[]; d: IndicatorResult[] } {
  const kValues: number[] = [];

  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      kValues.push(NaN);
      continue;
    }

    const slice = prices.slice(i - period + 1, i + 1);
    const highest = Math.max(...slice.map((p) => p.high));
    const lowest = Math.min(...slice.map((p) => p.low));
    const current = prices[i].close;

    const k = ((current - lowest) / (highest - lowest)) * 100;
    kValues.push(k);
  }

  // Smooth %K
  const smoothedK = calculateSMA(kValues, kSmooth);

  // %D is SMA of %K
  const dValues = calculateSMA(smoothedK, dSmooth);

  const kResult: IndicatorResult[] = [];
  const dResult: IndicatorResult[] = [];

  for (let i = 0; i < prices.length; i++) {
    kResult.push({
      timestamp: prices[i].timestamp,
      value: smoothedK[i] || NaN,
    });
    dResult.push({
      timestamp: prices[i].timestamp,
      value: dValues[i] || NaN,
    });
  }

  return { k: kResult, d: dResult };
}

/**
 * Analyze multiple indicators to generate trading signals
 */
export function analyzeIndicators(prices: PriceData[]): {
  rsi: RSIResult[];
  macd: MACDResult[];
  bollingerBands: BollingerBandsResult[];
  atr: IndicatorResult[];
  obv: IndicatorResult[];
  vwap: IndicatorResult[];
  stochastic: { k: IndicatorResult[]; d: IndicatorResult[] };
  signals: {
    buySignals: number;
    sellSignals: number;
    neutralSignals: number;
    overallSentiment: 'bullish' | 'bearish' | 'neutral';
  };
} {
  const rsi = calculateRSI(prices);
  const macd = calculateMACD(prices);
  const bollingerBands = calculateBollingerBands(prices);
  const atr = calculateATR(prices);
  const obv = calculateOBV(prices);
  const vwap = calculateVWAP(prices);
  const stochastic = calculateStochastic(prices);

  // Analyze latest signals
  const latest = prices.length - 1;
  let buySignals = 0;
  let sellSignals = 0;
  let neutralSignals = 0;

  // RSI signals
  if (rsi[latest]?.signal === 'oversold') buySignals++;
  else if (rsi[latest]?.signal === 'overbought') sellSignals++;
  else neutralSignals++;

  // MACD signals
  if (macd[latest]?.trend === 'bullish') buySignals++;
  else if (macd[latest]?.trend === 'bearish') sellSignals++;
  else neutralSignals++;

  // Bollinger Bands signals
  const bb = bollingerBands[latest];
  if (bb && !isNaN(bb.percentB)) {
    if (bb.percentB < 0.2) buySignals++;
    else if (bb.percentB > 0.8) sellSignals++;
    else neutralSignals++;
  }

  // Stochastic signals
  const k = stochastic.k[latest]?.value;
  const d = stochastic.d[latest]?.value;
  if (!isNaN(k) && !isNaN(d)) {
    if (k < 20 && k > d) buySignals++;
    else if (k > 80 && k < d) sellSignals++;
    else neutralSignals++;
  }

  // Overall sentiment
  let overallSentiment: 'bullish' | 'bearish' | 'neutral' = 'neutral';
  if (buySignals > sellSignals && buySignals > neutralSignals) {
    overallSentiment = 'bullish';
  } else if (sellSignals > buySignals && sellSignals > neutralSignals) {
    overallSentiment = 'bearish';
  }

  return {
    rsi,
    macd,
    bollingerBands,
    atr,
    obv,
    vwap,
    stochastic,
    signals: {
      buySignals,
      sellSignals,
      neutralSignals,
      overallSentiment,
    },
  };
}
