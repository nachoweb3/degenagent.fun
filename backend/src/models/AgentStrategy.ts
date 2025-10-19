import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database';

interface AgentStrategyAttributes {
  id: string;
  agentId: string;
  name: string;
  description: string;
  code: string;
  version: number;
  isActive: boolean;
  backtestResults?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AgentStrategyCreationAttributes
  extends Optional<AgentStrategyAttributes, 'id' | 'version' | 'isActive' | 'backtestResults' | 'createdAt' | 'updatedAt'> {}

class AgentStrategy extends Model<AgentStrategyAttributes, AgentStrategyCreationAttributes> {
  declare id: string;
  declare agentId: string;
  declare name: string;
  declare description: string;
  declare code: string;
  declare version: number;
  declare isActive: boolean;
  declare backtestResults?: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

AgentStrategy.init(
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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    code: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    version: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    backtestResults: {
      type: DataTypes.JSON,
      allowNull: true,
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
    tableName: 'agent_strategies',
    timestamps: true,
  }
);

export default AgentStrategy;
