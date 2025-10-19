import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database';

// King of the Hill Competition Model
interface KingOfTheHillAttributes {
  id: string;
  agentId: string;
  agentName: string;
  tokenMint: string;
  marketCap: string; // Current market cap in SOL
  crownedAt: Date; // When they became king
  dethronedAt?: Date; // When they lost the crown
  timeAsKing: number; // Total seconds as king in this reign
  points: number; // Points earned for being king
  rank: number; // Historical rank (1 = current king)
  competitionRound: string; // e.g., "2024-01-15" (daily) or "2024-W03" (weekly)
  roundType: 'daily' | 'weekly';
  createdAt: Date;
  updatedAt: Date;
}

interface KingOfTheHillCreationAttributes
  extends Optional<KingOfTheHillAttributes, 'id' | 'dethronedAt' | 'timeAsKing' | 'points' | 'rank' | 'createdAt' | 'updatedAt'> {}

export class KingOfTheHill extends Model<KingOfTheHillAttributes, KingOfTheHillCreationAttributes>
  implements KingOfTheHillAttributes {
  declare id: string;
  declare agentId: string;
  declare agentName: string;
  declare tokenMint: string;
  declare marketCap: string;
  declare crownedAt: Date;
  declare dethronedAt?: Date;
  declare timeAsKing: number;
  declare points: number;
  declare rank: number;
  declare competitionRound: string;
  declare roundType: 'daily' | 'weekly';
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

KingOfTheHill.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    agentId: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: 'Reference to Agent table',
    },
    agentName: {
      type: DataTypes.STRING(64),
      allowNull: false,
      comment: 'Agent name (cached for performance)',
    },
    tokenMint: {
      type: DataTypes.STRING(44),
      allowNull: false,
      comment: 'SPL Token mint address',
    },
    marketCap: {
      type: DataTypes.DECIMAL(20, 9),
      allowNull: false,
      comment: 'Market cap in SOL when crowned/updated',
    },
    crownedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'When this agent became king',
    },
    dethronedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When this agent lost the crown (null = still king)',
    },
    timeAsKing: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      comment: 'Total seconds as king in this reign',
    },
    points: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      comment: 'Points earned (1 point per hour as king)',
    },
    rank: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      allowNull: false,
      comment: 'Current rank (1 = current king)',
    },
    competitionRound: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: 'Competition round identifier (YYYY-MM-DD or YYYY-Www)',
    },
    roundType: {
      type: DataTypes.ENUM('daily', 'weekly'),
      defaultValue: 'daily',
      allowNull: false,
      comment: 'Type of competition round',
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
    tableName: 'king_of_the_hill',
    timestamps: true,
    indexes: [
      { fields: ['agentId'] },
      { fields: ['rank'] },
      { fields: ['competitionRound'] },
      { fields: ['dethronedAt'] },
      { fields: ['crownedAt'] },
      { fields: ['points'] },
    ],
  }
);

// King of the Hill Leaderboard Model (aggregated stats per agent)
interface KingLeaderboardAttributes {
  id: string;
  agentId: string;
  agentName: string;
  tokenMint: string;
  totalTimeAsKing: number; // Total seconds as king across all reigns
  totalPoints: number; // Total points earned
  totalCrowns: number; // Number of times crowned
  longestReign: number; // Longest single reign in seconds
  currentlyKing: boolean; // Is currently the king
  lastCrownedAt?: Date; // Last time they were crowned
  createdAt: Date;
  updatedAt: Date;
}

interface KingLeaderboardCreationAttributes
  extends Optional<
    KingLeaderboardAttributes,
    'id' | 'totalTimeAsKing' | 'totalPoints' | 'totalCrowns' | 'longestReign' | 'currentlyKing' | 'lastCrownedAt' | 'createdAt' | 'updatedAt'
  > {}

export class KingLeaderboard extends Model<KingLeaderboardAttributes, KingLeaderboardCreationAttributes>
  implements KingLeaderboardAttributes {
  declare id: string;
  declare agentId: string;
  declare agentName: string;
  declare tokenMint: string;
  declare totalTimeAsKing: number;
  declare totalPoints: number;
  declare totalCrowns: number;
  declare longestReign: number;
  declare currentlyKing: boolean;
  declare lastCrownedAt?: Date;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

KingLeaderboard.init(
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
      comment: 'Reference to Agent table',
    },
    agentName: {
      type: DataTypes.STRING(64),
      allowNull: false,
      comment: 'Agent name (cached for performance)',
    },
    tokenMint: {
      type: DataTypes.STRING(44),
      allowNull: false,
      comment: 'SPL Token mint address',
    },
    totalTimeAsKing: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      comment: 'Total seconds as king across all reigns',
    },
    totalPoints: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      comment: 'Total points earned across all reigns',
    },
    totalCrowns: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      comment: 'Number of times crowned',
    },
    longestReign: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      comment: 'Longest single reign in seconds',
    },
    currentlyKing: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      comment: 'Is currently the king',
    },
    lastCrownedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Last time they were crowned',
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
    tableName: 'king_leaderboard',
    timestamps: true,
    indexes: [
      { fields: ['agentId'] },
      { fields: ['totalPoints'] },
      { fields: ['totalTimeAsKing'] },
      { fields: ['currentlyKing'] },
    ],
  }
);

// Set up associations
KingOfTheHill.hasOne(KingLeaderboard, { foreignKey: 'agentId', sourceKey: 'agentId', as: 'leaderboardStats' });
KingLeaderboard.belongsTo(KingOfTheHill, { foreignKey: 'agentId', targetKey: 'agentId', as: 'currentReign' });

export default { KingOfTheHill, KingLeaderboard };
