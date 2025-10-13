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

export async function createAgentHandler(req: Request, res: Response) {
  try {
    const { name, symbol, purpose, creatorWallet } = req.body;

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

    res.json({
      success: true,
      agentPubkey: result.agentPubkey,
      agentWallet: agentWallet.publicKey.toString(),
      tokenMint: result.tokenMint,
      transaction: result.transaction,
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

    const agentPubkey = new PublicKey(pubkey);
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
