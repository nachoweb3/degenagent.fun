import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database';

interface PriceCandleAttributes {
  id: string;
  agentId: string;
  timestamp: Date;
  timeframe: '1m' | '5m' | '15m' | '1h' | '4h' | '1d';
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  marketCap: string;
  trades: number;
  createdAt?: Date;
}

interface PriceCandleCreationAttributes extends Optional<PriceCandleAttributes, 'id' | 'createdAt'> {}

class PriceCandle extends Model<PriceCandleAttributes, PriceCandleCreationAttributes> {
  declare id: string;
  declare agentId: string;
  declare timestamp: Date;
  declare timeframe: '1m' | '5m' | '15m' | '1h' | '4h' | '1d';
  declare open: string;
  declare high: string;
  declare low: string;
  declare close: string;
  declare volume: string;
  declare marketCap: string;
  declare trades: number;
  declare readonly createdAt: Date;
}

PriceCandle.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    agentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'agents',
        key: 'id',
      },
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    timeframe: {
      type: DataTypes.ENUM('1m', '5m', '15m', '1h', '4h', '1d'),
      allowNull: false,
    },
    open: {
      type: DataTypes.DECIMAL(20, 10),
      allowNull: false,
    },
    high: {
      type: DataTypes.DECIMAL(20, 10),
      allowNull: false,
    },
    low: {
      type: DataTypes.DECIMAL(20, 10),
      allowNull: false,
    },
    close: {
      type: DataTypes.DECIMAL(20, 10),
      allowNull: false,
    },
    volume: {
      type: DataTypes.DECIMAL(20, 2),
      allowNull: false,
    },
    marketCap: {
      type: DataTypes.DECIMAL(20, 2),
      allowNull: false,
    },
    trades: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'price_candles',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['agentId', 'timestamp', 'timeframe'],
      },
      {
        fields: ['agentId', 'timeframe', 'timestamp'],
      },
    ],
  }
);

export default PriceCandle;
