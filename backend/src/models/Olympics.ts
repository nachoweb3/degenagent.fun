import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database';

// Olympics Competition Model
interface OlympicsAttributes {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  entryFee: string; // SOL amount
  prizePool: string; // Total SOL collected
  platformCut: number; // Percentage (default 30%)
  maxParticipants?: number;
  categories: string[]; // ['roi', 'volume', 'risk_adjusted']
  createdAt: Date;
  updatedAt: Date;
}

interface OlympicsCreationAttributes extends Optional<OlympicsAttributes, 'id' | 'prizePool' | 'maxParticipants' | 'createdAt' | 'updatedAt'> {}

export class Olympics extends Model<OlympicsAttributes, OlympicsCreationAttributes> implements OlympicsAttributes {
  public id!: string;
  public name!: string;
  public description!: string;
  public startDate!: Date;
  public endDate!: Date;
  public status!: 'upcoming' | 'active' | 'completed' | 'cancelled';
  public entryFee!: string;
  public prizePool!: string;
  public platformCut!: number;
  public maxParticipants?: number;
  public categories!: string[];
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Olympics.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('upcoming', 'active', 'completed', 'cancelled'),
      defaultValue: 'upcoming',
      allowNull: false,
    },
    entryFee: {
      type: DataTypes.DECIMAL(20, 9),
      defaultValue: '1.0',
      allowNull: false,
      comment: 'Entry fee in SOL',
    },
    prizePool: {
      type: DataTypes.DECIMAL(20, 9),
      defaultValue: '0',
      allowNull: false,
      comment: 'Total prize pool in SOL',
    },
    platformCut: {
      type: DataTypes.INTEGER,
      defaultValue: 30,
      allowNull: false,
      comment: 'Platform percentage (30%)',
    },
    maxParticipants: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Max agents allowed (null = unlimited)',
    },
    categories: {
      type: DataTypes.JSON,
      defaultValue: ['roi', 'volume', 'risk_adjusted'],
      allowNull: false,
      comment: 'Competition categories',
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
    tableName: 'olympics',
    timestamps: true,
    indexes: [
      { fields: ['status'] },
      { fields: ['startDate'] },
      { fields: ['endDate'] },
    ],
  }
);

// Olympics Entry Model (which agents are competing)
interface OlympicsEntryAttributes {
  id: string;
  olympicsId: string;
  agentId: string;
  agentPubkey: string;
  ownerWallet: string;
  entryTxSignature: string;
  startingBalance: string;
  currentBalance: string;
  totalTrades: number;
  successfulTrades: number;
  totalVolume: string;
  totalProfit: string;
  roi: number; // Return on Investment %
  sharpeRatio: number; // Risk-adjusted return
  maxDrawdown: number; // Worst loss %
  scores: {
    roi: number;
    volume: number;
    riskAdjusted: number;
  };
  rank: {
    roi: number;
    volume: number;
    riskAdjusted: number;
  };
  status: 'active' | 'disqualified' | 'withdrawn';
  createdAt: Date;
  updatedAt: Date;
}

interface OlympicsEntryCreationAttributes extends Optional<OlympicsEntryAttributes, 'id' | 'currentBalance' | 'totalTrades' | 'successfulTrades' | 'totalVolume' | 'totalProfit' | 'roi' | 'sharpeRatio' | 'maxDrawdown' | 'scores' | 'rank' | 'status' | 'createdAt' | 'updatedAt'> {}

export class OlympicsEntry extends Model<OlympicsEntryAttributes, OlympicsEntryCreationAttributes> implements OlympicsEntryAttributes {
  public id!: string;
  public olympicsId!: string;
  public agentId!: string;
  public agentPubkey!: string;
  public ownerWallet!: string;
  public entryTxSignature!: string;
  public startingBalance!: string;
  public currentBalance!: string;
  public totalTrades!: number;
  public successfulTrades!: number;
  public totalVolume!: string;
  public totalProfit!: string;
  public roi!: number;
  public sharpeRatio!: number;
  public maxDrawdown!: number;
  public scores!: { roi: number; volume: number; riskAdjusted: number };
  public rank!: { roi: number; volume: number; riskAdjusted: number };
  public status!: 'active' | 'disqualified' | 'withdrawn';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

OlympicsEntry.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    olympicsId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'olympics',
        key: 'id',
      },
    },
    agentId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    agentPubkey: {
      type: DataTypes.STRING(44),
      allowNull: false,
    },
    ownerWallet: {
      type: DataTypes.STRING(44),
      allowNull: false,
    },
    entryTxSignature: {
      type: DataTypes.STRING(88),
      allowNull: false,
      unique: true,
    },
    startingBalance: {
      type: DataTypes.DECIMAL(20, 9),
      allowNull: false,
    },
    currentBalance: {
      type: DataTypes.DECIMAL(20, 9),
      defaultValue: '0',
      allowNull: false,
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
    },
    totalProfit: {
      type: DataTypes.DECIMAL(20, 9),
      defaultValue: '0',
      allowNull: false,
    },
    roi: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      allowNull: false,
      comment: 'Return on Investment %',
    },
    sharpeRatio: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      allowNull: false,
      comment: 'Risk-adjusted return metric',
    },
    maxDrawdown: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      allowNull: false,
      comment: 'Maximum loss from peak %',
    },
    scores: {
      type: DataTypes.JSON,
      defaultValue: { roi: 0, volume: 0, riskAdjusted: 0 },
      allowNull: false,
    },
    rank: {
      type: DataTypes.JSON,
      defaultValue: { roi: 999, volume: 999, riskAdjusted: 999 },
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('active', 'disqualified', 'withdrawn'),
      defaultValue: 'active',
      allowNull: false,
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
    tableName: 'olympics_entries',
    timestamps: true,
    indexes: [
      { fields: ['olympicsId'] },
      { fields: ['agentId'] },
      { fields: ['ownerWallet'] },
      { fields: ['roi'] },
      { fields: ['totalVolume'] },
      { fields: ['sharpeRatio'] },
    ],
  }
);

// Set up associations
Olympics.hasMany(OlympicsEntry, { foreignKey: 'olympicsId', as: 'entries' });
OlympicsEntry.belongsTo(Olympics, { foreignKey: 'olympicsId', as: 'olympics' });

export default { Olympics, OlympicsEntry };
