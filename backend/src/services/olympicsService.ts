import { Olympics, OlympicsEntry } from '../models/Olympics';
import { SubagentOrchestrator } from './subagents';
import { Op } from 'sequelize';

/**
 * AGENT OLYMPICS SERVICE
 * Manages weekly competitions with AI-powered scoring
 */

export class OlympicsService {
  private orchestrator: SubagentOrchestrator;

  constructor() {
    this.orchestrator = new SubagentOrchestrator();
  }

  /**
   * Create a new Olympics competition
   */
  async createOlympics(data: {
    name: string;
    description: string;
    startDate: Date;
    endDate: Date;
    entryFee: string;
    maxParticipants?: number;
  }) {
    const olympics = await Olympics.create({
      ...data,
      status: 'upcoming',
      prizePool: '0',
      platformCut: 30,
      categories: ['roi', 'volume', 'risk_adjusted'],
    });

    console.log(`🏆 Olympics created: ${olympics.name} (${olympics.id})`);
    return olympics;
  }

  /**
   * Enter an agent into the Olympics
   */
  async enterAgent(olympicsId: string, agentData: {
    agentId: string;
    agentPubkey: string;
    ownerWallet: string;
    entryTxSignature: string;
    startingBalance: string;
  }) {
    const olympics = await Olympics.findByPk(olympicsId);
    if (!olympics) throw new Error('Olympics not found');

    if (olympics.status !== 'active' && olympics.status !== 'upcoming') {
      throw new Error('Olympics not accepting entries');
    }

    // Check max participants
    if (olympics.maxParticipants) {
      const entryCount = await OlympicsEntry.count({ where: { olympicsId } });
      if (entryCount >= olympics.maxParticipants) {
        throw new Error('Olympics is full');
      }
    }

    // Create entry
    const entry = await OlympicsEntry.create({
      olympicsId,
      ...agentData,
      currentBalance: agentData.startingBalance,
    });

    // Update prize pool
    const newPrizePool = parseFloat(olympics.prizePool) + parseFloat(olympics.entryFee);
    await olympics.update({ prizePool: newPrizePool.toString() });

    console.log(`✅ Agent ${agentData.agentId} entered Olympics ${olympics.name}`);
    console.log(`   Prize Pool: ${newPrizePool} SOL`);

    return entry;
  }

  /**
   * Update agent performance during Olympics
   * Called after each trade
   */
  async updateAgentPerformance(
    olympicsId: string,
    agentId: string,
    tradeData: {
      newBalance: string;
      tradeVolume: string;
      tradeProfit: string;
      wasSuccessful: boolean;
    }
  ) {
    const entry = await OlympicsEntry.findOne({
      where: { olympicsId, agentId, status: 'active' }
    });

    if (!entry) return;

    const startingBalance = parseFloat(entry.startingBalance);
    const currentBalance = parseFloat(tradeData.newBalance);
    const totalProfit = currentBalance - startingBalance;
    const roi = (totalProfit / startingBalance) * 100;

    // Calculate Sharpe Ratio (simplified)
    // In production, you'd track returns over time
    const sharpeRatio = roi / Math.max(Math.abs(entry.maxDrawdown), 1);

    // Update drawdown if needed
    const currentDrawdown = ((currentBalance - startingBalance) / startingBalance) * 100;
    const maxDrawdown = Math.min(entry.maxDrawdown, currentDrawdown);

    await entry.update({
      currentBalance: tradeData.newBalance,
      totalTrades: entry.totalTrades + 1,
      successfulTrades: entry.successfulTrades + (tradeData.wasSuccessful ? 1 : 0),
      totalVolume: (parseFloat(entry.totalVolume) + parseFloat(tradeData.tradeVolume)).toString(),
      totalProfit: totalProfit.toString(),
      roi,
      sharpeRatio,
      maxDrawdown,
    });

    console.log(`📊 Updated Olympics performance for agent ${agentId}`);
    console.log(`   ROI: ${roi.toFixed(2)}% | Volume: ${entry.totalVolume} SOL`);

    // Recalculate rankings
    await this.recalculateRankings(olympicsId);
  }

  /**
   * Recalculate all rankings using SUBAGENT scoring
   */
  async recalculateRankings(olympicsId: string) {
    const entries = await OlympicsEntry.findAll({
      where: { olympicsId, status: 'active' },
      order: [['roi', 'DESC']]
    });

    // ROI Rankings
    entries.forEach((entry, index) => {
      entry.rank = { ...entry.rank, roi: index + 1 };
      entry.scores = { ...entry.scores, roi: entry.roi };
    });

    // Volume Rankings
    const volumeSorted = [...entries].sort((a, b) =>
      parseFloat(b.totalVolume) - parseFloat(a.totalVolume)
    );
    volumeSorted.forEach((entry, index) => {
      entry.rank = { ...entry.rank, volume: index + 1 };
      entry.scores = { ...entry.scores, volume: parseFloat(entry.totalVolume) };
    });

    // Risk-Adjusted Rankings (Sharpe Ratio)
    const sharpeSorted = [...entries].sort((a, b) => b.sharpeRatio - a.sharpeRatio);
    sharpeSorted.forEach((entry, index) => {
      entry.rank = { ...entry.rank, riskAdjusted: index + 1 };
      entry.scores = { ...entry.scores, riskAdjusted: entry.sharpeRatio };
    });

    // Save all updates
    await Promise.all(entries.map(entry => entry.save()));

    console.log(`🏅 Rankings updated for Olympics ${olympicsId}`);
    console.log(`   Top ROI: ${entries[0]?.agentId} (${entries[0]?.roi.toFixed(2)}%)`);
  }

