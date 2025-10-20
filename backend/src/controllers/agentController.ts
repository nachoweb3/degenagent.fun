import { Request, Response } from 'express';
import {
  PublicKey,
  Transaction,
  Keypair,
  SystemProgram,
  LAMPORTS_PER_SOL
} from '@solana/web3.js';
import { connection, websocketService } from '../index';
import {
  createAgent,
  getAgentState,
  depositFunds,
  getAllActiveAgents
} from '../services/solana';
import {
  saveAgentKeypair,
  getAgentKeypair
} from '../services/keyManager';
import Agent from '../models/Agent';
import BondingCurve from '../models/BondingCurve';
import crypto from 'crypto';
import { createTokenForAgent, needsTokenCreation, getTokenCreationCost } from '../services/lazyTokenCreation';

export async function createAgentHandler(req: Request, res: Response) {
  try {
    const {
      name,
      symbol,
      purpose,
      creatorWallet,
      riskTolerance,
      tradingFrequency,
      maxTradeSize,
      imageData, // NEW: base64 image from frontend
      website,
      telegram,
      twitter,
      lazyMode // NEW: if true, skip token creation (FREE agent creation!)
    } = req.body;

    // Validation
    if (!name || !symbol || !purpose || !creatorWallet) {
      return res.status(400).json({
        error: 'Missing required fields: name, symbol, purpose, creatorWallet'
      });
    }

    if (name.length > 32 || symbol.length > 10 || purpose.length > 200) {
      return res.status(400).json({
        error: 'Field length validation failed'
      });
    }

    // Generate agent wallet keypair
    const agentWallet = Keypair.generate();

    console.log(`Creating agent for creator: ${creatorWallet}`);
    console.log(`Generated agent wallet: ${agentWallet.publicKey.toString()}`);
    console.log(`Lazy mode: ${lazyMode ? 'YES (FREE)' : 'NO (create token now)'}`);

    let result: any;

    // OPTIMIZATION: Lazy mode = FREE agent creation!
    if (lazyMode) {
      // Skip token creation, will be created on first deposit
      result = {
        agentPubkey: agentWallet.publicKey.toString(),
        tokenMint: 'pending', // Will be created later
        vault: 'pending',
        transaction: null, // No transaction needed!
        tokenMintKeypair: null,
        blockhash: null,
        lastValidBlockHeight: null
      };
      console.log('✅ FREE agent creation (lazy mode)');
    } else {
      // Create agent transaction with token mint (normal mode)
      result = await createAgent(
        new PublicKey(creatorWallet),
        name,
        symbol,
        purpose,
        agentWallet.publicKey
      );
      console.log('💰 Standard agent creation (~0.0025 SOL)');
    }

    // Save agent private key securely
    await saveAgentKeypair(agentWallet.publicKey.toString(), agentWallet.secretKey);

    // Generate onchain ID
    const onchainId = crypto.randomBytes(16).toString('hex');

    // Save agent to database
    const agent = await Agent.create({
      onchainId,
      name,
      symbol: symbol || undefined, // NEW: save symbol
      imageUrl: imageData || undefined, // NEW: save image
      purpose,
      owner: creatorWallet,
      walletAddress: agentWallet.publicKey.toString(),
      encryptedPrivateKey: 'encrypted', // Already saved via keyManager
      tokenMint: result.tokenMint,
      status: 'active',
      balance: '0',
      tradingEnabled: true,
      aiModel: 'gemini-pro',
      riskLevel: riskTolerance === 1 || riskTolerance === 2 || riskTolerance === 3 ? 'low' :
                 riskTolerance >= 8 ? 'high' : 'medium',
      riskTolerance: riskTolerance || 5,
      tradingFrequency: tradingFrequency || 'medium',
      maxTradeSize: maxTradeSize || 10,
      useSubagents: true,
      totalTrades: 0,
      successfulTrades: 0,
      totalVolume: '0',
      totalRevenue: '0',
      totalProfit: '0',
      website: website || undefined,
      telegram: telegram || undefined,
      twitter: twitter || undefined
    });

    console.log(`✅ Agent saved to database: ${agent.id}`);

    // Initialize bonding curve for the agent
    await BondingCurve.create({
      agentId: agent.id,
      tokenMint: result.tokenMint,
      tokensSold: '0',
      totalValueLocked: '0',
      graduated: false,
    });
    console.log(`✅ Bonding curve initialized for agent: ${agent.id}`);

    // Generate initial synthetic candles for all timeframes
    const { generateSyntheticCandles } = require('../services/priceCandles');
    const timeframes: Array<'1m' | '5m' | '15m' | '1h' | '4h' | '1d'> = ['1m', '5m', '15m', '1h', '4h', '1d'];
    for (const timeframe of timeframes) {
      await generateSyntheticCandles(agent.id, timeframe);
    }
    console.log(`✅ Initial candles generated for agent: ${agent.id}`);

    // Emit WebSocket event for new agent
    websocketService.emitNewAgent({
      id: agent.id,
      name: agent.name,
      symbol: symbol,
      purpose: agent.purpose,
      tokenMint: result.tokenMint,
      creatorWallet: creatorWallet,
      timestamp: new Date().toISOString(),
    });

    res.json({
      success: true,
      agentId: agent.id,
      agentPubkey: result.agentPubkey,
      agentWallet: agentWallet.publicKey.toString(),
      tokenMint: result.tokenMint,
      transaction: result.transaction,
      tokenMintKeypair: result.tokenMintKeypair, // Send keypair to frontend
      blockhash: result.blockhash,
      lastValidBlockHeight: result.lastValidBlockHeight,
      message: 'Agent created successfully. Sign and send the transaction.'
    });

  } catch (error: any) {
    console.error('Error creating agent:', error);
    res.status(500).json({
      error: 'Failed to create agent',
      details: error.message
    });
  }
}

