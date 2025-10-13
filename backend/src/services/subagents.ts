import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface MarketAnalysis {
  sentiment: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  opportunities: Array<{
    token: string;
    action: 'buy' | 'sell' | 'hold';
    reasoning: string;
    expectedReturn: number;
  }>;
  marketTrends: string[];
}

export interface RiskAssessment {
  overallRisk: 'low' | 'medium' | 'high';
  maxPositionSize: number;
  stopLossLevel: number;
  warnings: string[];
  recommendations: string[];
  shouldProceed: boolean;
}

export interface ExecutionPlan {
  entryPrice: number;
  exitPrice: number;
  slippageTolerance: number;
  splitOrders: boolean;
  orderSizes: number[];
  timing: 'immediate' | 'delayed' | 'gradual';
  estimatedGas: number;
}

/**
 * SUBAGENT 1: Market Analyzer
 * Analyzes market conditions, sentiment, and identifies opportunities
 */
export class MarketAnalyzerAgent {
  private model: any;

  constructor() {
    this.model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async analyze(
    tokenData: any[],
    agentPurpose: string,
    riskTolerance: number
  ): Promise<MarketAnalysis> {
    const prompt = `You are a MARKET ANALYZER AI specializing in cryptocurrency trading on Solana.

**Your Mission**: ${agentPurpose}

**Current Market Data**:
${JSON.stringify(tokenData, null, 2)}

**Risk Tolerance**: ${riskTolerance}/10 (1=conservative, 10=aggressive)

**Your Task**:
1. Analyze current market sentiment for each token
2. Identify trading opportunities aligned with the agent's mission
3. Provide confidence levels for each recommendation
4. List key market trends affecting decisions

Respond in JSON format:
{
  "sentiment": "bullish|bearish|neutral",
  "confidence": 0-100,
  "opportunities": [
    {
      "token": "SOL",
      "action": "buy|sell|hold",
      "reasoning": "detailed explanation",
      "expectedReturn": 0-100
    }
  ],
  "marketTrends": ["trend1", "trend2"]
}`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid response format from Market Analyzer');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Market Analyzer error:', error);
      // Return safe default
      return {
        sentiment: 'neutral',
        confidence: 0,
        opportunities: [],
        marketTrends: ['Error analyzing market']
      };
    }
  }
}

/**
 * SUBAGENT 2: Risk Manager
 * Evaluates risks, sets limits, and provides go/no-go decisions
 */
export class RiskManagerAgent {
  private model: any;

  constructor() {
    this.model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async assessRisk(
    opportunity: MarketAnalysis['opportunities'][0],
    vaultBalance: number,
    recentPerformance: any,
    riskTolerance: number,
    maxTradeSize: number
  ): Promise<RiskAssessment> {
    const prompt = `You are a RISK MANAGER AI for a cryptocurrency trading agent.

**Proposed Trade**:
- Token: ${opportunity.token}
- Action: ${opportunity.action}
- Reasoning: ${opportunity.reasoning}
- Expected Return: ${opportunity.expectedReturn}%

**Current Portfolio**:
- Vault Balance: ${vaultBalance} SOL
- Max Trade Size Setting: ${maxTradeSize}%
- Risk Tolerance: ${riskTolerance}/10

**Recent Performance**:
${JSON.stringify(recentPerformance, null, 2)}

**Your Task**:
1. Assess the overall risk level of this trade
2. Calculate the maximum safe position size
3. Determine appropriate stop-loss level
4. List any warnings or red flags
5. Provide final go/no-go recommendation

Respond in JSON format:
{
  "overallRisk": "low|medium|high",
  "maxPositionSize": 0-100,
  "stopLossLevel": 0-100,
  "warnings": ["warning1", "warning2"],
  "recommendations": ["rec1", "rec2"],
  "shouldProceed": true|false
}`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid response format from Risk Manager');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Risk Manager error:', error);
      // Return conservative default
      return {
        overallRisk: 'high',
        maxPositionSize: 0,
        stopLossLevel: 5,
        warnings: ['Error assessing risk - trade blocked'],
        recommendations: ['Wait for system recovery'],
        shouldProceed: false
      };
    }
  }
}

/**
 * SUBAGENT 3: Execution Optimizer
 * Optimizes trade execution for best price and minimal slippage
 */
export class ExecutionOptimizerAgent {
  private model: any;

