const { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, Transaction, SystemProgram } = require('@solana/web3.js');
const bs58 = require('bs58');

async function getDevnetSOL() {
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

  // Generate a temporary wallet
  const tempWallet = Keypair.generate();
  console.log('🔑 Temporary wallet created:', tempWallet.publicKey.toString());

  // Target wallet
  const targetWallet = new PublicKey('79Dvcm2CFuHfcxvK1chaqvkn6YHFSFjxHpE4LRzJABne');

  try {
    // Try to airdrop to temp wallet
    console.log('📡 Requesting airdrop to temp wallet...');
    const airdropSignature = await connection.requestAirdrop(
      tempWallet.publicKey,
      2 * LAMPORTS_PER_SOL
    );

    console.log('⏳ Confirming airdrop...');
    await connection.confirmTransaction(airdropSignature);

    const balance = await connection.getBalance(tempWallet.publicKey);
    console.log(`✅ Airdrop successful! Balance: ${balance / LAMPORTS_PER_SOL} SOL`);

    // Transfer to target wallet
    console.log('💸 Transferring to your wallet...');
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: tempWallet.publicKey,
        toPubkey: targetWallet,
        lamports: balance - 5000, // Keep 5000 lamports for fee
      })
    );

    const signature = await connection.sendTransaction(transaction, [tempWallet]);
    await connection.confirmTransaction(signature);

    console.log('✅ Transfer successful!');
    console.log('🎉 Your wallet now has SOL!');
    console.log('Check balance at: https://explorer.solana.com/address/79Dvcm2CFuHfcxvK1chaqvkn6YHFSFjxHpE4LRzJABne?cluster=devnet');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Rate limit hit. Try one of these:');
    console.log('1. Use mobile data (hotspot)');
    console.log('2. Use a VPN');
    console.log('3. Wait 8 hours');
    console.log('4. Ask in Solana Discord: https://discord.gg/solana');
  }
}

getDevnetSOL();
