import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database';

interface StakeAttributes {
  id: string;
  userWallet: string;
  agentId: string;
  amount: string; // SOL or agent tokens staked
  tokenType: 'SOL' | 'AGENT_TOKEN';
  startTime: Date;
  endTime?: Date;
  status: 'active' | 'unstaking' | 'completed';
  rewardsClaimed: string;
  apy: number; // Annual Percentage Yield
  lockPeriod: number; // Days locked
  autoCompound: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface StakeCreationAttributes extends Optional<StakeAttributes, 'id' | 'endTime' | 'rewardsClaimed' | 'createdAt' | 'updatedAt'> {}

class Stake extends Model<StakeAttributes, StakeCreationAttributes> implements StakeAttributes {
  public id!: string;
  public userWallet!: string;
  public agentId!: string;
  public amount!: string;
  public tokenType!: 'SOL' | 'AGENT_TOKEN';
  public startTime!: Date;
  public endTime?: Date;
  public status!: 'active' | 'unstaking' | 'completed';
  public rewardsClaimed!: string;
  public apy!: number;
  public lockPeriod!: number;
  public autoCompound!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Stake.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userWallet: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'user_wallet',
    },
    agentId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'agent_id',
    },
    amount: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '0',
    },
    tokenType: {
      type: DataTypes.ENUM('SOL', 'AGENT_TOKEN'),
      allowNull: false,
      defaultValue: 'AGENT_TOKEN',
      field: 'token_type',
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'start_time',
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'end_time',
    },
    status: {
      type: DataTypes.ENUM('active', 'unstaking', 'completed'),
      allowNull: false,
      defaultValue: 'active',
    },
    rewardsClaimed: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '0',
      field: 'rewards_claimed',
    },
    apy: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
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
      defaultValue: false,
      field: 'auto_compound',
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
    tableName: 'stakes',
    timestamps: true,
    indexes: [
      { fields: ['user_wallet'] },
      { fields: ['agent_id'] },
      { fields: ['status'] },
    ],
  }
);

export default Stake;
