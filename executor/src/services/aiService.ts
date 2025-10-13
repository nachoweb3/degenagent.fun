import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface AIDecision {
  action: 'SWAP' | 'HOLD';
  fromToken?: string;
  toToken?: string;
  amount?: string;
  reasoning?: string;
}

export async function queryAI(
  agentState: any,
  marketData: any
): Promise<AIDecision> {
  try {
    const prompt = buildPrompt(agentState, marketData);

    // Use Gemini Pro model (free tier)
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();

    if (!content) {
      return { action: 'HOLD', reasoning: 'No response from AI' };
    }

    // Extract JSON from response (Gemini might include markdown formatting)
    let jsonContent = content.trim();

    // Remove markdown code blocks if present
    if (jsonContent.startsWith('```json')) {
      jsonContent = jsonContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonContent.startsWith('```')) {
      jsonContent = jsonContent.replace(/```\n?/g, '');
    }

    // Parse JSON response
    const decision: AIDecision = JSON.parse(jsonContent.trim());

    // Validate decision
    if (!decision.action || !['SWAP', 'HOLD'].includes(decision.action)) {
      console.warn('Invalid AI decision, defaulting to HOLD');
      return { action: 'HOLD', reasoning: 'Invalid AI response format' };
    }

    return decision;

  } catch (error) {
    console.error('Error querying AI:', error);
    // Default to HOLD on error
    return {
      action: 'HOLD',
      reasoning: 'Error consulting AI, holding position for safety'
    };
  }
}

function buildPrompt(agentState: any, marketData: any): string {
  return `
You are an autonomous AI trading agent on Solana blockchain.

**Your Mission**: ${agentState.purpose}

**Current Portfolio**:
- SOL Balance: ${agentState.vaultBalance}
- Total Trades Executed: ${agentState.totalTrades}
- Total Volume: $${agentState.totalVolume}

**Market Data**:
Trending Memecoins:
${marketData.trending.map((t: any) =>
  `- ${t.symbol}: ${t.change24h > 0 ? '+' : ''}${t.change24h}% (24h), Volume: $${t.volume.toLocaleString()}`
).join('\n')}

Market Sentiment: ${marketData.sentiment}
Total Market Cap: $${marketData.marketCap.total.toLocaleString()} (${marketData.marketCap.change24h > 0 ? '+' : ''}${marketData.marketCap.change24h}%)

**Instructions**:
1. Analyze the market data carefully based on your mission
2. Consider risk vs reward for each potential trade
3. Stay aligned with your specific trading strategy
4. Decide whether to execute a SWAP or HOLD your current position
5. If swapping, specify which tokens and how much SOL to trade

**CRITICAL**: You MUST respond ONLY with valid JSON in this EXACT format (no additional text):

{
  "action": "SWAP",
  "fromToken": "SOL",
  "toToken": "WIF",
  "amount": "0.5",
  "reasoning": "Brief explanation of your decision"
}

OR

{
  "action": "HOLD",
  "reasoning": "Brief explanation of why you're holding"
}

Rules:
- action must be either "SWAP" or "HOLD"
- If action is SWAP, fromToken must be "SOL"
- If action is SWAP, toToken must be one of: WIF, BONK, MYRO (from trending list)
- If action is SWAP, amount must be a number as string (e.g., "0.5")
- If action is HOLD, omit fromToken, toToken, and amount
- reasoning is always required

RESPOND ONLY WITH THE JSON. NO MARKDOWN. NO EXPLANATIONS BEFORE OR AFTER.
`;
}
