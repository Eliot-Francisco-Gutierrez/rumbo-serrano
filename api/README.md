# API Rumbo Serrano

## Requisitos

- Node.js 18 o superior
- MySQL 8 o superior

## Configuración de MySQL

1. Instalar y arrancar MySQL Server.
2. Copiar `.env.example` como `.env`.
3. Completar `DB_USER`, `DB_PASSWORD` y `JWT_SECRET`.
4. Crear la base de datos y sus tablas:

```bash
npm install
npm run db:create
npm run db:setup
```

`db:setup` crea las tablas a partir de los modelos Sequelize y no borra datos existentes.

## Datos de prueba

Para cargar categorías, actividades y usuarios de ejemplo:

```bash
npm run db:seed
```

El usuario administrador de prueba es `admin@turismo.com` con contraseña `1234`. Cambiar esta contraseña antes de usar el sistema fuera de desarrollo.

## Ejecutar la API

```bash
npm run dev
```

La API queda disponible en `http://localhost:3000`.