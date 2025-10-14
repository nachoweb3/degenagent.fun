import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database';

// Vault Pool Model - Each agent has its own lending pool
interface VaultPoolAttributes {
  id: string;
  agentId: string;
  agentPubkey: string;
  totalDeposits: string; // Total SOL deposited
  totalShares: string; // Total vault shares issued
  currentValue: string; // Current vault value (deposits + profits)
  apy: number; // Current APY %
  totalProfit: string; // Lifetime profit generated
  totalLosses: string; // Lifetime losses
  status: 'active' | 'paused' | 'closed';
  minDeposit: string; // Minimum SOL to deposit
  lockPeriod: number; // Days before withdrawal allowed
  performanceFee: number; // % of profits (default 20%)
  createdAt: Date;
  updatedAt: Date;
}

interface VaultPoolCreationAttributes extends Optional<VaultPoolAttributes, 'id' | 'totalDeposits' | 'totalShares' | 'currentValue' | 'apy' | 'totalProfit' | 'totalLosses' | 'status' | 'createdAt' | 'updatedAt'> {}

export class VaultPool extends Model<VaultPoolAttributes, VaultPoolCreationAttributes> implements VaultPoolAttributes {
  public id!: string;
  public agentId!: string;
  public agentPubkey!: string;
  public totalDeposits!: string;
  public totalShares!: string;
  public currentValue!: string;
  public apy!: number;
  public totalProfit!: string;
  public totalLosses!: string;
  public status!: 'active' | 'paused' | 'closed';
  public minDeposit!: string;
  public lockPeriod!: number;
  public performanceFee!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

VaultPool.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    agentId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
    },
    agentPubkey: {
      type: DataTypes.STRING(44),
      allowNull: false,
      unique: true,
    },
    totalDeposits: {
      type: DataTypes.DECIMAL(20, 9),
      defaultValue: '0',
      allowNull: false,
    },
    totalShares: {
      type: DataTypes.DECIMAL(20, 9),
      defaultValue: '0',
      allowNull: false,
    },
    currentValue: {
      type: DataTypes.DECIMAL(20, 9),
      defaultValue: '0',
      allowNull: false,
    },
    apy: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      allowNull: false,
      comment: 'Annual Percentage Yield',
    },
    totalProfit: {
      type: DataTypes.DECIMAL(20, 9),
      defaultValue: '0',
      allowNull: false,
    },
    totalLosses: {
      type: DataTypes.DECIMAL(20, 9),
      defaultValue: '0',
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('active', 'paused', 'closed'),
      defaultValue: 'active',
      allowNull: false,
    },
    minDeposit: {
      type: DataTypes.DECIMAL(20, 9),
      defaultValue: '0.1',
      allowNull: false,
      comment: 'Minimum SOL deposit',
    },
    lockPeriod: {
      type: DataTypes.INTEGER,
      defaultValue: 7,
      allowNull: false,
      comment: 'Days before withdrawal',
    },
    performanceFee: {
      type: DataTypes.INTEGER,
      defaultValue: 20,
      allowNull: false,
      comment: 'Performance fee %',
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
    tableName: 'vault_pools',
    timestamps: true,
    indexes: [
      { fields: ['agentId'] },
      { fields: ['status'] },
      { fields: ['apy'] },
    ],
  }
);

// User Deposit Model - Tracks individual deposits
interface VaultDepositAttributes {
  id: string;
  vaultPoolId: string;
  userWallet: string;
  depositAmount: string; // SOL deposited
  sharesReceived: string; // Vault shares received
  depositTxSignature: string;
  depositDate: Date;
  lockedUntil: Date; // Withdrawal lockup
  currentValue: string; // Current value of deposit
  totalYield: string; // Total yield earned
  status: 'active' | 'withdrawn';
  withdrawnAt?: Date;
  withdrawTxSignature?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface VaultDepositCreationAttributes extends Optional<VaultDepositAttributes, 'id' | 'currentValue' | 'totalYield' | 'status' | 'withdrawnAt' | 'withdrawTxSignature' | 'createdAt' | 'updatedAt'> {}

export class VaultDeposit extends Model<VaultDepositAttributes, VaultDepositCreationAttributes> implements VaultDepositAttributes {
  public id!: string;
  public vaultPoolId!: string;
  public userWallet!: string;
  public depositAmount!: string;
  public sharesReceived!: string;
  public depositTxSignature!: string;
  public depositDate!: Date;
  public lockedUntil!: Date;
  public currentValue!: string;
  public totalYield!: string;
  public status!: 'active' | 'withdrawn';
  public withdrawnAt?: Date;
  public withdrawTxSignature?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

VaultDeposit.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    vaultPoolId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'vault_pools',
        key: 'id',
      },
    },
    userWallet: {
      type: DataTypes.STRING(44),
      allowNull: false,
    },
    depositAmount: {
      type: DataTypes.DECIMAL(20, 9),
      allowNull: false,
    },
    sharesReceived: {
      type: DataTypes.DECIMAL(20, 9),
      allowNull: false,
    },
    depositTxSignature: {
      type: DataTypes.STRING(88),
      allowNull: false,
      unique: true,
    },
    depositDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    lockedUntil: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    currentValue: {
      type: DataTypes.DECIMAL(20, 9),
      defaultValue: '0',
      allowNull: false,
    },
    totalYield: {
      type: DataTypes.DECIMAL(20, 9),
      defaultValue: '0',
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('active', 'withdrawn'),
      defaultValue: 'active',
      allowNull: false,
    },
    withdrawnAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    withdrawTxSignature: {
      type: DataTypes.STRING(88),
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
    tableName: 'vault_deposits',
    timestamps: true,
    indexes: [
      { fields: ['vaultPoolId'] },
      { fields: ['userWallet'] },
      { fields: ['status'] },
    ],
  }
);

// Associations
VaultPool.hasMany(VaultDeposit, { foreignKey: 'vaultPoolId', as: 'deposits' });
VaultDeposit.belongsTo(VaultPool, { foreignKey: 'vaultPoolId', as: 'pool' });

export default { VaultPool, VaultDeposit };
