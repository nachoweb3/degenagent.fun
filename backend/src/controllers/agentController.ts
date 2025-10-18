import { Request, Response } from 'express';
import {
  PublicKey,
  Transaction,
  Keypair,
  SystemProgram,
  LAMPORTS_PER_SOL
} from '@solana/web3.js';
import { connection } from '../index';
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
import crypto from 'crypto';

export async function createAgentHandler(req: Request, res: Response) {
  try {
    const {
      name,
      symbol,
      purpose,
      creatorWallet,
      riskTolerance,
      tradingFrequency,
      maxTradeSize
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

    // Create agent transaction
    const result = await createAgent(
      new PublicKey(creatorWallet),
      name,
      symbol,
      purpose,
      agentWallet.publicKey
    );

    // Save agent private key securely
    await saveAgentKeypair(agentWallet.publicKey.toString(), agentWallet.secretKey);

    // Generate onchain ID
    const onchainId = crypto.randomBytes(16).toString('hex');

    // Save agent to database
    const agent = await Agent.create({
      onchainId,
      name,
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
      totalProfit: '0'
    });

    console.log(`✅ Agent saved to database: ${agent.id}`);

    res.json({
      success: true,
      agentId: agent.id,
      agentPubkey: result.agentPubkey,
      agentWallet: agentWallet.publicKey.toString(),
      tokenMint: result.tokenMint,
      transaction: result.transaction,
      tokenMintKeypair: result.tokenMintKeypair, // Send keypair to frontend
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

    // Validate pubkey format
    let agentPubkey: PublicKey;
    try {
      agentPubkey = new PublicKey(pubkey);
    } catch (error) {
      return res.status(400).json({
        error: 'Invalid public key format',
        details: 'Please provide a valid Solana public key'
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
    const agents = await getAllActiveAgents();

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
