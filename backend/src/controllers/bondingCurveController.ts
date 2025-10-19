import { Request, Response } from 'express';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getAssociatedTokenAddress, createTransferInstruction } from '@solana/spl-token';
import BondingCurve from '../models/BondingCurve';
import BondingCurveTrade from '../models/BondingCurveTrade';
import Agent from '../models/Agent';
import {
  getQuoteBuy,
  getQuoteSell,
  getBondingCurveStats,
  BONDING_CURVE_CONFIG,
} from '../services/bondingCurve';
import { websocketService } from '../index';

const connection = new Connection(
  process.env.RPC_ENDPOINT || 'https://api.devnet.solana.com',
  'confirmed'
);

/**
 * GET /api/bonding-curve/:agentId
 * Get bonding curve information for an agent
 */
export const getBondingCurveInfo = async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;

    const agent = await Agent.findByPk(agentId);
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    let bondingCurve = await BondingCurve.findOne({ where: { agentId } });

    // If no bonding curve exists, create one
    if (!bondingCurve) {
      bondingCurve = await BondingCurve.create({
        agentId,
        tokenMint: agent.tokenMint || '',
        tokensSold: '0',
        totalValueLocked: '0',
        graduated: false,
      });
    }

    const tokensSold = parseFloat(bondingCurve.tokensSold);
    const stats = getBondingCurveStats(tokensSold);

    // Get recent trades
    const recentTrades = await BondingCurveTrade.findAll({
      where: { bondingCurveId: bondingCurve.id },
      order: [['createdAt', 'DESC']],
      limit: 20,
    });

    res.json({
      success: true,
      bondingCurve: {
        id: bondingCurve.id,
        agentId: bondingCurve.agentId,
        tokenMint: bondingCurve.tokenMint,
        tokensSold: bondingCurve.tokensSold,
        totalValueLocked: bondingCurve.totalValueLocked,
        graduated: bondingCurve.graduated,
        graduatedAt: bondingCurve.graduatedAt,
        raydiumPoolAddress: bondingCurve.raydiumPoolAddress,
        stats,
      },
      recentTrades,
      config: BONDING_CURVE_CONFIG,
    });
  } catch (error: any) {
    console.error('Error getting bonding curve info:', error);
    res.status(500).json({ error: error.message || 'Failed to get bonding curve info' });
  }
};

/**
 * POST /api/bonding-curve/quote-buy
 * Get a quote for buying tokens
 */
export const getQuoteBuyTokens = async (req: Request, res: Response) => {
  try {
    const { agentId, amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const bondingCurve = await BondingCurve.findOne({ where: { agentId } });
    if (!bondingCurve) {
      return res.status(404).json({ error: 'Bonding curve not found' });
    }

    if (bondingCurve.graduated) {
      return res.status(400).json({ error: 'Token has graduated to Raydium. Use DEX instead.' });
    }

    const tokensSold = parseFloat(bondingCurve.tokensSold);
    const quote = getQuoteBuy(tokensSold, amount);

    res.json({
      success: true,
      quote: {
        ...quote,
        totalCostSOL: quote.totalCost,
        totalCostLamports: Math.floor(quote.totalCost * LAMPORTS_PER_SOL),
      },
    });
  } catch (error: any) {
    console.error('Error getting buy quote:', error);
    res.status(500).json({ error: error.message || 'Failed to get buy quote' });
  }
};

/**
 * POST /api/bonding-curve/quote-sell
 * Get a quote for selling tokens
 */
export const getQuoteSellTokens = async (req: Request, res: Response) => {
  try {
    const { agentId, amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const bondingCurve = await BondingCurve.findOne({ where: { agentId } });
    if (!bondingCurve) {
      return res.status(404).json({ error: 'Bonding curve not found' });
    }

    if (bondingCurve.graduated) {
      return res.status(400).json({ error: 'Token has graduated to Raydium. Use DEX instead.' });
    }

    const tokensSold = parseFloat(bondingCurve.tokensSold);
    const quote = getQuoteSell(tokensSold, amount);

    res.json({
      success: true,
      quote: {
        ...quote,
        netProceedsSOL: quote.netProceeds,
        netProceedsLamports: Math.floor(quote.netProceeds * LAMPORTS_PER_SOL),
      },
    });
  } catch (error: any) {
    console.error('Error getting sell quote:', error);
    res.status(500).json({ error: error.message || 'Failed to get sell quote' });
  }
};

/**
 * POST /api/bonding-curve/buy
 * Buy tokens from bonding curve
 */
export const buyTokens = async (req: Request, res: Response) => {
  try {
    const { agentId, amount, buyerWallet, maxSlippage = 1 } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    if (!buyerWallet) {
      return res.status(400).json({ error: 'Buyer wallet required' });
    }

    const agent = await Agent.findByPk(agentId);
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    const bondingCurve = await BondingCurve.findOne({ where: { agentId } });
    if (!bondingCurve) {
      return res.status(404).json({ error: 'Bonding curve not found' });
    }

    if (bondingCurve.graduated) {
      return res.status(400).json({ error: 'Token has graduated to Raydium. Use DEX instead.' });
    }

    const tokensSold = parseFloat(bondingCurve.tokensSold);
    const quote = getQuoteBuy(tokensSold, amount);

    // Create transaction
    const buyer = new PublicKey(buyerWallet);
    const treasury = new PublicKey(process.env.TREASURY_WALLET || process.env.ADMIN_WALLET_ADDRESS!);
    const tokenMint = new PublicKey(bondingCurve.tokenMint);

    const transaction = new Transaction();

    // Transfer SOL from buyer to treasury (cost + fee)
    const totalCostLamports = Math.floor(quote.totalCost * LAMPORTS_PER_SOL);
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: buyer,
        toPubkey: treasury,
        lamports: totalCostLamports,
      })
    );

    // Get latest blockhash
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = buyer;

    // Serialize transaction
    const serialized = transaction.serialize({ requireAllSignatures: false });
    const transactionBase64 = serialized.toString('base64');

    res.json({
      success: true,
      quote,
      transaction: transactionBase64,
      blockhash,
      lastValidBlockHeight,
      message: 'Sign and send this transaction to complete the purchase',
    });
  } catch (error: any) {
    console.error('Error buying tokens:', error);
    res.status(500).json({ error: error.message || 'Failed to buy tokens' });
  }
};

