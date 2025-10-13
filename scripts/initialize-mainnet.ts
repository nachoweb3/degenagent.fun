/**
 * Initialize Agent Factory on Mainnet
 *
 * This script initializes the factory program on mainnet
 * with the treasury wallet and creation fee.
 */

import * as anchor from "@coral-xyz/anchor";
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import { PublicKey, Connection, Keypair } from "@solana/web3.js";
import * as fs from "fs";
import * as path from "path";

// Load environment variables
require('dotenv').config({ path: '../backend/.env' });

async function main() {
  console.log("🔧 Initializing Agent Factory on Mainnet...\n");

  // Setup connection
  const rpcEndpoint = process.env.RPC_ENDPOINT || "https://api.mainnet-beta.solana.com";
  const connection = new Connection(rpcEndpoint, "confirmed");

  console.log("📡 RPC Endpoint:", rpcEndpoint);

  // Load wallet
  const walletPath = path.join(require('os').homedir(), '.config', 'solana', 'id.json');
  if (!fs.existsSync(walletPath)) {
    throw new Error(`Wallet not found at ${walletPath}`);
  }

  const walletKeypair = Keypair.fromSecretKey(
    Buffer.from(JSON.parse(fs.readFileSync(walletPath, 'utf-8')))
  );

  console.log("👤 Authority:", walletKeypair.publicKey.toString());

  // Check balance
  const balance = await connection.getBalance(walletKeypair.publicKey);
  console.log("💰 Balance:", balance / 1e9, "SOL\n");

  if (balance < 0.1 * 1e9) {
    throw new Error("Insufficient balance (need at least 0.1 SOL)");
  }

  // Setup provider
  const wallet = new anchor.Wallet(walletKeypair);
  const provider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  anchor.setProvider(provider);

  // Load program
  const factoryProgramId = new PublicKey(
    process.env.FACTORY_PROGRAM_ID ||
    "Factory11111111111111111111111111111111111"
  );

  console.log("🏭 Factory Program ID:", factoryProgramId.toString());

  // Load IDL
  const idlPath = path.join(__dirname, "..", "target", "idl", "agent_factory.json");
  if (!fs.existsSync(idlPath)) {
    throw new Error(`IDL not found at ${idlPath}. Run 'anchor build' first.`);
  }

  const idl = JSON.parse(fs.readFileSync(idlPath, "utf-8"));
  const program = new Program(idl, factoryProgramId, provider);

  // Treasury wallet
  const treasuryWallet = new PublicKey(
    process.env.TREASURY_WALLET || walletKeypair.publicKey.toString()
  );

  console.log("🏦 Treasury:", treasuryWallet.toString());

  // Creation fee (0.5 SOL = 500,000,000 lamports)
  const creationFee = new anchor.BN(500_000_000);
  console.log("💵 Creation Fee:", creationFee.toNumber() / 1e9, "SOL\n");

  // Find factory state PDA
  const [factoryState] = PublicKey.findProgramAddressSync(
    [Buffer.from("factory")],
    factoryProgramId
  );

  console.log("📦 Factory State PDA:", factoryState.toString());

  // Check if already initialized
  try {
    const accountInfo = await connection.getAccountInfo(factoryState);
    if (accountInfo) {
      console.log("\n⚠️  Factory appears to be already initialized");
      console.log("Account owner:", accountInfo.owner.toString());

      const answer = await askQuestion("Do you want to continue anyway? (yes/no): ");
      if (answer.toLowerCase() !== 'yes') {
        console.log("Initialization cancelled");
        process.exit(0);
      }
    }
  } catch (e) {
    // Account doesn't exist, which is expected
  }

  console.log("\n🚀 Sending initialization transaction...");

  try {
    const tx = await program.methods
      .initialize(creationFee)
      .accounts({
        factoryState: factoryState,
        authority: walletKeypair.publicKey,
        treasury: treasuryWallet,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    console.log("\n✅ Factory initialized successfully!");
    console.log("📝 Transaction signature:", tx);
    console.log("🔗 View on Solscan:", `https://solscan.io/tx/${tx}`);
    console.log("\n⏳ Waiting for confirmation...");

    await connection.confirmTransaction(tx, "confirmed");
    console.log("✅ Transaction confirmed!\n");

    // Fetch and display factory state
    const factoryStateAccount = await program.account.factoryState.fetch(factoryState);
    console.log("📊 Factory State:");
    console.log("   Authority:", factoryStateAccount.authority.toString());
    console.log("   Treasury:", factoryStateAccount.treasury.toString());
    console.log("   Creation Fee:", factoryStateAccount.creationFee.toNumber() / 1e9, "SOL");
    console.log("   Total Agents Created:", factoryStateAccount.totalAgentsCreated.toString());

    console.log("\n🎉 Initialization complete!");
    console.log("\n📝 Next steps:");
    console.log("1. Test creating an agent from the frontend");
    console.log("2. Monitor the logs");
    console.log("3. Deploy frontend to Vercel");

  } catch (error: any) {
    console.error("\n❌ Initialization failed!");

    if (error.logs) {
      console.error("\n📋 Program logs:");
      error.logs.forEach((log: string) => console.error("   ", log));
    }

    console.error("\n💡 Error details:", error.message);

    if (error.message.includes("already in use")) {
      console.error("\n⚠️  The factory is already initialized.");
      console.error("If you need to update it, you'll need to use the update_creation_fee instruction.");
    }

    throw error;
  }
}

// Helper function to ask questions
function askQuestion(question: string): Promise<string> {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    readline.question(question, (answer: string) => {
      readline.close();
      resolve(answer);
    });
  });
}

// Run
main()
  .then(() => {
    console.log("\n✨ Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Script failed:", error);
    process.exit(1);
  });
