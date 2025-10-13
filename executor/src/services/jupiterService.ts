import axios from 'axios';
import { Transaction, PublicKey } from '@solana/web3.js';

const JUPITER_API = 'https://quote-api.jup.ag/v6';

// Common token mints (Mainnet)
const TOKEN_MINTS: { [key: string]: string } = {
  'SOL': 'So11111111111111111111111111111111111111112',
  'USDC': 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  'WIF': 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
  'BONK': 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
  'MYRO': 'HhJpBhRRn4g56VsyLuT8DL5Bv31HkXqsrahTTUCZeZg4',
};

export async function getJupiterQuote(
  fromToken: string,
  toToken: string,
  amount: number
) {
  try {
    const inputMint = TOKEN_MINTS[fromToken] || fromToken;
    const outputMint = TOKEN_MINTS[toToken] || toToken;

    // Convert SOL to lamports
    const amountLamports = Math.floor(amount * 1e9);

    const response = await axios.get(`${JUPITER_API}/quote`, {
      params: {
        inputMint,
        outputMint,
        amount: amountLamports,
        slippageBps: 50, // 0.5% slippage
      }
    });

    return response.data;

  } catch (error) {
    console.error('Error getting Jupiter quote:', error);
    return null;
  }
}

export async function buildSwapTransaction(
  agentPubkey: string,
  agentState: any,
  decision: any,
  quote: any
): Promise<{ transaction: Transaction; expectedOutput: number }> {
  try {
    // Get swap transaction from Jupiter
    const response = await axios.post(`${JUPITER_API}/swap`, {
      quoteResponse: quote,
      userPublicKey: agentState.agentWallet,
      wrapAndUnwrapSol: true,
    });

    const { swapTransaction } = response.data;

    // Deserialize transaction
    const transactionBuf = Buffer.from(swapTransaction, 'base64');
    const transaction = Transaction.from(transactionBuf);

    // For MVP: Return mock transaction
    // In production, this would include the actual Jupiter swap + execute_trade CPI

    console.log('✅ Swap transaction built');

    // Return transaction and expected output amount from quote
    return {
      transaction,
      expectedOutput: parseInt(quote.outAmount)
    };

  } catch (error) {
    console.error('Error building swap transaction:', error);
    throw error;
  }
}

// Get token price from Jupiter
export async function getTokenPrice(tokenSymbol: string): Promise<number> {
  try {
    const mint = TOKEN_MINTS[tokenSymbol];

    if (!mint) {
      return 0;
    }

    const response = await axios.get(`${JUPITER_API}/price`, {
      params: { ids: mint }
    });

    return response.data.data[mint]?.price || 0;

  } catch (error) {
    console.error(`Error getting price for ${tokenSymbol}:`, error);
    return 0;
  }
}
