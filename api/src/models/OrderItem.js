import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  actividad_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  precio_unitario: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1 }
  },
  fecha_reserva: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  turno: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, { tableName: 'order_items' });