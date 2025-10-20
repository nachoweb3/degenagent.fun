import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database';

interface AgentAttributes {
  id: string;
  onchainId: string; // References blockchain registry
  name: string;
  symbol?: string; // Token symbol
  imageUrl?: string; // Agent image
  purpose: string;
  owner: string; // Solana public key
  walletAddress: string; // Generated wallet for trading
  encryptedPrivateKey: string; // AES-256-GCM encrypted
  tokenMint?: string;
  status: 'active' | 'paused' | 'stopped';
  balance: string; // SOL balance (stored as string to avoid precision issues)
  tradingEnabled: boolean;
  aiModel: string;
  riskLevel: 'low' | 'medium' | 'high';
  riskTolerance: number; // 1-10 scale
  tradingFrequency: string; // low, medium, high, very-high
  maxTradeSize: number; // percentage 5-50
  useSubagents: boolean; // enable 3-subagent system
  totalTrades: number;
  successfulTrades: number;
  totalVolume: string;
  totalRevenue: string;
  totalProfit: string;
  lastTradeAt?: Date;
  // Social links
  website?: string;
  telegram?: string;
  twitter?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface AgentCreationAttributes extends Optional<AgentAttributes, 'id' | 'symbol' | 'imageUrl' | 'tokenMint' | 'totalTrades' | 'successfulTrades' | 'totalVolume' | 'totalRevenue' | 'totalProfit' | 'lastTradeAt' | 'website' | 'telegram' | 'twitter' | 'createdAt' | 'updatedAt'> {}

class Agent extends Model<AgentAttributes, AgentCreationAttributes> implements AgentAttributes {
  declare id: string;
  declare onchainId: string;
  declare name: string;
  declare symbol?: string;
  declare imageUrl?: string;
  declare purpose: string;
  declare owner: string;
  declare walletAddress: string;
  declare encryptedPrivateKey: string;
  declare tokenMint?: string;
  declare status: 'active' | 'paused' | 'stopped';
  declare balance: string;
  declare tradingEnabled: boolean;
  declare aiModel: string;
  declare riskLevel: 'low' | 'medium' | 'high';
  declare riskTolerance: number;
  declare tradingFrequency: string;
  declare maxTradeSize: number;
  declare useSubagents: boolean;
  declare totalTrades: number;
  declare successfulTrades: number;
  declare totalVolume: string;
  declare totalRevenue: string;
  declare totalProfit: string;
  declare lastTradeAt?: Date;
  declare website?: string;
  declare telegram?: string;
  declare twitter?: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Agent.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    onchainId: {
      type: DataTypes.STRING(32),
      allowNull: false,
      unique: true,
      comment: 'Agent ID registered on blockchain',
    },
    name: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    symbol: {
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: 'Token symbol',
    },
    imageUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Agent image (base64 or URL)',
    },
    purpose: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    owner: {
      type: DataTypes.STRING(44),
      allowNull: false,
      comment: 'Solana wallet address of owner',
    },
    walletAddress: {
      type: DataTypes.STRING(44),
      allowNull: false,
      unique: true,
      comment: 'Generated trading wallet',
    },
    encryptedPrivateKey: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'AES-256-GCM encrypted private key',
    },
    tokenMint: {
      type: DataTypes.STRING(44),
      allowNull: true,
      comment: 'SPL token mint address (if tokenized)',
    },
    status: {
      type: DataTypes.ENUM('active', 'paused', 'stopped'),
      defaultValue: 'active',
      allowNull: false,
    },
    balance: {
      type: DataTypes.DECIMAL(20, 9),
      defaultValue: '0',
      allowNull: false,
      comment: 'Current SOL balance',
    },
    tradingEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    aiModel: {
      type: DataTypes.STRING(50),
      defaultValue: 'gemini-pro',
      allowNull: false,
    },
    riskLevel: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      defaultValue: 'medium',
      allowNull: false,
    },
    riskTolerance: {
      type: DataTypes.INTEGER,
      defaultValue: 5,
      allowNull: false,
      comment: 'Risk tolerance 1-10',
    },
    tradingFrequency: {
      type: DataTypes.STRING(20),
      defaultValue: 'medium',
      allowNull: false,
      comment: 'low, medium, high, very-high',
    },
    maxTradeSize: {
      type: DataTypes.INTEGER,
      defaultValue: 10,
      allowNull: false,
      comment: 'Max % of vault per trade (5-50)',
    },
    useSubagents: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
      comment: 'Enable 3-subagent system',
    },
    totalTrades: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    successfulTrades: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    totalVolume: {
      type: DataTypes.DECIMAL(20, 9),
      defaultValue: '0',
      allowNull: false,
      comment: 'Total trading volume in SOL',
    },
    totalRevenue: {
      type: DataTypes.DECIMAL(20, 9),
      defaultValue: '0',
      allowNull: false,
      comment: 'Revenue generated for owner',
    },
    totalProfit: {
      type: DataTypes.DECIMAL(20, 9),
      defaultValue: '0',
      allowNull: false,
      comment: 'Net profit/loss',
    },
    lastTradeAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    website: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Agent website URL',
    },
    telegram: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Telegram handle or URL',
    },
    twitter: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Twitter/X handle or URL',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'agents',
    timestamps: true,
    indexes: [
      { fields: ['onchainId'] },
      { fields: ['owner'] },
      { fields: ['status'] },
      { fields: ['createdAt'] },
    ],
  }
);

export default Agent;