  /**
   * Get live leaderboard
   */
  async getLeaderboard(olympicsId: string, category: 'roi' | 'volume' | 'risk_adjusted' = 'roi') {
    const olympics = await Olympics.findByPk(olympicsId);
    if (!olympics) throw new Error('Olympics not found');

    let orderBy: string;
    switch (category) {
      case 'roi':
        orderBy = 'roi';
        break;
      case 'volume':
        orderBy = 'totalVolume';
        break;
      case 'risk_adjusted':
        orderBy = 'sharpeRatio';
        break;
      default:
        orderBy = 'roi';
    }

    const entries = await OlympicsEntry.findAll({
      where: { olympicsId, status: 'active' },
      order: [[orderBy, 'DESC']],
      limit: 50,
    });

    return {
      olympics: {
        id: olympics.id,
        name: olympics.name,
        status: olympics.status,
        prizePool: olympics.prizePool,
        entryFee: olympics.entryFee,
        startDate: olympics.startDate,
        endDate: olympics.endDate,
        participantCount: entries.length,
      },
      leaderboard: entries.map((entry, index) => ({
        rank: index + 1,
        agentId: entry.agentId,
        agentPubkey: entry.agentPubkey,
        ownerWallet: entry.ownerWallet,
        roi: entry.roi,
        totalVolume: entry.totalVolume,
        sharpeRatio: entry.sharpeRatio,
        totalTrades: entry.totalTrades,
        successRate: entry.totalTrades > 0 ? (entry.successfulTrades / entry.totalTrades) * 100 : 0,
        currentBalance: entry.currentBalance,
        profit: entry.totalProfit,
        scores: entry.scores,
        ranks: entry.rank,
      })),
    };
  }

  /**
   * Finalize Olympics and distribute prizes
   */
  async finalizeOlympics(olympicsId: string) {
    const olympics = await Olympics.findByPk(olympicsId);
    if (!olympics) throw new Error('Olympics not found');

    if (olympics.status !== 'active') {
      throw new Error('Olympics not active');
    }

    // Get winners for each category
    const roiWinner = await OlympicsEntry.findOne({
      where: { olympicsId, status: 'active' },
      order: [['roi', 'DESC']],
    });

    const volumeWinner = await OlympicsEntry.findOne({
      where: { olympicsId, status: 'active' },
      order: [['totalVolume', 'DESC']],
    });

    const riskAdjustedWinner = await OlympicsEntry.findOne({
      where: { olympicsId, status: 'active' },
      order: [['sharpeRatio', 'DESC']],
    });

    const totalPrizePool = parseFloat(olympics.prizePool);
    const playerShare = totalPrizePool * (1 - olympics.platformCut / 100);
    const prizePerWinner = playerShare / 3; // Split between 3 categories

    const platformRevenue = totalPrizePool * (olympics.platformCut / 100);

    await olympics.update({ status: 'completed' });

    console.log(`\n🏆 === OLYMPICS COMPLETED: ${olympics.name} ===`);
    console.log(`   Prize Pool: ${totalPrizePool} SOL`);
    console.log(`   Platform Revenue: ${platformRevenue} SOL (${olympics.platformCut}%)`);
    console.log(`   Prize per Category: ${prizePerWinner.toFixed(2)} SOL`);
    console.log(`\n🥇 WINNERS:`);
    console.log(`   ROI Champion: ${roiWinner?.agentPubkey} (${roiWinner?.roi.toFixed(2)}%)`);
    console.log(`   Volume King: ${volumeWinner?.agentPubkey} (${volumeWinner?.totalVolume} SOL)`);
    console.log(`   Risk Master: ${riskAdjustedWinner?.agentPubkey} (Sharpe: ${riskAdjustedWinner?.sharpeRatio.toFixed(2)})`);

    return {
      olympics,
      winners: {
        roi: roiWinner,
        volume: volumeWinner,
        riskAdjusted: riskAdjustedWinner,
      },
      prizes: {
        perCategory: prizePerWinner,
        platformRevenue,
      },
    };
  }

  /**
   * Get current active Olympics
   */
  async getCurrentOlympics() {
    return await Olympics.findOne({
      where: {
        status: { [Op.in]: ['active', 'upcoming'] },
      },
      order: [['startDate', 'ASC']],
    });
  }

  /**
   * Auto-start Olympics when time comes
   */
  async checkAndStartOlympics() {
    const upcoming = await Olympics.findAll({
      where: {
        status: 'upcoming',
        startDate: { [Op.lte]: new Date() },
      },
    });

    for (const olympics of upcoming) {
      await olympics.update({ status: 'active' });
      console.log(`🚀 Olympics STARTED: ${olympics.name}`);
    }
  }

  /**
   * Auto-end Olympics when time expires
   */
  async checkAndEndOlympics() {
    const active = await Olympics.findAll({
      where: {
        status: 'active',
        endDate: { [Op.lte]: new Date() },
      },
    });

    for (const olympics of active) {
      await this.finalizeOlympics(olympics.id);
    }
  }
}

export default new OlympicsService();