  constructor() {
    this.model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async optimizeExecution(
    opportunity: MarketAnalysis['opportunities'][0],
    riskAssessment: RiskAssessment,
    currentPrice: number,
    liquidityData: any,
    gasEstimate: number
  ): Promise<ExecutionPlan> {
    const prompt = `You are an EXECUTION OPTIMIZER AI for cryptocurrency trading.

**Approved Trade**:
- Token: ${opportunity.token}
- Action: ${opportunity.action}
- Max Position Size: ${riskAssessment.maxPositionSize}%
- Stop Loss: ${riskAssessment.stopLossLevel}%

**Market Conditions**:
- Current Price: $${currentPrice}
- Liquidity Data: ${JSON.stringify(liquidityData)}
- Estimated Gas: ${gasEstimate} SOL

**Your Task**:
1. Determine optimal entry price considering slippage
2. Calculate exit price target
3. Set slippage tolerance
4. Decide if order should be split to minimize impact
5. Recommend timing strategy
6. Final gas estimate

Respond in JSON format:
{
  "entryPrice": 0.00,
  "exitPrice": 0.00,
  "slippageTolerance": 0-5,
  "splitOrders": true|false,
  "orderSizes": [25, 25, 25, 25],
  "timing": "immediate|delayed|gradual",
  "estimatedGas": 0.001
}`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid response format from Execution Optimizer');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Execution Optimizer error:', error);
      // Return safe default
      return {
        entryPrice: currentPrice,
        exitPrice: currentPrice * 1.05,
        slippageTolerance: 1,
        splitOrders: false,
        orderSizes: [100],
        timing: 'immediate',
        estimatedGas: gasEstimate
      };
    }
  }
}

/**
 * Master Orchestrator - Coordinates all 3 subagents
 */
export class SubagentOrchestrator {
  private marketAnalyzer: MarketAnalyzerAgent;
  private riskManager: RiskManagerAgent;
  private executionOptimizer: ExecutionOptimizerAgent;

  constructor() {
    this.marketAnalyzer = new MarketAnalyzerAgent();
    this.riskManager = new RiskManagerAgent();
    this.executionOptimizer = new ExecutionOptimizerAgent();
  }

  async executeTradingCycle(
    agentData: any,
    tokenData: any[],
    vaultBalance: number,
    recentPerformance: any
  ) {
    console.log('\n🤖 === SUBAGENT SYSTEM ACTIVATED ===');

    // PHASE 1: Market Analysis
    console.log('\n📊 PHASE 1: Market Analyzer scanning opportunities...');
    const marketAnalysis = await this.marketAnalyzer.analyze(
      tokenData,
      agentData.purpose,
      agentData.riskTolerance || 5
    );

    console.log(`   Sentiment: ${marketAnalysis.sentiment}`);
    console.log(`   Confidence: ${marketAnalysis.confidence}%`);
    console.log(`   Opportunities found: ${marketAnalysis.opportunities.length}`);

    if (marketAnalysis.opportunities.length === 0) {
      console.log('   ⚠️ No opportunities identified. Cycle complete.');
      return { success: false, reason: 'No opportunities' };
    }

    // Pick best opportunity
    const bestOpportunity = marketAnalysis.opportunities.sort(
      (a, b) => b.expectedReturn - a.expectedReturn
    )[0];

    console.log(`   🎯 Best opportunity: ${bestOpportunity.action.toUpperCase()} ${bestOpportunity.token}`);

    // PHASE 2: Risk Assessment
    console.log('\n🛡️ PHASE 2: Risk Manager evaluating trade...');
    const riskAssessment = await this.riskManager.assessRisk(
      bestOpportunity,
      vaultBalance,
      recentPerformance,
      agentData.riskTolerance || 5,
      agentData.maxTradeSize || 10
    );

    console.log(`   Risk Level: ${riskAssessment.overallRisk.toUpperCase()}`);
    console.log(`   Max Position: ${riskAssessment.maxPositionSize}%`);
    console.log(`   Decision: ${riskAssessment.shouldProceed ? '✅ APPROVED' : '❌ REJECTED'}`);

    if (!riskAssessment.shouldProceed) {
      console.log(`   Warnings: ${riskAssessment.warnings.join(', ')}`);
      return { success: false, reason: 'Risk too high', riskAssessment };
    }

    // PHASE 3: Execution Optimization
    console.log('\n⚡ PHASE 3: Execution Optimizer planning trade...');
    const executionPlan = await this.executionOptimizer.optimizeExecution(
      bestOpportunity,
      riskAssessment,
      100, // Mock current price
      { depth: 'medium', volume: 'high' }, // Mock liquidity
      0.001 // Mock gas
    );

    console.log(`   Entry: $${executionPlan.entryPrice}`);
    console.log(`   Exit: $${executionPlan.exitPrice}`);
    console.log(`   Slippage: ${executionPlan.slippageTolerance}%`);
    console.log(`   Timing: ${executionPlan.timing}`);

    console.log('\n✅ === TRADE APPROVED FOR EXECUTION ===\n');

    return {
      success: true,
      marketAnalysis,
      riskAssessment,
      executionPlan,
      selectedOpportunity: bestOpportunity
    };
  }
}
