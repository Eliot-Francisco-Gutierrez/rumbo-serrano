import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre_usuario: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  nombre: DataTypes.STRING,
  apellido: DataTypes.STRING,
  telefono: DataTypes.STRING,
  rol: {
    type: DataTypes.ENUM('client', 'cliente', 'admin', 'operador'),
    defaultValue: 'client'
  }
}, { tableName: 'usuario' });