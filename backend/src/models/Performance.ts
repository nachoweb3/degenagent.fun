import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../database';

class Performance extends Model {
  public id!: number;
  public agentId!: string;
  public timestamp!: Date;
  public totalTrades!: number;
  public winningTrades!: number;
  public losingTrades!: number;
  public totalProfitLoss!: string; // Decimal as string
  public winRate!: number; // Percentage
  public averageProfit!: string; // Decimal as string
  public averageLoss!: string; // Decimal as string
  public profitFactor!: number; // Total profit / Total loss
  public sharpeRatio!: number; // Risk-adjusted returns
  public maxDrawdown!: string; // Decimal as string
  public roi!: number; // Return on Investment %
  public volume24h!: string; // Decimal as string
  public volume7d!: string; // Decimal as string
  public volume30d!: string; // Decimal as string
  public volumeAllTime!: string; // Decimal as string
  public rank!: number; // Global rank
  public rankChange!: number; // Change in rank from previous period
  public createdAt!: Date;
  public updatedAt!: Date;
}

Performance.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    agentId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'Agents',
        key: 'publicKey',
      },
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    totalTrades: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    winningTrades: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    losingTrades: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    totalProfitLoss: {
      type: DataTypes.DECIMAL(36, 18),
      allowNull: false,
      defaultValue: '0',
    },
    winRate: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    averageProfit: {
      type: DataTypes.DECIMAL(36, 18),
      allowNull: false,
      defaultValue: '0',
    },
    averageLoss: {
      type: DataTypes.DECIMAL(36, 18),
      allowNull: false,
      defaultValue: '0',
    },
    profitFactor: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    sharpeRatio: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    maxDrawdown: {
      type: DataTypes.DECIMAL(36, 18),
      allowNull: false,
      defaultValue: '0',
    },
    roi: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    volume24h: {
      type: DataTypes.DECIMAL(36, 18),
      allowNull: false,
      defaultValue: '0',
    },
    volume7d: {
      type: DataTypes.DECIMAL(36, 18),
      allowNull: false,
      defaultValue: '0',
    },
    volume30d: {
      type: DataTypes.DECIMAL(36, 18),
      allowNull: false,
      defaultValue: '0',
    },
    volumeAllTime: {
      type: DataTypes.DECIMAL(36, 18),
      allowNull: false,
      defaultValue: '0',
    },
    rank: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    rankChange: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: 'Performances',
    indexes: [
      {
        fields: ['agentId'],
      },
      {
        fields: ['timestamp'],
      },
      {
        fields: ['rank'],
      },
      {
        fields: ['roi'],
      },
    ],
  }
);

export default Performance;
