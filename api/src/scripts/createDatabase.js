import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config();

const databaseName = process.env.DB_NAME;

if (!databaseName || !/^[a-zA-Z0-9_]+$/.test(databaseName)) {
  throw new Error('DB_NAME debe contener únicamente letras, números o guiones bajos');
}

const sequelize = new Sequelize('', process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  dialect: 'mysql',
  logging: false
});

try {
  await sequelize.authenticate();
  await sequelize.query(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  console.log(`Base de datos "${databaseName}" creada o ya existente.`);
} finally {
  await sequelize.close();
}