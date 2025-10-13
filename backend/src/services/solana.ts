import {
  PublicKey,
  Transaction,
  SystemProgram,
  Keypair,
  LAMPORTS_PER_SOL
} from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createInitializeMintInstruction,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  MINT_SIZE,
  getMinimumBalanceForRentExemptMint
} from '@solana/spl-token';
import { connection } from '../index';
import * as anchor from '@coral-xyz/anchor';

// Use valid default program IDs (will be updated when programs are deployed)
// Default to System Program for MVP until actual programs are deployed
const FACTORY_PROGRAM_ID = new PublicKey(
  process.env.FACTORY_PROGRAM_ID || SystemProgram.programId.toString()
);

const MANAGER_PROGRAM_ID = new PublicKey(
  process.env.MANAGER_PROGRAM_ID || SystemProgram.programId.toString()
);

export async function createAgent(
  creator: PublicKey,
  name: string,
  symbol: string,
  purpose: string,
  agentWallet: PublicKey
) {
  // Find factory state PDA
  const [factoryState] = PublicKey.findProgramAddressSync(
    [Buffer.from('factory')],
    FACTORY_PROGRAM_ID
  );

  // Find agent state PDA
  const [agentState] = PublicKey.findProgramAddressSync(
    [Buffer.from('agent'), creator.toBuffer()],
    MANAGER_PROGRAM_ID
  );

  // Find vault PDA
  const [vault] = PublicKey.findProgramAddressSync(
    [Buffer.from('vault'), agentState.toBuffer()],
    MANAGER_PROGRAM_ID
  );

  // Generate token mint keypair
  const tokenMint = Keypair.generate();

  // Get associated token account for creator
  const creatorTokenAccount = await getAssociatedTokenAddress(
    tokenMint.publicKey,
    creator
  );

  // Get treasury from factory state (for MVP, use creator as treasury)
  const treasuryAddress = process.env.TREASURY_WALLET;
  const treasury = treasuryAddress && treasuryAddress.length === 44
    ? new PublicKey(treasuryAddress)
    : creator;

  // Create transaction
  const transaction = new Transaction();

  // Add rent for mint account
  const mintRent = await getMinimumBalanceForRentExemptMint(connection);

  transaction.add(
    SystemProgram.createAccount({
      fromPubkey: creator,
      newAccountPubkey: tokenMint.publicKey,
      space: MINT_SIZE,
      lamports: mintRent,
      programId: TOKEN_PROGRAM_ID,
    })
  );

  // Initialize mint
  transaction.add(
    createInitializeMintInstruction(
      tokenMint.publicKey,
      6, // decimals
      tokenMint.publicKey, // mint authority
      null, // freeze authority
      TOKEN_PROGRAM_ID
    )
  );

  // Create associated token account for creator
  transaction.add(
    createAssociatedTokenAccountInstruction(
      creator,
      creatorTokenAccount,
      creator,
      tokenMint.publicKey
    )
  );

  // Note: In production, this would call the actual Anchor instruction
  // For MVP, we're creating a simplified version

  console.log('Agent creation transaction prepared');
  console.log('Agent State PDA:', agentState.toString());
  console.log('Vault PDA:', vault.toString());
  console.log('Token Mint:', tokenMint.publicKey.toString());

  // Serialize transaction
  transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  transaction.feePayer = creator;
  transaction.partialSign(tokenMint);

  const serialized = transaction.serialize({
    requireAllSignatures: false,
    verifySignatures: false
  }).toString('base64');

  return {
    agentPubkey: agentState.toString(),
    tokenMint: tokenMint.publicKey.toString(),
    vault: vault.toString(),
    transaction: serialized
  };
}

export async function getAgentState(agentPubkey: PublicKey) {
  try {
    const accountInfo = await connection.getAccountInfo(agentPubkey);

    if (!accountInfo) {
      return null;
    }

    // For MVP, return mock data structure
    // In production, decode with Anchor IDL
    const mockData = {
      authority: PublicKey.default,
      agentWallet: PublicKey.default,
      tokenMint: PublicKey.default,
      vault: PublicKey.default,
      name: 'Demo Agent',
      purpose: 'Trade memecoins',
      state: { active: true },
      totalTrades: new anchor.BN(0),
      totalVolume: new anchor.BN(0),
      revenuePool: new anchor.BN(0)
    };

    return mockData;

  } catch (error) {
    console.error('Error fetching agent state:', error);
    return null;
  }
}

export async function depositFunds(
  agentPubkey: PublicKey,
  depositor: PublicKey,
  amount: number
) {
  // Find vault PDA
  const [vault] = PublicKey.findProgramAddressSync(
    [Buffer.from('vault'), agentPubkey.toBuffer()],
    MANAGER_PROGRAM_ID
  );

  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: depositor,
      toPubkey: vault,
      lamports: amount
    })
  );

  transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  transaction.feePayer = depositor;

  const serialized = transaction.serialize({
    requireAllSignatures: false,
    verifySignatures: false
  }).toString('base64');

  return serialized;
}

export async function getAllActiveAgents() {
  // For MVP, return mock data
  // In production, use getProgramAccounts with filters

  const mockAgents = [
    {
      pubkey: 'Agent1111111111111111111111111111111111111',
      name: 'MemeKing',
      purpose: 'Trade trending memecoins',
      totalTrades: 42,
      totalVolume: 156.5
    },
    {
      pubkey: 'Agent2222222222222222222222222222222222222',
      name: 'DiamondHands',
      purpose: 'Long-term memecoin holds',
      totalTrades: 12,
      totalVolume: 89.3
    }
  ];

  return mockAgents;
}
