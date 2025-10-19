import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database';

interface BondingCurveAttributes {
  id: string;
  agentId: string; // Reference to Agent
  tokenMint: string; // SPL Token mint address
  tokensSold: string; // Number of tokens sold from curve
  totalValueLocked: string; // Total SOL locked in curve
  graduated: boolean; // Has graduated to Raydium
  graduatedAt?: Date;
  raydiumPoolAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface BondingCurveCreationAttributes
  extends Optional<BondingCurveAttributes, 'id' | 'graduated' | 'graduatedAt' | 'raydiumPoolAddress' | 'createdAt' | 'updatedAt'> {}

class BondingCurve extends Model<BondingCurveAttributes, BondingCurveCreationAttributes>
  implements BondingCurveAttributes {
  declare id: string;
  declare agentId: string;
  declare tokenMint: string;
  declare tokensSold: string;
  declare totalValueLocked: string;
  declare graduated: boolean;
  declare graduatedAt?: Date;
  declare raydiumPoolAddress?: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

BondingCurve.init(
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
    tokenMint: {
      type: DataTypes.STRING(44),
      allowNull: false,
      unique: true,
      comment: 'SPL Token mint address',
    },
    tokensSold: {
      type: DataTypes.DECIMAL(20, 0),
      defaultValue: '0',
      allowNull: false,
      comment: 'Number of tokens sold from bonding curve',
    },
    totalValueLocked: {
      type: DataTypes.DECIMAL(20, 9),
      defaultValue: '0',
      allowNull: false,
      comment: 'Total SOL value locked in curve',
    },
    graduated: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      comment: 'Whether token has graduated to Raydium',
    },
    graduatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When the token graduated',
    },
    raydiumPoolAddress: {
      type: DataTypes.STRING(44),
      allowNull: true,
      comment: 'Raydium pool address after graduation',
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
    tableName: 'bonding_curves',
    timestamps: true,
    indexes: [
      { fields: ['agentId'] },
      { fields: ['tokenMint'] },
      { fields: ['graduated'] },
    ],
  }
);

// Set up associations (will be imported in other models)
export function setupBondingCurveAssociations() {
  const Agent = require('./Agent').default;
  BondingCurve.belongsTo(Agent, { foreignKey: 'agentId', as: 'agent' });
  Agent.hasOne(BondingCurve, { foreignKey: 'agentId', as: 'bondingCurve' });
}

export default BondingCurve;
