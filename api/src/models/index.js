import { sequelize } from '../config/database.js';
import { Usuario } from './Usuario.js';
import { Categoria } from './Categoria.js';
import { Actividad } from './Actividad.js';
import { Carrito } from './Carrito.js';
import { ItemCarrito } from './ItemCarrito.js';
import { Reserva } from './Reserva.js';
import { DetalleReserva } from './DetalleReserva.js';
import { Order } from './Order.js';
import { OrderItem } from './OrderItem.js';

// Categoria <-> Actividad
Categoria.hasMany(Actividad, { foreignKey: 'categoria_id' });
Actividad.belongsTo(Categoria, { foreignKey: 'categoria_id' });

// Usuario <-> Carrito
Usuario.hasOne(Carrito, { foreignKey: 'usuario_id' });
Carrito.belongsTo(Usuario, { foreignKey: 'usuario_id' });

// Carrito <-> ItemCarrito <-> Actividad
Carrito.hasMany(ItemCarrito, { foreignKey: 'carrito_id' });
ItemCarrito.belongsTo(Carrito, { foreignKey: 'carrito_id' });
Actividad.hasMany(ItemCarrito, { foreignKey: 'actividad_id' });
ItemCarrito.belongsTo(Actividad, { foreignKey: 'actividad_id' });

// Usuario <-> Reserva
Usuario.hasMany(Reserva, { foreignKey: 'usuario_id' });
Reserva.belongsTo(Usuario, { foreignKey: 'usuario_id' });

// Reserva <-> DetalleReserva <-> Actividad
Reserva.hasMany(DetalleReserva, { foreignKey: 'reserva_id' });
DetalleReserva.belongsTo(Reserva, { foreignKey: 'reserva_id' });
Actividad.hasMany(DetalleReserva, { foreignKey: 'actividad_id' });
DetalleReserva.belongsTo(Actividad, { foreignKey: 'actividad_id' });

// Usuario <-> Order <-> OrderItem <-> Actividad
Usuario.hasMany(Order, { foreignKey: 'usuario_id' });
Order.belongsTo(Usuario, { foreignKey: 'usuario_id' });
Order.hasMany(OrderItem, { foreignKey: 'order_id' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });
Actividad.hasMany(OrderItem, { foreignKey: 'actividad_id' });
OrderItem.belongsTo(Actividad, { foreignKey: 'actividad_id' });

export { 
  sequelize, 
  Usuario, 
  Categoria, 
  Actividad, 
  Carrito, 
  ItemCarrito, 
  Reserva, 
  DetalleReserva,
  Order,
  OrderItem
};