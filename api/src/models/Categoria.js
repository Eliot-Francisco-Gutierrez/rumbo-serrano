import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Categoria = sequelize.define('Categoria', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  descripcion: DataTypes.TEXT,
  imagen_url: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, { tableName: 'categoria' });