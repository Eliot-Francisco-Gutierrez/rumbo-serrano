import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const ItemCarrito = sequelize.define('ItemCarrito', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  carrito_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  actividad_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  cantidad: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  fecha_reserva: {
    type: DataTypes.DATEONLY, // Guarda la fecha en formato YYYY-MM-DD
    allowNull: true
  },
  turno: {
    type: DataTypes.STRING, // Guarda 'Mañana', 'Tarde' o un horario específico como '10:00 hs'
    allowNull: true
  }
}, { tableName: 'item_carrito' });