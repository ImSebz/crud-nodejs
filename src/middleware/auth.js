const { verifyToken, extractToken } = require('../utils/jwt');
const { User } = require('../models');

// Middleware de autenticación - Verifica que el usuario esté autenticado con un token JWT válido
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractToken(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acceso requerido :('
      });
    }

    // Verificar el token
    const decoded = verifyToken(token);
    
    // Buscar el usuario en la base de datos
    const user = await User.findByPk(decoded.id);
    
    if (!user || !user.activo) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado o inactivo :('
      });
    }

    // Agregar la información del usuario a la request
    req.user = user;
    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message
    });
  }
};

// Middleware para verificar roles específicos
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para acceder a este recurso'
      });
    }

    next();
  };
};

// Middleware específico para administradores
const requireAdmin = requireRole('administrador');

// Middleware específico para clientes
const requireClient = requireRole('cliente');

// Middleware que permite acceso tanto a administradores como clientes
const requireUser = requireRole('administrador', 'cliente');

module.exports = {
  authenticateToken,
  requireRole,
  requireAdmin,
  requireClient,
  requireUser
};