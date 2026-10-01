import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Carrito = sequelize.define('Carrito', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, { tableName: 'carrito' });