/**
 * POST /api/bonding-curve/confirm-buy
 * Confirm buy transaction and update database
 */
export const confirmBuy = async (req: Request, res: Response) => {
  try {
    const { agentId, amount, signature, buyerWallet } = req.body;

    const bondingCurve = await BondingCurve.findOne({ where: { agentId } });
    if (!bondingCurve) {
      return res.status(404).json({ error: 'Bonding curve not found' });
    }

    // Verify transaction on-chain
    const tx = await connection.getTransaction(signature, { commitment: 'confirmed' });
    if (!tx) {
      return res.status(400).json({ error: 'Transaction not found or not confirmed' });
    }

    const tokensSold = parseFloat(bondingCurve.tokensSold);
    const quote = getQuoteBuy(tokensSold, amount);

    // Update bonding curve
    const newTokensSold = tokensSold + amount;
    const newTVL = parseFloat(bondingCurve.totalValueLocked) + quote.cost;

    await bondingCurve.update({
      tokensSold: newTokensSold.toString(),
      totalValueLocked: newTVL.toString(),
    });

    // Record trade
    const trade = await BondingCurveTrade.create({
      bondingCurveId: bondingCurve.id,
      agentId,
      trader: buyerWallet,
      type: 'buy',
      tokenAmount: amount.toString(),
      solAmount: quote.cost.toString(),
      platformFee: quote.platformFee.toString(),
      pricePerToken: quote.pricePerToken.toString(),
      transactionSignature: signature,
    });

    // Update candles after trade
    const { updateCandlesAfterTrade } = require('../services/priceCandles');
    updateCandlesAfterTrade(agentId).catch((err: any) => {
      console.error('Error updating candles:', err);
    });

    // Check if should graduate
    const stats = getBondingCurveStats(newTokensSold);

    // Emit WebSocket event for trade execution
    websocketService.emitTradeExecuted(agentId, {
      id: trade.id,
      agentId,
      type: 'buy',
      trader: buyerWallet,
      tokenAmount: amount.toString(),
      solAmount: quote.cost.toString(),
      pricePerToken: quote.pricePerToken.toString(),
      createdAt: trade.createdAt,
    });

    // Emit WebSocket event for price update
    websocketService.emitPriceUpdate(agentId, {
      agentId,
      currentPrice: quote.newPrice,
      tokensSold: newTokensSold,
      totalValueLocked: newTVL,
      marketCap: stats.currentPrice * BONDING_CURVE_CONFIG.TOTAL_SUPPLY,
      timestamp: new Date().toISOString(),
    });

    // Auto-graduate if eligible
    const { autoGraduateIfEligible } = require('../services/raydiumGraduation');
    let graduationResult = null;
    if (stats.canGraduate) {
      graduationResult = await autoGraduateIfEligible(agentId);
      if (graduationResult.success) {
        console.log('🎓 Agent graduated to Raydium!', graduationResult.data);

        // Emit WebSocket event for graduation
        websocketService.emitGraduation(agentId, {
          agentId,
          poolId: graduationResult.data.poolId,
          timestamp: new Date().toISOString(),
        });
      }
    }

    res.json({
      success: true,
      message: 'Purchase confirmed',
      bondingCurve: {
        tokensSold: newTokensSold,
        totalValueLocked: newTVL,
        stats,
      },
      graduation: graduationResult,
    });
  } catch (error: any) {
    console.error('Error confirming buy:', error);
    res.status(500).json({ error: error.message || 'Failed to confirm purchase' });
  }
};

/**
 * GET /api/bonding-curve/chart/:agentId
 * Get chart data for bonding curve
 */
export const getChartData = async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;

    const bondingCurve = await BondingCurve.findOne({ where: { agentId } });
    if (!bondingCurve) {
      return res.status(404).json({ error: 'Bonding curve not found' });
    }

    const trades = await BondingCurveTrade.findAll({
      where: { bondingCurveId: bondingCurve.id },
      order: [['createdAt', 'ASC']],
    });

    const chartData = trades.map(trade => ({
      timestamp: trade.createdAt,
      price: parseFloat(trade.pricePerToken),
      volume: parseFloat(trade.tokenAmount),
      type: trade.type,
    }));

    res.json({
      success: true,
      chartData,
    });
  } catch (error: any) {
    console.error('Error getting chart data:', error);
    res.status(500).json({ error: error.message || 'Failed to get chart data' });
  }
};
