import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database';

// Trading Order Model - Stop Loss / Take Profit Orders
interface TradingOrderAttributes {
  id: string;
  agentId: string;
  agentPubkey: string;
  tokenMint: string;
  orderType: 'stop_loss' | 'take_profit' | 'limit_buy' | 'limit_sell';
  entryPrice: number;
  triggerPrice: number;
  amount: number;
  status: 'active' | 'triggered' | 'executed' | 'cancelled' | 'expired';
  executedPrice?: number;
  executedAmount?: number;
  executedTxSignature?: string;
  executedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface TradingOrderCreationAttributes extends Optional<TradingOrderAttributes, 'id' | 'executedPrice' | 'executedAmount' | 'executedTxSignature' | 'executedAt' | 'expiresAt' | 'createdAt' | 'updatedAt'> {}

export class TradingOrder extends Model<TradingOrderAttributes, TradingOrderCreationAttributes> implements TradingOrderAttributes {
  declare id: string;
  declare agentId: string;
  declare agentPubkey: string;
  declare tokenMint: string;
  declare orderType: 'stop_loss' | 'take_profit' | 'limit_buy' | 'limit_sell';
  declare entryPrice: number;
  declare triggerPrice: number;
  declare amount: number;
  declare status: 'active' | 'triggered' | 'executed' | 'cancelled' | 'expired';
  declare executedPrice?: number;
  declare executedAmount?: number;
  declare executedTxSignature?: string;
  declare executedAt?: Date;
  declare expiresAt?: Date;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

TradingOrder.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    agentId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    agentPubkey: {
      type: DataTypes.STRING(44),
      allowNull: false,
    },
    tokenMint: {
      type: DataTypes.STRING(44),
      allowNull: false,
    },
    orderType: {
      type: DataTypes.ENUM('stop_loss', 'take_profit', 'limit_buy', 'limit_sell'),
      allowNull: false,
    },
    entryPrice: {
      type: DataTypes.FLOAT,
      allowNull: false,
      comment: 'Price when order was placed',
    },
    triggerPrice: {
      type: DataTypes.FLOAT,
      allowNull: false,
      comment: 'Price that triggers the order',
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
      comment: 'Amount of tokens to trade',
    },
    status: {
      type: DataTypes.ENUM('active', 'triggered', 'executed', 'cancelled', 'expired'),
      defaultValue: 'active',
      allowNull: false,
    },
    executedPrice: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Actual execution price',
    },
    executedAmount: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Actual executed amount',
    },
    executedTxSignature: {
      type: DataTypes.STRING(88),
      allowNull: true,
    },
    executedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Order expiration time',
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
    tableName: 'trading_orders',
    timestamps: true,
    indexes: [
      { fields: ['agentId'] },
      { fields: ['agentPubkey'] },
      { fields: ['status'] },
      { fields: ['tokenMint'] },
      { fields: ['orderType'] },
    ],
  }
);

// Trade History Model - Records all executed trades
interface TradeHistoryAttributes {
  id: string;
  agentId: string;
  agentPubkey: string;
  tradeType: 'buy' | 'sell' | 'swap';
  inputMint: string;
  outputMint: string;
  inputAmount: number;
  outputAmount: number;
  price: number;
  priceImpact: number;
  txSignature: string;
  success: boolean;
  error?: string;
  orderId?: string; // Reference to TradingOrder if triggered by order
  createdAt: Date;
}

interface TradeHistoryCreationAttributes extends Optional<TradeHistoryAttributes, 'id' | 'error' | 'orderId' | 'createdAt'> {}

export class TradeHistory extends Model<TradeHistoryAttributes, TradeHistoryCreationAttributes> implements TradeHistoryAttributes {
  declare id: string;
  declare agentId: string;
  declare agentPubkey: string;
  declare tradeType: 'buy' | 'sell' | 'swap';
  declare inputMint: string;
  declare outputMint: string;
  declare inputAmount: number;
  declare outputAmount: number;
  declare price: number;
  declare priceImpact: number;
  declare txSignature: string;
  declare success: boolean;
  declare error?: string;
  declare orderId?: string;
  declare readonly createdAt: Date;
}

TradeHistory.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    agentId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    agentPubkey: {
      type: DataTypes.STRING(44),
      allowNull: false,
    },
    tradeType: {
      type: DataTypes.ENUM('buy', 'sell', 'swap'),
      allowNull: false,
    },
    inputMint: {
      type: DataTypes.STRING(44),
      allowNull: false,
    },
    outputMint: {
      type: DataTypes.STRING(44),
      allowNull: false,
    },
    inputAmount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    outputAmount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      comment: 'Price at execution',
    },
    priceImpact: {
      type: DataTypes.FLOAT,
      allowNull: false,
      comment: 'Price impact %',
    },
    txSignature: {
      type: DataTypes.STRING(88),
      allowNull: false,
      unique: true,
    },
    success: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    error: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    orderId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'trading_orders',
        key: 'id',
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'trade_history',
    timestamps: true,
    updatedAt: false,
    indexes: [
      { fields: ['agentId'] },
      { fields: ['agentPubkey'] },
      { fields: ['tradeType'] },
      { fields: ['success'] },
      { fields: ['createdAt'] },
    ],
  }
);

// Associations
TradingOrder.hasMany(TradeHistory, { foreignKey: 'orderId', as: 'trades' });
TradeHistory.belongsTo(TradingOrder, { foreignKey: 'orderId', as: 'order' });

export default { TradingOrder, TradeHistory };
