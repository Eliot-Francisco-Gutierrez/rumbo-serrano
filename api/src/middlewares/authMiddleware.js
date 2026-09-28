import jwt from 'jsonwebtoken';

const obtenerSecretoJwt = () => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET no está configurado');
    }

    return process.env.JWT_SECRET;
};

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Formato: "Bearer TOKEN"

    if (!token) {
        return res.status(401).json({ mensaje: 'Acceso denegado, token no proporcionado' });
    }

    try {
        const verificado = jwt.verify(token, obtenerSecretoJwt());
        req.usuario = verificado; // Guardamos la info del token (id, rol) en la req
        next();
    } catch (error) {
        res.status(403).json({ mensaje: 'Token inválido o expirado' });
    }
};

export const isAdmin = (req, res, next) => {
    if (req.usuario && req.usuario.rol === 'admin') {
        next();
    } else {
        res.status(403).json({ mensaje: 'Acceso restringido: requiere permisos de Administrador' });
    }
};

// Verificar si el usuario es 'admin' O 'operador' (Para gestión de actividades)
export const esAdminUOperador = (req, res, next) => {
    if (req.usuario && (req.usuario.rol === 'admin' || req.usuario.rol === 'operador')) {
        next();
    } else {
        res.status(403).json({ mensaje: 'Acceso restringido: requiere permisos de Administrador u Operador' });
    }
};

export const verificarToken = verifyToken;
export const esAdmin = isAdmin;