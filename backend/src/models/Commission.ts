import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database';

interface CommissionAttributes {
  id: string;
  agentPubkey: string;
  ownerAddress: string;
  tradeAmount: number;
  commissionRate: number; // Percentage (e.g., 0.5 for 0.5%)
  commissionAmount: number; // Amount in SOL/USDC
  tokenMint: string;
  transactionSignature: string;
  claimed: boolean;
  createdAt?: Date;
}

interface CommissionCreationAttributes extends Optional<CommissionAttributes, 'id' | 'claimed' | 'createdAt'> {}

class Commission extends Model<CommissionAttributes, CommissionCreationAttributes> implements CommissionAttributes {
  declare id: string;
  declare agentPubkey: string;
  declare ownerAddress: string;
  declare tradeAmount: number;
  declare commissionRate: number;
  declare commissionAmount: number;
  declare tokenMint: string;
  declare transactionSignature: string;
  declare claimed: boolean;
  declare readonly createdAt: Date;
}

Commission.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    agentPubkey: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'agent_pubkey',
    },
    ownerAddress: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'owner_address',
    },
    tradeAmount: {
      type: DataTypes.FLOAT,
      allowNull: false,
      field: 'trade_amount',
    },
    commissionRate: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0.5, // 0.5% default
      field: 'commission_rate',
    },
    commissionAmount: {
      type: DataTypes.FLOAT,
      allowNull: false,
      field: 'commission_amount',
    },
    tokenMint: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'token_mint',
    },
    transactionSignature: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'transaction_signature',
    },
    claimed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
  },
  {
    sequelize,
    tableName: 'commissions',
    timestamps: false,
  }
);

export { Commission, CommissionAttributes };
