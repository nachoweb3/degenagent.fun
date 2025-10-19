import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database';

interface VaultAttributes {
  id: string;
  name: string;
  description: string;
  agentId?: string; // Optional - vault can be for specific agent or general
  strategy: 'conservative' | 'balanced' | 'aggressive';
  currentAPY: number;
  historicalAPY: number;
  totalValueLocked: string; // TVL in SOL
  minDeposit: string;
  maxCapacity: string;
  depositFee: number; // Percentage
  withdrawalFee: number; // Percentage
  performanceFee: number; // Percentage of profits
  lockPeriod: number; // Days
  autoCompound: boolean;
  status: 'active' | 'paused' | 'closed';
  riskLevel: number; // 1-10
  totalDepositors: number;
  createdAt: Date;
  updatedAt: Date;
}

interface VaultCreationAttributes extends Optional<VaultAttributes, 'id' | 'agentId' | 'totalValueLocked' | 'totalDepositors' | 'status' | 'createdAt' | 'updatedAt'> {}

class Vault extends Model<VaultAttributes, VaultCreationAttributes> implements VaultAttributes {
  public id!: string;
  public name!: string;
  public description!: string;
  public agentId?: string;
  public strategy!: 'conservative' | 'balanced' | 'aggressive';
  public currentAPY!: number;
  public historicalAPY!: number;
  public totalValueLocked!: string;
  public minDeposit!: string;
  public maxCapacity!: string;
  public depositFee!: number;
  public withdrawalFee!: number;
  public performanceFee!: number;
  public lockPeriod!: number;
  public autoCompound!: boolean;
  public status!: 'active' | 'paused' | 'closed';
  public riskLevel!: number;
  public totalDepositors!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Vault.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    agentId: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'agent_id',
    },
    strategy: {
      type: DataTypes.ENUM('conservative', 'balanced', 'aggressive'),
      allowNull: false,
      defaultValue: 'balanced',
    },
    currentAPY: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
      field: 'current_apy',
    },
    historicalAPY: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
      field: 'historical_apy',
    },
    totalValueLocked: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '0',
      field: 'total_value_locked',
    },
    minDeposit: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '0.1',
      field: 'min_deposit',
    },
    maxCapacity: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '10000',
      field: 'max_capacity',
    },
    depositFee: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
      field: 'deposit_fee',
    },
    withdrawalFee: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0.5,
      field: 'withdrawal_fee',
    },
    performanceFee: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 10,
      field: 'performance_fee',
    },
    lockPeriod: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'lock_period',
    },
    autoCompound: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'auto_compound',
    },
    status: {
      type: DataTypes.ENUM('active', 'paused', 'closed'),
      allowNull: false,
      defaultValue: 'active',
    },
    riskLevel: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5,
      field: 'risk_level',
    },
    totalDepositors: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'total_depositors',
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'updated_at',
    },
  },
  {
    sequelize,
    tableName: 'vaults',
    timestamps: true,
    indexes: [
      { fields: ['agent_id'] },
      { fields: ['status'] },
      { fields: ['strategy'] },
    ],
  }
);

export default Vault;
