import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database';

// Reality Show Episode Model
interface RealityShowEpisodeAttributes {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  status: 'upcoming' | 'live' | 'ended';
  featuredAgents: string[]; // Array of agent pubkeys (top 10)
  totalDonations: string; // Total SOL donated during episode
  viewerCount: number; // Peak viewers
  totalTrades: number; // Trades executed during show
  highlights: string[]; // Array of highlight IDs
  createdAt: Date;
  updatedAt: Date;
}

interface RealityShowEpisodeCreationAttributes extends Optional<RealityShowEpisodeAttributes, 'id' | 'totalDonations' | 'viewerCount' | 'totalTrades' | 'highlights' | 'createdAt' | 'updatedAt'> {}

export class RealityShowEpisode extends Model<RealityShowEpisodeAttributes, RealityShowEpisodeCreationAttributes> implements RealityShowEpisodeAttributes {
  declare id: string;
  declare title: string;
  declare description: string;
  declare startTime: Date;
  declare endTime: Date;
  declare status: 'upcoming' | 'live' | 'ended';
  declare featuredAgents: string[];
  declare totalDonations: string;
  declare viewerCount: number;
  declare totalTrades: number;
  declare highlights: string[];
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

RealityShowEpisode.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('upcoming', 'live', 'ended'),
      defaultValue: 'upcoming',
      allowNull: false,
    },
    featuredAgents: {
      type: DataTypes.JSON,
      defaultValue: [],
      allowNull: false,
      comment: 'Top 10 agents featured in episode',
    },
    totalDonations: {
      type: DataTypes.DECIMAL(20, 9),
      defaultValue: '0',
      allowNull: false,
    },
    viewerCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    totalTrades: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    highlights: {
      type: DataTypes.JSON,
      defaultValue: [],
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
    tableName: 'reality_show_episodes',
    timestamps: true,
    indexes: [
      { fields: ['status'] },
      { fields: ['startTime'] },
    ],
  }
);

// Live Trade Event Model
interface LiveTradeEventAttributes {
  id: string;
  episodeId: string;
  agentPubkey: string;
  agentName: string;
  tradeType: 'buy' | 'sell';
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  amountOut: string;
  roi: number; // % gain/loss
  aiCommentary: string; // AI-generated commentary
  signature: string; // Transaction signature
  timestamp: Date;
  reactions: {
    fire: number; // 🔥
    rocket: number; // 🚀
    skull: number; // 💀
  };
  createdAt: Date;
}

interface LiveTradeEventCreationAttributes extends Optional<LiveTradeEventAttributes, 'id' | 'reactions' | 'createdAt'> {}

export class LiveTradeEvent extends Model<LiveTradeEventAttributes, LiveTradeEventCreationAttributes> implements LiveTradeEventAttributes {
  declare id: string;
  declare episodeId: string;
  declare agentPubkey: string;
  declare agentName: string;
  declare tradeType: 'buy' | 'sell';
  declare tokenIn: string;
  declare tokenOut: string;
  declare amountIn: string;
  declare amountOut: string;
  declare roi: number;
  declare aiCommentary: string;
  declare signature: string;
  declare timestamp: Date;
  declare reactions: { fire: number; rocket: number; skull: number };
  declare readonly createdAt: Date;
}

LiveTradeEvent.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    episodeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'reality_show_episodes',
        key: 'id',
      },
    },
    agentPubkey: {
      type: DataTypes.STRING(44),
      allowNull: false,
    },
    agentName: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    tradeType: {
      type: DataTypes.ENUM('buy', 'sell'),
      allowNull: false,
    },
    tokenIn: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    tokenOut: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    amountIn: {
      type: DataTypes.DECIMAL(20, 9),
      allowNull: false,
    },
    amountOut: {
      type: DataTypes.DECIMAL(20, 9),
      allowNull: false,
    },
    roi: {
      type: DataTypes.FLOAT,
      allowNull: false,
      comment: 'Trade ROI %',
    },
    aiCommentary: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'AI-generated commentary',
    },
    signature: {
      type: DataTypes.STRING(88),
      allowNull: false,
      unique: true,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    reactions: {
      type: DataTypes.JSON,
      defaultValue: { fire: 0, rocket: 0, skull: 0 },
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'live_trade_events',
    timestamps: true,
    indexes: [
      { fields: ['episodeId'] },
      { fields: ['agentPubkey'] },
      { fields: ['timestamp'] },
    ],
  }
);

// Donation Model (Twitch-style)
interface ShowDonationAttributes {
  id: string;
  episodeId: string;
  agentPubkey: string; // Agent being supported
  donorWallet: string;
  amount: string; // SOL amount
  message: string; // Optional message
  signature: string;
  timestamp: Date;
  platformCut: string; // 30% cut
  agentShare: string; // 70% to agent
  createdAt: Date;
}

interface ShowDonationCreationAttributes extends Optional<ShowDonationAttributes, 'id' | 'message' | 'createdAt'> {}

export class ShowDonation extends Model<ShowDonationAttributes, ShowDonationCreationAttributes> implements ShowDonationAttributes {
  declare id: string;
  declare episodeId: string;
  declare agentPubkey: string;
  declare donorWallet: string;
  declare amount: string;
  declare message: string;
  declare signature: string;
  declare timestamp: Date;
  declare platformCut: string;
  declare agentShare: string;
  declare readonly createdAt: Date;
}

ShowDonation.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    episodeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'reality_show_episodes',
        key: 'id',
      },
    },
    agentPubkey: {
      type: DataTypes.STRING(44),
      allowNull: false,
    },
    donorWallet: {
      type: DataTypes.STRING(44),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(20, 9),
      allowNull: false,
    },
    message: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    signature: {
      type: DataTypes.STRING(88),
      allowNull: false,
      unique: true,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    platformCut: {
      type: DataTypes.DECIMAL(20, 9),
      allowNull: false,
      comment: '30% platform fee',
    },
    agentShare: {
      type: DataTypes.DECIMAL(20, 9),
      allowNull: false,
      comment: '70% to agent owner',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'show_donations',
    timestamps: true,
    indexes: [
      { fields: ['episodeId'] },
      { fields: ['agentPubkey'] },
      { fields: ['donorWallet'] },
    ],
  }
);

// Associations
RealityShowEpisode.hasMany(LiveTradeEvent, { foreignKey: 'episodeId', as: 'trades' });
LiveTradeEvent.belongsTo(RealityShowEpisode, { foreignKey: 'episodeId', as: 'episode' });

RealityShowEpisode.hasMany(ShowDonation, { foreignKey: 'episodeId', as: 'donations' });
ShowDonation.belongsTo(RealityShowEpisode, { foreignKey: 'episodeId', as: 'episode' });

export default { RealityShowEpisode, LiveTradeEvent, ShowDonation };
