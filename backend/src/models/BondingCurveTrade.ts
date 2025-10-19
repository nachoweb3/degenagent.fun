import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database';

interface BondingCurveTradeAttributes {
  id: string;
  bondingCurveId: string; // Reference to BondingCurve
  agentId: string; // Reference to Agent
  trader: string; // Wallet address of trader
  type: 'buy' | 'sell';
  tokenAmount: string; // Amount of tokens bought/sold
  solAmount: string; // Amount of SOL paid/received
  platformFee: string; // Platform fee in SOL
  pricePerToken: string; // Price per token at time of trade
  transactionSignature: string;
  createdAt: Date;
}

interface BondingCurveTradeCreationAttributes
  extends Optional<BondingCurveTradeAttributes, 'id' | 'createdAt'> {}

class BondingCurveTrade extends Model<BondingCurveTradeAttributes, BondingCurveTradeCreationAttributes>
  implements BondingCurveTradeAttributes {
  declare id: string;
  declare bondingCurveId: string;
  declare agentId: string;
  declare trader: string;
  declare type: 'buy' | 'sell';
  declare tokenAmount: string;
  declare solAmount: string;
  declare platformFee: string;
  declare pricePerToken: string;
  declare transactionSignature: string;
  declare readonly createdAt: Date;
}

BondingCurveTrade.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    bondingCurveId: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: 'Reference to BondingCurve table',
    },
    agentId: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: 'Reference to Agent table',
    },
    trader: {
      type: DataTypes.STRING(44),
      allowNull: false,
      comment: 'Wallet address of trader',
    },
    type: {
      type: DataTypes.ENUM('buy', 'sell'),
      allowNull: false,
      comment: 'Type of trade',
    },
    tokenAmount: {
      type: DataTypes.DECIMAL(20, 0),
      allowNull: false,
      comment: 'Amount of tokens traded',
    },
    solAmount: {
      type: DataTypes.DECIMAL(20, 9),
      allowNull: false,
      comment: 'Amount of SOL in trade',
    },
    platformFee: {
      type: DataTypes.DECIMAL(20, 9),
      allowNull: false,
      comment: 'Platform fee in SOL',
    },
    pricePerToken: {
      type: DataTypes.DECIMAL(30, 18),
      allowNull: false,
      comment: 'Price per token at time of trade',
    },
    transactionSignature: {
      type: DataTypes.STRING(88),
      allowNull: false,
      unique: true,
      comment: 'Solana transaction signature',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'bonding_curve_trades',
    timestamps: false,
    indexes: [
      { fields: ['bondingCurveId'] },
      { fields: ['agentId'] },
      { fields: ['trader'] },
      { fields: ['type'] },
      { fields: ['createdAt'] },
    ],
  }
);

export default BondingCurveTrade;
