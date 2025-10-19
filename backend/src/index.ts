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
import { errorHandler } from './middleware/errorHandler';
import { initDatabase } from './database';
import { startOrderMonitoring } from './services/orderManager';

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

// Error handler
app.use(errorHandler);

// Initialize database and start server
async function startServer() {
  try {
    // Initialize database
    await initDatabase();

    // Start order monitoring service (checks every 30 seconds)
    startOrderMonitoring(30000);

    // Start listening
    app.listen(PORT, () => {
      console.log(`🚀 AGENT.FUN Backend running on port ${PORT}`);
      console.log(`📡 Connected to: ${process.env.RPC_ENDPOINT || 'devnet'}`);
      console.log(`💾 Database: SQLite (development)`);
      console.log(`📊 Order monitoring service started`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
