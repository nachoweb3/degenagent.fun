import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Connection, PublicKey } from '@solana/web3.js';
import agentRoutes from './routes/agent';
import olympicsRoutes from './routes/olympics';
import tradingRoutes from './routes/trading';
import referralRoutes from './routes/referral';
import commissionRoutes from './routes/commission';
import feedRoutes from './routes/feed';
import stakingRoutes from './routes/staking';
import vaultsRoutes from './routes/vaults';
import bondingCurveRoutes from './routes/bondingCurve';
import chartRoutes from './routes/chart';
import graduationRoutes from './routes/graduation';
import strategyRoutes from './routes/strategy';
import marketplaceRoutes from './routes/marketplace';
import analyticsRoutes from './routes/analytics';
import indicatorsRoutes from './routes/indicators';
import { errorHandler } from './middleware/errorHandler';
import { initDatabase } from './database';
import { logger, requestLogger, errorLogger } from './utils/logger';
import { startOrderMonitoring } from './services/orderManager';
import Vault from './models/Vault';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map(origin => origin.trim());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use(requestLogger);

// Solana connection
export const connection = new Connection(
  process.env.RPC_ENDPOINT || 'https://api.devnet.solana.com',
  'confirmed'
);

// Routes
app.use('/api/agent', agentRoutes);
app.use('/api/olympics', olympicsRoutes);
app.use('/api/trading', tradingRoutes);
app.use('/api/referral', referralRoutes);
app.use('/api/commission', commissionRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/staking', stakingRoutes);
app.use('/api/vaults', vaultsRoutes);
app.use('/api/bonding-curve', bondingCurveRoutes);
app.use('/api/chart', chartRoutes);
app.use('/api/graduation', graduationRoutes);
app.use('/api/strategy', strategyRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/indicators', indicatorsRoutes);

// Health check
app.get('/health', async (req, res) => {
  try {
    const blockHeight = await connection.getBlockHeight();
    res.json({
      status: 'ok',
      network: process.env.RPC_ENDPOINT || 'devnet',
      blockHeight,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to connect to Solana network'
    });
  }
});

// Error logging and handler
app.use(errorLogger);
app.use(errorHandler);

// Initialize seed vaults if none exist
async function initializeVaults() {
  try {
    const vaultCount = await Vault.count();
    if (vaultCount === 0) {
      console.log('📦 No vaults found, creating seed vaults...');
      const seedVaults = [
        {
          name: 'Conservative SOL Vault',
          description: 'Low-risk vault focused on stable returns through conservative trading strategies',
          strategy: 'conservative' as const,
          currentAPY: 12,
          historicalAPY: 11.5,
          minDeposit: '0.5',
          maxCapacity: '5000',
          totalValueLocked: '0',
          depositFee: 0,
          withdrawalFee: 0.5,
          performanceFee: 5,
          lockPeriod: 0,
          autoCompound: true,
          riskLevel: 3,
          status: 'active' as const,
          totalDepositors: 0,
        },
        {
          name: 'Balanced Growth Vault',
          description: 'Medium-risk vault balancing growth and stability with diversified strategies',
          strategy: 'balanced' as const,
          currentAPY: 25,
          historicalAPY: 23,
          minDeposit: '1',
          maxCapacity: '10000',
          totalValueLocked: '0',
          depositFee: 0,
          withdrawalFee: 0.5,
          performanceFee: 10,
          lockPeriod: 30,
          autoCompound: true,
          riskLevel: 5,
          status: 'active' as const,
          totalDepositors: 0,
        },
        {
          name: 'Aggressive Alpha Vault',
          description: 'High-risk vault seeking maximum returns through aggressive trading strategies',
          strategy: 'aggressive' as const,
          currentAPY: 50,
          historicalAPY: 45,
          minDeposit: '2',
          maxCapacity: '3000',
          totalValueLocked: '0',
          depositFee: 0,
          withdrawalFee: 1,
          performanceFee: 20,
          lockPeriod: 90,
          autoCompound: true,
          riskLevel: 9,
          status: 'active' as const,
          totalDepositors: 0,
        },
      ];

      await Vault.bulkCreate(seedVaults);
      console.log('✅ Seed vaults created successfully');
    } else {
      console.log(`✅ Found ${vaultCount} existing vaults`);
    }
  } catch (error) {
    console.error('⚠️ Error initializing vaults:', error);
  }
}

// Initialize database and start server
async function startServer() {
  try {
    // Initialize database
    await initDatabase();

    // Initialize vaults
    await initializeVaults();

    // Start order monitoring service (checks every 30 seconds)
    startOrderMonitoring(30000);

    // Start listening
    app.listen(PORT, () => {
      logger.info('SYSTEM', '🚀 AGENT.FUN Backend running', { port: PORT });
      logger.info('SYSTEM', '📡 Connected to Solana', { network: process.env.RPC_ENDPOINT || 'devnet' });
      logger.info('SYSTEM', '💾 Database initialized');
      logger.info('SYSTEM', '📊 Order monitoring service started');
      logger.info('SYSTEM', '✅ All systems operational');

      console.log(`🚀 AGENT.FUN Backend running on port ${PORT}`);
      console.log(`📡 Connected to: ${process.env.RPC_ENDPOINT || 'devnet'}`);
      console.log(`💾 Database: SQLite (development)`);
      console.log(`📊 Order monitoring service started`);
      console.log(`✅ All systems operational`);

      // Schedule log cleanup (daily)
      setInterval(() => {
        logger.cleanupOldLogs();
      }, 24 * 60 * 60 * 1000);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
