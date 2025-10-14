import { Sequelize } from 'sequelize';
import path from 'path';

// Use SQLite for development, easily switch to PostgreSQL for production
const DATABASE_URL = process.env.DATABASE_URL;

export const sequelize = DATABASE_URL
  ? new Sequelize(DATABASE_URL, {
      dialect: 'postgres',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    })
  : new Sequelize({
      dialect: 'sqlite',
      storage: path.join(__dirname, '..', 'data', 'agent-fun.db'),
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
    });

export async function initDatabase(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Import all models AFTER sequelize is initialized
    await import('./models/Agent');
    await import('./models/Olympics');
    await import('./models/VaultLending');

    // Sync models (creates tables if they don't exist)
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('✅ Database models synchronized');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

export async function closeDatabase(): Promise<void> {
  await sequelize.close();
  console.log('✅ Database connection closed');
}
