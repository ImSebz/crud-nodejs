const jwt = require('jsonwebtoken');
require('dotenv').config();

// Utilidades para el manejo de JWT

// Genera un token JWT para un usuario
const generateToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { 
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      issuer: 'inventario-api'
    }
  );
};

// Verifica y decodifica un token JWT
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expirado');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Token inválido');
    } else {
      throw new Error('Error al verificar el token');
    }
  }
};


// Extrae el token del header Authorization
const extractToken = (authHeader) => {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
};

//  Genera un token de acceso y uno de refresh

const generateTokens = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    rol: user.rol
  };

  const accessToken = generateToken(payload);
  
  // El refresh token tiene una duración mayor
  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET,
    { 
      expiresIn: '7d',
      issuer: 'inventario-api'
    }
  );

  return {
    accessToken,
    refreshToken
  };
};

module.exports = {
  generateToken,
  verifyToken,
  extractToken,
  generateTokens
};