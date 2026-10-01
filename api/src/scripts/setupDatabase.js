import { sequelize } from '../models/index.js';

try {
  await sequelize.authenticate();
  await sequelize.sync();
  console.log('Tablas sincronizadas correctamente.');
} finally {
  await sequelize.close();
}