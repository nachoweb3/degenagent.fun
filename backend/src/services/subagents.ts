import { GoogleGenerativeAI } from '@google/generative-ai';
import { websocketService } from '../index';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Subagent Decision Log for learning
interface SubagentDecision {
  timestamp: Date;
  subagent: 'market' | 'risk' | 'execution';
  decision: any;
  outcome?: 'success' | 'failure';
  profit?: number;
}

const decisionHistory: Map<string, SubagentDecision[]> = new Map();

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
    riskTolerance: number,
    agentId?: string
  ): Promise<MarketAnalysis> {
    // Get past decisions for learning
    const pastDecisions = agentId ? decisionHistory.get(agentId) || [] : [];
    const recentDecisions = pastDecisions.slice(-10); // Last 10 decisions

    // Calculate success rate
    const successfulDecisions = recentDecisions.filter(d => d.outcome === 'success').length;
    const successRate = recentDecisions.length > 0
      ? (successfulDecisions / recentDecisions.length * 100).toFixed(1)
      : 'N/A';

    const prompt = `You are a MARKET ANALYZER AI specializing in cryptocurrency trading on Solana.

**Your Mission**: ${agentPurpose}

**Current Market Data**:
${JSON.stringify(tokenData, null, 2)}

**Risk Tolerance**: ${riskTolerance}/10 (1=conservative, 10=aggressive)

**Your Performance History**:
- Total Decisions: ${recentDecisions.length}
- Success Rate: ${successRate}%
- Recent Outcomes: ${recentDecisions.map(d => d.outcome || 'pending').join(', ')}

**Past Successful Patterns** (learn from these):
${recentDecisions
  .filter(d => d.outcome === 'success' && d.profit && d.profit > 0)
  .map(d => `- ${JSON.stringify(d.decision).substring(0, 100)}... (+${d.profit?.toFixed(2)}%)`)
  .join('\n') || 'No successful trades yet'}

**Failed Patterns** (avoid these):
${recentDecisions
  .filter(d => d.outcome === 'failure' || (d.profit && d.profit < 0))
  .map(d => `- ${JSON.stringify(d.decision).substring(0, 100)}... (${d.profit?.toFixed(2)}%)`)
  .join('\n') || 'No failed trades yet'}

**Your Task**:
1. Analyze current market sentiment for each token
2. Identify trading opportunities aligned with the agent's mission
3. Learn from past successful/failed patterns
4. Provide confidence levels based on historical performance
5. List key market trends affecting decisions

**IMPORTANT**:
- If you see repeated failures with certain patterns, avoid them
- If certain strategies work, emphasize them
- Adapt your confidence based on past accuracy
- Consider market conditions that led to past successes

Respond in JSON format:
{
  "sentiment": "bullish|bearish|neutral",
  "confidence": 0-100,
  "opportunities": [
    {
      "token": "SOL",
      "action": "buy|sell|hold",
      "reasoning": "detailed explanation with reference to past patterns",
      "expectedReturn": 0-100,
      "similarPastTrades": 2
    }
  ],
  "marketTrends": ["trend1", "trend2"],
  "learningNotes": "what I learned from past decisions"
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
 * Helper Functions for Decision Tracking
 */
export function logSubagentDecision(
  agentId: string,
  subagent: 'market' | 'risk' | 'execution',
  decision: any
) {
  if (!decisionHistory.has(agentId)) {
    decisionHistory.set(agentId, []);
  }

  const history = decisionHistory.get(agentId)!;
  history.push({
    timestamp: new Date(),
    subagent,
    decision
  });

  // Keep only last 100 decisions per agent
  if (history.length > 100) {
    history.shift();
  }

  console.log(`[SUBAGENT LOG] ${subagent} decision recorded for agent ${agentId}`);
}

export function updateDecisionOutcome(
  agentId: string,
  outcome: 'success' | 'failure',
  profit?: number
) {
  const history = decisionHistory.get(agentId);
  if (history && history.length > 0) {
    const lastDecision = history[history.length - 1];
    lastDecision.outcome = outcome;
    lastDecision.profit = profit;

    console.log(`[SUBAGENT LOG] Decision outcome updated: ${outcome} ${profit ? `(${profit.toFixed(2)}%)` : ''}`);
  }
}

export function getAgentPerformanceStats(agentId: string) {
  const history = decisionHistory.get(agentId) || [];
  const completedDecisions = history.filter(d => d.outcome);

  const successCount = completedDecisions.filter(d => d.outcome === 'success').length;
  const failCount = completedDecisions.filter(d => d.outcome === 'failure').length;
  const totalProfit = completedDecisions.reduce((sum, d) => sum + (d.profit || 0), 0);

  return {
    totalDecisions: history.length,
    completedDecisions: completedDecisions.length,
    successCount,
    failCount,
    successRate: completedDecisions.length > 0
      ? (successCount / completedDecisions.length * 100).toFixed(2)
      : '0',
    totalProfit: totalProfit.toFixed(2),
    avgProfit: completedDecisions.length > 0
      ? (totalProfit / completedDecisions.length).toFixed(2)
      : '0'
  };
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
    const agentId = agentData.id;
    const cycleStartTime = Date.now();

    console.log('\n🤖 === SUBAGENT SYSTEM ACTIVATED ===');
    console.log(`   Agent: ${agentData.name} (ID: ${agentId})`);

    // Get performance stats
    const perfStats = getAgentPerformanceStats(agentId);
    console.log(`   📊 Performance: ${perfStats.successRate}% success rate, ${perfStats.totalProfit}% total profit`);

    // Emit WebSocket event: Cycle Started
    websocketService.emitSubagentActivity({
      agentId,
      agentName: agentData.name,
      phase: 'start',
      message: `Subagent system activated. Success rate: ${perfStats.successRate}%`,
      timestamp: new Date().toISOString()
    });

    // PHASE 1: Market Analysis
    console.log('\n📊 PHASE 1: Market Analyzer scanning opportunities...');
    websocketService.emitSubagentActivity({
      agentId,
      agentName: agentData.name,
      phase: 'market_analysis',
      subagent: 'market',
      message: 'Analyzing market conditions and identifying opportunities...',
      timestamp: new Date().toISOString()
    });

    const marketAnalysis = await this.marketAnalyzer.analyze(
      tokenData,
      agentData.purpose,
      agentData.riskTolerance || 5,
      agentId // Pass agent ID for learning
    );

    // Log market decision
    logSubagentDecision(agentId, 'market', marketAnalysis);

    console.log(`   Sentiment: ${marketAnalysis.sentiment}`);
    console.log(`   Confidence: ${marketAnalysis.confidence}%`);
    console.log(`   Opportunities found: ${marketAnalysis.opportunities.length}`);

    websocketService.emitSubagentActivity({
      agentId,
      agentName: agentData.name,
      phase: 'market_analysis',
      subagent: 'market',
      message: `Found ${marketAnalysis.opportunities.length} opportunities. Sentiment: ${marketAnalysis.sentiment} (${marketAnalysis.confidence}% confidence)`,
      data: { sentiment: marketAnalysis.sentiment, confidence: marketAnalysis.confidence },
      timestamp: new Date().toISOString()
    });

    if (marketAnalysis.opportunities.length === 0) {
      console.log('   ⚠️ No opportunities identified. Cycle complete.');
      websocketService.emitSubagentActivity({
        agentId,
        agentName: agentData.name,
        phase: 'complete',
        message: 'No opportunities found. Waiting for better market conditions.',
        timestamp: new Date().toISOString()
      });
      return { success: false, reason: 'No opportunities' };
    }

    // Pick best opportunity
    const bestOpportunity = marketAnalysis.opportunities.sort(
      (a, b) => b.expectedReturn - a.expectedReturn
    )[0];

    console.log(`   🎯 Best opportunity: ${bestOpportunity.action.toUpperCase()} ${bestOpportunity.token}`);

    // PHASE 2: Risk Assessment
    console.log('\n🛡️ PHASE 2: Risk Manager evaluating trade...');
    websocketService.emitSubagentActivity({
      agentId,
      agentName: agentData.name,
      phase: 'risk_assessment',
      subagent: 'risk',
      message: `Evaluating risk for ${bestOpportunity.action.toUpperCase()} ${bestOpportunity.token}...`,
      timestamp: new Date().toISOString()
    });

    const riskAssessment = await this.riskManager.assessRisk(
      bestOpportunity,
      vaultBalance,
      recentPerformance,
      agentData.riskTolerance || 5,
      agentData.maxTradeSize || 10
    );

    // Log risk decision
    logSubagentDecision(agentId, 'risk', riskAssessment);

    console.log(`   Risk Level: ${riskAssessment.overallRisk.toUpperCase()}`);
    console.log(`   Max Position: ${riskAssessment.maxPositionSize}%`);
    console.log(`   Decision: ${riskAssessment.shouldProceed ? '✅ APPROVED' : '❌ REJECTED'}`);

    websocketService.emitSubagentActivity({
      agentId,
      agentName: agentData.name,
      phase: 'risk_assessment',
      subagent: 'risk',
      message: `Risk: ${riskAssessment.overallRisk}. ${riskAssessment.shouldProceed ? 'TRADE APPROVED ✅' : 'TRADE REJECTED ❌'}`,
      data: {
        risk: riskAssessment.overallRisk,
        approved: riskAssessment.shouldProceed,
        maxPosition: riskAssessment.maxPositionSize
      },
      timestamp: new Date().toISOString()
    });

    if (!riskAssessment.shouldProceed) {
      console.log(`   Warnings: ${riskAssessment.warnings.join(', ')}`);
      websocketService.emitSubagentActivity({
        agentId,
        agentName: agentData.name,
        phase: 'complete',
        message: `Trade rejected: ${riskAssessment.warnings[0] || 'Risk too high'}`,
        timestamp: new Date().toISOString()
      });
      return { success: false, reason: 'Risk too high', riskAssessment };
    }

    // PHASE 3: Execution Optimization
    console.log('\n⚡ PHASE 3: Execution Optimizer planning trade...');
    websocketService.emitSubagentActivity({
      agentId,
      agentName: agentData.name,
      phase: 'execution_optimization',
      subagent: 'execution',
      message: 'Optimizing trade execution for best price...',
      timestamp: new Date().toISOString()
    });

    const executionPlan = await this.executionOptimizer.optimizeExecution(
      bestOpportunity,
      riskAssessment,
      100, // Mock current price
      { depth: 'medium', volume: 'high' }, // Mock liquidity
      0.001 // Mock gas
    );

    // Log execution decision
    logSubagentDecision(agentId, 'execution', executionPlan);

    console.log(`   Entry: $${executionPlan.entryPrice}`);
    console.log(`   Exit: $${executionPlan.exitPrice}`);
    console.log(`   Slippage: ${executionPlan.slippageTolerance}%`);
    console.log(`   Timing: ${executionPlan.timing}`);

    const cycleTime = ((Date.now() - cycleStartTime) / 1000).toFixed(2);
    console.log(`\n✅ === TRADE APPROVED FOR EXECUTION (${cycleTime}s) ===\n`);

    websocketService.emitSubagentActivity({
      agentId,
      agentName: agentData.name,
      phase: 'execution_optimization',
      subagent: 'execution',
      message: `Trade optimized! Entry: $${executionPlan.entryPrice}, Exit: $${executionPlan.exitPrice}, Slippage: ${executionPlan.slippageTolerance}%`,
      data: {
        entryPrice: executionPlan.entryPrice,
        exitPrice: executionPlan.exitPrice,
        slippage: executionPlan.slippageTolerance
      },
      timestamp: new Date().toISOString()
    });

    websocketService.emitSubagentActivity({
      agentId,
      agentName: agentData.name,
      phase: 'complete',
      message: `✅ Trade approved! Ready for execution (cycle: ${cycleTime}s)`,
      data: { cycleTime },
      timestamp: new Date().toISOString()
    });

    return {
      success: true,
      marketAnalysis,
      riskAssessment,
      executionPlan,
      selectedOpportunity: bestOpportunity,
      cycleTime: parseFloat(cycleTime)
    };
  }
}
