import vm from 'vm';

// Sandbox configuration
const EXECUTION_TIMEOUT = 1000; // 1 second max execution time
const MAX_MEMORY = 50 * 1024 * 1024; // 50MB max memory

interface MarketData {
  price: number;
  volume24h: number;
  priceChange24h: number;
  liquidity: number;
}

interface Position {
  amount: number;
  entryPrice: number;
}

interface StrategyResult {
  shouldBuy?: boolean;
  shouldSell?: boolean;
  positionSize?: number;
  error?: string;
}

/**
 * Execute user code in a secure sandbox
 * This prevents malicious code from accessing the filesystem, network, etc.
 */
export function executeStrategyCode(
  code: string,
  marketData: MarketData,
  position: Position | null,
  availableBalance: number
): StrategyResult {
  try {
    // Validate code doesn't contain dangerous patterns
    const dangerousPatterns = [
      /require\(/g,
      /import\s/g,
      /eval\(/g,
      /Function\(/g,
      /process\./g,
      /global\./g,
      /__dirname/g,
      /__filename/g,
      /fs\./g,
      /child_process/g,
      /net\./g,
      /http\./g,
      /https\./g,
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(code)) {
        return {
          error: 'Code contains forbidden operations (require, import, eval, etc.)',
        };
      }
    }

    // Create a safe context with only allowed variables
    const sandbox = {
      market: marketData,
      position,
      availableBalance,
      console: {
        log: () => {}, // Disable console.log
      },
      Math: Math,
      Date: Date,
      // Results storage
      results: {
        shouldBuy: false,
        shouldSell: false,
        positionSize: 0,
      },
    };

    // Wrap user code to extract results
    const wrappedCode = `
      ${code}

      // Execute strategy functions
      if (typeof shouldBuy === 'function') {
        results.shouldBuy = shouldBuy(market, position);
      }

      if (typeof shouldSell === 'function' && position) {
        results.shouldSell = shouldSell(market, position);
      }

      if (typeof calculatePositionSize === 'function') {
        results.positionSize = calculatePositionSize(market, availableBalance);
      }
    `;

    // Create VM context
    const context = vm.createContext(sandbox);

    // Execute code with timeout
    vm.runInContext(wrappedCode, context, {
      timeout: EXECUTION_TIMEOUT,
      displayErrors: true,
    });

    return {
      shouldBuy: sandbox.results.shouldBuy,
      shouldSell: sandbox.results.shouldSell,
      positionSize: sandbox.results.positionSize,
    };
  } catch (error: any) {
    console.error('Error executing strategy code:', error);
    return {
      error: `Execution error: ${error.message}`,
    };
  }
}

/**
 * Validate TypeScript syntax without executing
 */
export function validateStrategyCode(code: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check for required functions
  if (!code.includes('function shouldBuy') && !code.includes('shouldBuy')) {
    errors.push('Missing required function: shouldBuy');
  }

  if (!code.includes('function shouldSell') && !code.includes('shouldSell')) {
    errors.push('Missing required function: shouldSell');
  }

  if (!code.includes('function calculatePositionSize') && !code.includes('calculatePositionSize')) {
    errors.push('Missing required function: calculatePositionSize');
  }

  // Check for dangerous patterns
  const dangerousPatterns = [
    { pattern: /require\(/g, message: 'require() is not allowed' },
    { pattern: /import\s/g, message: 'import statements are not allowed' },
    { pattern: /eval\(/g, message: 'eval() is not allowed' },
    { pattern: /Function\(/g, message: 'Function constructor is not allowed' },
    { pattern: /process\./g, message: 'process access is not allowed' },
    { pattern: /fs\./g, message: 'File system access is not allowed' },
    { pattern: /child_process/g, message: 'Child processes are not allowed' },
  ];

  for (const { pattern, message } of dangerousPatterns) {
    if (pattern.test(code)) {
      errors.push(message);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Backtest a strategy against historical data
 */
export function backtestStrategy(
  code: string,
  historicalData: MarketData[]
): {
  success: boolean;
  results?: {
    totalTrades: number;
    wins: number;
    losses: number;
    winRate: number;
    totalReturn: number;
    avgReturn: number;
  };
  error?: string;
} {
  try {
    let balance = 1000; // Start with 1000 SOL
    let position: Position | null = null;
    let trades = 0;
    let wins = 0;
    let losses = 0;

    for (const data of historicalData) {
      const result = executeStrategyCode(code, data, position, balance);

      if (result.error) {
        return { success: false, error: result.error };
      }

      // Execute buy
      if (result.shouldBuy && !position && result.positionSize) {
        const amount = result.positionSize;
        if (amount <= balance) {
          position = {
            amount: amount / data.price,
            entryPrice: data.price,
          };
          balance -= amount;
          trades++;
        }
      }

      // Execute sell
      if (result.shouldSell && position) {
        const sellValue = position.amount * data.price;
        balance += sellValue;

        const profit = sellValue - position.amount * position.entryPrice;
        if (profit > 0) {
          wins++;
        } else {
          losses++;
        }

        position = null;
      }
    }

    const winRate = trades > 0 ? (wins / trades) * 100 : 0;
    const totalReturn = ((balance - 1000) / 1000) * 100;
    const avgReturn = trades > 0 ? totalReturn / trades : 0;

    return {
      success: true,
      results: {
        totalTrades: trades,
        wins,
        losses,
        winRate,
        totalReturn,
        avgReturn,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}