export async function getAgentHandler(req: Request, res: Response) {
  try {
    const { pubkey } = req.params;

    if (!pubkey) {
      return res.status(400).json({ error: 'Agent pubkey required' });
    }

    // Try to find agent in database first (by ID or wallet address)
    const dbAgent = await Agent.findOne({
      where: {
        [require('sequelize').Op.or]: [
          { id: pubkey },
          { walletAddress: pubkey }
        ]
      }
    });

    if (dbAgent) {
      // Return from database
      return res.json({
        id: dbAgent.id,
        pubkey: dbAgent.walletAddress,
        name: dbAgent.name,
        symbol: dbAgent.symbol, // NEW: include symbol
        imageUrl: dbAgent.imageUrl, // NEW: include image
        purpose: dbAgent.purpose,
        tokenMint: dbAgent.tokenMint,
        agentWallet: dbAgent.walletAddress,
        vaultBalance: parseFloat(dbAgent.balance) || 0,
        totalTrades: dbAgent.totalTrades,
        totalVolume: dbAgent.totalVolume,
        totalProfit: dbAgent.totalProfit,
        status: dbAgent.status === 'active' ? 'Active' : 'Paused',
        riskLevel: dbAgent.riskLevel,
        aiModel: dbAgent.aiModel,
        website: dbAgent.website, // NEW: include socials
        telegram: dbAgent.telegram,
        twitter: dbAgent.twitter,
        riskTolerance: dbAgent.riskTolerance,
        tradingFrequency: dbAgent.tradingFrequency,
        maxTradeSize: dbAgent.maxTradeSize,
        recentTrades: []
      });
    }

    // Fallback to on-chain lookup
    let agentPubkey: PublicKey;
    try {
      agentPubkey = new PublicKey(pubkey);
    } catch (error) {
      return res.status(404).json({
        error: 'Agent not found',
        details: 'No agent found with this ID or public key'
      });
    }
    const agentData = await getAgentState(agentPubkey);

    if (!agentData) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    // Get vault balance
    const vaultBalance = await connection.getBalance(new PublicKey(agentData.vault));

    // Get recent transactions
    const signatures = await connection.getSignaturesForAddress(
      agentPubkey,
      { limit: 20 }
    );

    const recentTrades = signatures.map(sig => ({
      signature: sig.signature,
      timestamp: sig.blockTime,
      slot: sig.slot
    }));

    res.json({
      pubkey: agentPubkey.toString(),
      name: agentData.name,
      purpose: agentData.purpose,
      tokenMint: agentData.tokenMint.toString(),
      agentWallet: agentData.agentWallet.toString(),
      vaultBalance: vaultBalance / LAMPORTS_PER_SOL,
      totalTrades: agentData.totalTrades.toString(),
      totalVolume: agentData.totalVolume.toString(),
      revenuePool: agentData.revenuePool.toString(),
      status: agentData.state.active ? 'Active' : 'Paused',
      recentTrades
    });

  } catch (error: any) {
    console.error('Error getting agent:', error);
    res.status(500).json({
      error: 'Failed to get agent data',
      details: error.message
    });
  }
}

