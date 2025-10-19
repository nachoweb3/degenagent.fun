import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database';

interface ReferralAttributes {
  id: string;
  referrerAddress: string;      // Quien refiere
  referredAddress: string;       // Quien es referido
  referralCode: string;          // Código único del referrer
  rewardsClaimed: number;        // SOL reclamado
  agentsCreated: number;         // Agentes creados por el referido
  totalVolume: number;           // Volumen generado
  createdAt: Date;
  claimedAt?: Date;
}

interface ReferralCreationAttributes extends Optional<ReferralAttributes, 'id' | 'rewardsClaimed' | 'agentsCreated' | 'totalVolume' | 'createdAt' | 'claimedAt'> {}

class Referral extends Model<ReferralAttributes, ReferralCreationAttributes> implements ReferralAttributes {
  declare id: string;
  declare referrerAddress: string;
  declare referredAddress: string;
  declare referralCode: string;
  declare rewardsClaimed: number;
  declare agentsCreated: number;
  declare totalVolume: number;
  declare readonly createdAt: Date;
  declare claimedAt?: Date;
}

Referral.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    referrerAddress: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'referrer_address',
    },
    referredAddress: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // Cada wallet solo puede ser referida una vez
      field: 'referred_address',
    },
    referralCode: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'referral_code',
    },
    rewardsClaimed: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      field: 'rewards_claimed',
    },
    agentsCreated: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'agents_created',
    },
    totalVolume: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      field: 'total_volume',
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
    claimedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'claimed_at',
    },
  },
  {
    sequelize,
    tableName: 'referrals',
    timestamps: false,
    indexes: [
      { fields: ['referrer_address'] },
      { fields: ['referred_address'] },
      { fields: ['referral_code'] },
    ],
  }
);

export { Referral, ReferralAttributes };
