import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database';
import Agent from './Agent';

interface TradeAttributes {
  id: string;
  agentId: string;
  type: 'buy' | 'sell';
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  amountOut: string;
  priceImpact: string;
  slippage: string;
  fee: string;
  signature: string; // Solana transaction signature
  status: 'pending' | 'success' | 'failed';
  errorMessage?: string;
  aiReasoning?: string; // Why AI made this trade
  marketConditions?: string; // JSON string of market data
  profitLoss?: string;
  executionTime: number; // milliseconds
  createdAt: Date;
  updatedAt: Date;
}

interface TradeCreationAttributes extends Optional<TradeAttributes, 'id' | 'errorMessage' | 'aiReasoning' | 'marketConditions' | 'profitLoss' | 'createdAt' | 'updatedAt'> {}

class Trade extends Model<TradeAttributes, TradeCreationAttributes> implements TradeAttributes {
  declare id: string;
  declare agentId: string;
  declare type: 'buy' | 'sell';
  declare tokenIn: string;
  declare tokenOut: string;
  declare amountIn: string;
  declare amountOut: string;
  declare priceImpact: string;
  declare slippage: string;
  declare fee: string;
  declare signature: string;
  declare status: 'pending' | 'success' | 'failed';
  declare errorMessage?: string;
  declare aiReasoning?: string;
  declare marketConditions?: string;
  declare profitLoss?: string;
  declare executionTime: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Trade.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    agentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'agents',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    type: {
      type: DataTypes.ENUM('buy', 'sell'),
      allowNull: false,
    },
    tokenIn: {
      type: DataTypes.STRING(44),
      allowNull: false,
      comment: 'Input token mint address',
    },
    tokenOut: {
      type: DataTypes.STRING(44),
      allowNull: false,
      comment: 'Output token mint address',
    },
    amountIn: {
      type: DataTypes.DECIMAL(20, 9),
      allowNull: false,
    },
    amountOut: {
      type: DataTypes.DECIMAL(20, 9),
      allowNull: false,
    },
    priceImpact: {
      type: DataTypes.DECIMAL(10, 6),
      allowNull: false,
      comment: 'Price impact percentage',
    },
    slippage: {
      type: DataTypes.DECIMAL(10, 6),
      allowNull: false,
      comment: 'Slippage tolerance',
    },
    fee: {
      type: DataTypes.DECIMAL(20, 9),
      allowNull: false,
      comment: 'Transaction fee in SOL',
    },
    signature: {
      type: DataTypes.STRING(88),
      allowNull: false,
      unique: true,
      comment: 'Solana transaction signature',
    },
    status: {
      type: DataTypes.ENUM('pending', 'success', 'failed'),
      defaultValue: 'pending',
      allowNull: false,
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    aiReasoning: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'AI explanation for the trade decision',
    },
    marketConditions: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'JSON string of market data at trade time',
    },
    profitLoss: {
      type: DataTypes.DECIMAL(20, 9),
      allowNull: true,
      comment: 'Calculated P&L in SOL',
    },
    executionTime: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Time taken to execute in milliseconds',
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
    tableName: 'trades',
    timestamps: true,
    indexes: [
      { fields: ['agentId'] },
      { fields: ['signature'] },
      { fields: ['status'] },
      { fields: ['createdAt'] },
      { fields: ['type'] },
    ],
  }
);

// Define associations
Agent.hasMany(Trade, { foreignKey: 'agentId', as: 'trades' });
Trade.belongsTo(Agent, { foreignKey: 'agentId', as: 'agent' });

export default Trade;
