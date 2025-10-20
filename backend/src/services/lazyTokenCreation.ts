import {
  PublicKey,
  Transaction,
  SystemProgram,
  Keypair,
  LAMPORTS_PER_SOL,
  ComputeBudgetProgram
} from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createInitializeMintInstruction,
  createAssociatedTokenAccountInstruction,
  MINT_SIZE,
  getMinimumBalanceForRentExemptMint
} from '@solana/spl-token';
import { connection } from '../index';

/**
 * LAZY TOKEN CREATION
 *
 * Creates token mint only when needed (on first deposit/trade)
 * This makes agent creation FREE (only database entry)
 * Token creation cost (~0.0025 SOL) is paid when first funds are deposited
 */

export async function createTokenForAgent(
  creator: PublicKey,
  agentId: string,
  symbol: string
): Promise<{
  tokenMint: string;
  transaction: string;
  tokenMintKeypair: any;
  blockhash: string;
  lastValidBlockHeight: number;
}> {
  // Generate token mint keypair
  const tokenMint = Keypair.generate();

  // Get associated token account for creator
  const creatorTokenAccount = await getAssociatedTokenAddress(
    tokenMint.publicKey,
    creator
  );

  // Create optimized transaction
  const transaction = new Transaction();

  // OPTIMIZATION 1: Set compute unit limit to reduce fees
  transaction.add(
    ComputeBudgetProgram.setComputeUnitLimit({
      units: 100000 // Reduced from default 200K
    })
  );

  // Add rent for mint account
  const mintRent = await getMinimumBalanceForRentExemptMint(connection);

  // Create mint account
  transaction.add(
    SystemProgram.createAccount({
      fromPubkey: creator,
      newAccountPubkey: tokenMint.publicKey,
      space: MINT_SIZE,
      lamports: mintRent,
      programId: TOKEN_PROGRAM_ID,
    })
  );

  // Initialize mint with 4 decimals (optimized)
  transaction.add(
    createInitializeMintInstruction(
      tokenMint.publicKey,
      4, // decimals (reduced for lower compute cost)
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

  console.log(`[LAZY] Creating token for agent ${agentId}`);
  console.log(`[LAZY] Token Mint: ${tokenMint.publicKey.toString()}`);

  // Get latest blockhash
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized');
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = creator;

  // Serialize transaction
  const serialized = transaction.serialize({
    requireAllSignatures: false,
    verifySignatures: false
  }).toString('base64');

  // Return token mint secret key for frontend signing
  const tokenMintKeypair = {
    publicKey: tokenMint.publicKey.toString(),
    secretKey: Array.from(tokenMint.secretKey)
  };

  return {
    tokenMint: tokenMint.publicKey.toString(),
    transaction: serialized,
    tokenMintKeypair,
    blockhash,
    lastValidBlockHeight
  };
}

/**
 * Check if agent needs token creation
 */
export function needsTokenCreation(agent: any): boolean {
  return !agent.tokenMint || agent.tokenMint === 'pending';
}

/**
 * Get cost of token creation
 */
export async function getTokenCreationCost(): Promise<number> {
  const mintRent = await getMinimumBalanceForRentExemptMint(connection);
  const ataRent = 0.00203 * LAMPORTS_PER_SOL; // Approximate ATA rent
  const txFee = 0.000005 * LAMPORTS_PER_SOL; // Base tx fee

  return (mintRent + ataRent + txFee) / LAMPORTS_PER_SOL;
}