export async function depositFundsHandler(req: Request, res: Response) {
  try {
    const { pubkey } = req.params;
    const { amount, userWallet } = req.body;

    if (!amount || !userWallet) {
      return res.status(400).json({
        error: 'Missing required fields: amount, userWallet'
      });
    }

    const amountLamports = Math.floor(amount * LAMPORTS_PER_SOL);

    const transaction = await depositFunds(
      new PublicKey(pubkey),
      new PublicKey(userWallet),
      amountLamports
    );

    res.json({
      success: true,
      transaction,
      message: 'Deposit transaction created. Sign and send.'
    });

  } catch (error: any) {
    console.error('Error creating deposit transaction:', error);
    res.status(500).json({
      error: 'Failed to create deposit transaction',
      details: error.message
    });
  }
}

export async function getAllAgentsHandler(req: Request, res: Response) {
  try {
    // Get all active agents from database (not blockchain)
    const dbAgents = await Agent.findAll({
      where: { status: 'active' },
      order: [['createdAt', 'DESC']],
      limit: 100
    });

    // Format agents for frontend (like pump.fun tokens)
    const agents = dbAgents.map(agent => ({
      id: agent.id,
      pubkey: agent.walletAddress,
      name: agent.name,
      symbol: agent.symbol || agent.name.substring(0, 4).toUpperCase(),
      imageUrl: agent.imageUrl,
      purpose: agent.purpose,
      tokenMint: agent.tokenMint,
      owner: agent.owner,
      balance: parseFloat(agent.balance) || 0,
      totalTrades: agent.totalTrades,
      totalVolume: agent.totalVolume,
      totalProfit: agent.totalProfit,
      riskLevel: agent.riskLevel,
      riskTolerance: agent.riskTolerance,
      tradingFrequency: agent.tradingFrequency,
      maxTradeSize: agent.maxTradeSize,
      website: agent.website,
      telegram: agent.telegram,
      twitter: agent.twitter,
      createdAt: agent.createdAt
    }));

    res.json({
      success: true,
      count: agents.length,
      agents
    });

  } catch (error: any) {
    console.error('Error getting all agents:', error);
    res.status(500).json({
      error: 'Failed to get agents',
      details: error.message
    });
  }
}

export async function getTreasuryWallet(req: Request, res: Response) {
  try {
    const treasuryWallet = process.env.TREASURY_WALLET || 'TReasuryWa11et1111111111111111111111111111';

    res.json({
      success: true,
      treasuryWallet,
      message: 'Treasury wallet address for 1% platform fee collection'
    });

  } catch (error: any) {
    console.error('Error getting treasury wallet:', error);
    res.status(500).json({
      error: 'Failed to get treasury wallet',
      details: error.message
    });
  }
}

export async function createTokenHandler(req: Request, res: Response) {
  try {
    const { agentId } = req.params;
    const { creatorWallet } = req.body;

    if (!creatorWallet) {
      return res.status(400).json({
        error: 'Missing required field: creatorWallet'
      });
    }

    // Find agent in database
    const agent = await Agent.findByPk(agentId);

    if (!agent) {
      return res.status(404).json({
        error: 'Agent not found'
      });
    }

    // Check if agent already has a token
    if (agent.tokenMint && agent.tokenMint !== 'pending') {
      return res.status(400).json({
        error: 'Agent already has a token mint',
        tokenMint: agent.tokenMint
      });
    }

    // Get symbol from agent name (or use default)
    const symbol = agent.name.substring(0, 10).toUpperCase().replace(/\s/g, '');

    // Create token
    const result = await createTokenForAgent(
      new PublicKey(creatorWallet),
      agentId,
      symbol
    );

    // Get cost estimate
    const cost = await getTokenCreationCost();

    console.log(`✅ Token created for agent ${agentId}: ${result.tokenMint}`);

    res.json({
      success: true,
      agentId: agent.id,
      tokenMint: result.tokenMint,
      transaction: result.transaction,
      tokenMintKeypair: result.tokenMintKeypair,
      blockhash: result.blockhash,
      lastValidBlockHeight: result.lastValidBlockHeight,
      estimatedCost: cost,
      message: `Token creation ready. Cost: ~${cost.toFixed(4)} SOL. Sign and send the transaction.`
    });

  } catch (error: any) {
    console.error('Error creating token:', error);
    res.status(500).json({
      error: 'Failed to create token',
      details: error.message
    });
  }
}

export async function getTokenCreationCostHandler(req: Request, res: Response) {
  try {
    const cost = await getTokenCreationCost();

    res.json({
      success: true,
      cost,
      costFormatted: `${cost.toFixed(4)} SOL`,
      costUSD: `~$${(cost * 200).toFixed(2)} USD @ $200/SOL`,
      message: 'Estimated cost for creating agent token'
    });

  } catch (error: any) {
    console.error('Error getting token creation cost:', error);
    res.status(500).json({
      error: 'Failed to get token creation cost',
      details: error.message
    });
  }
}
