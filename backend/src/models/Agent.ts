import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database';

interface AgentAttributes {
  id: string;
  onchainId: string; // References blockchain registry
  name: string;
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
  createdAt: Date;
  updatedAt: Date;
}

interface AgentCreationAttributes extends Optional<AgentAttributes, 'id' | 'tokenMint' | 'totalTrades' | 'successfulTrades' | 'totalVolume' | 'totalRevenue' | 'totalProfit' | 'lastTradeAt' | 'createdAt' | 'updatedAt'> {}

class Agent extends Model<AgentAttributes, AgentCreationAttributes> implements AgentAttributes {
  public id!: string;
  public onchainId!: string;
  public name!: string;
  public purpose!: string;
  public owner!: string;
  public walletAddress!: string;
  public encryptedPrivateKey!: string;
  public tokenMint?: string;
  public status!: 'active' | 'paused' | 'stopped';
  public balance!: string;
  public tradingEnabled!: boolean;
  public aiModel!: string;
  public riskLevel!: 'low' | 'medium' | 'high';
  public riskTolerance!: number;
  public tradingFrequency!: string;
  public maxTradeSize!: number;
  public useSubagents!: boolean;
  public totalTrades!: number;
  public successfulTrades!: number;
  public totalVolume!: string;
  public totalRevenue!: string;
  public totalProfit!: string;
  public lastTradeAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
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
