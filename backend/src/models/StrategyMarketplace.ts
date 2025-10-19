import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database';

interface StrategyMarketplaceAttributes {
  id: string;
  strategyId: string;
  sellerId: string;
  title: string;
  description: string;
  price: string;
  category: 'momentum' | 'scalping' | 'value' | 'arbitrage' | 'custom';
  tags: string[];
  performance: {
    winRate: number;
    totalTrades: number;
    avgReturn: number;
    backtestPeriod: string;
  };
  sales: number;
  rating: number;
  reviews: number;
  isVerified: boolean;
  isFeatured: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface StrategyMarketplaceCreationAttributes
  extends Optional<
    StrategyMarketplaceAttributes,
    'id' | 'sales' | 'rating' | 'reviews' | 'isVerified' | 'isFeatured' | 'createdAt' | 'updatedAt'
  > {}

class StrategyMarketplace extends Model<
  StrategyMarketplaceAttributes,
  StrategyMarketplaceCreationAttributes
> {
  declare id: string;
  declare strategyId: string;
  declare sellerId: string;
  declare title: string;
  declare description: string;
  declare price: string;
  declare category: 'momentum' | 'scalping' | 'value' | 'arbitrage' | 'custom';
  declare tags: string[];
  declare performance: {
    winRate: number;
    totalTrades: number;
    avgReturn: number;
    backtestPeriod: string;
  };
  declare sales: number;
  declare rating: number;
  declare reviews: number;
  declare isVerified: boolean;
  declare isFeatured: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

StrategyMarketplace.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    strategyId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'agent_strategies',
        key: 'id',
      },
    },
    sellerId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(20, 2),
      allowNull: false,
    },
    category: {
      type: DataTypes.ENUM('momentum', 'scalping', 'value', 'arbitrage', 'custom'),
      allowNull: false,
    },
    tags: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    performance: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    sales: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0,
    },
    reviews: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isFeatured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'strategy_marketplace',
    timestamps: true,
    indexes: [
      {
        fields: ['category'],
      },
      {
        fields: ['sellerId'],
      },
      {
        fields: ['sales'],
      },
      {
        fields: ['rating'],
      },
    ],
  }
);

export default StrategyMarketplace;
