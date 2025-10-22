// Middleware de manejo global de errores - Captura todos los errores no manejados en la aplicación

// Middleware para manejar rutas no encontradas (404)
const notFound = (req, res, next) => {
  // Lista de rutas que los navegadores solicitan automáticamente y no son errores importantes
  const ignoredRoutes = ['/favicon.ico', '/robots.txt', '/sitemap.xml'];
  
  if (ignoredRoutes.includes(req.originalUrl)) {
    return res.status(404).end();
  }
  
  const error = new Error(`Ruta no encontrada: ${req.originalUrl}`);
  error.status = 404;
  next(error);
};

// Middleware de manejo global de errores
const errorHandler = (error, req, res, next) => {
  // Determinar el código de estado
  let statusCode = error.status || error.statusCode || 500;
  
  
  // Errores específicos de Sequelize
  if (error.name === 'SequelizeValidationError') {
    statusCode = 400;
    return res.status(statusCode).json({
      success: false,
      message: 'Error de validación',
      errors: error.errors?.map(err => ({
        field: err.path,
        message: err.message
      }))
    });
  }

  if (error.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    return res.status(statusCode).json({
      success: false,
      message: 'Ya existe un registro con esos datos',
      field: error.errors?.[0]?.path
    });
  }

  if (error.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 400;
    return res.status(statusCode).json({
      success: false,
      message: 'Referencia inválida a otro registro'
    });
  }

  if (error.name === 'SequelizeDatabaseError') {
    statusCode = 500;
    return res.status(statusCode).json({
      success: false,
      message: 'Error en la base de datos'
    });
  }

  // Errores de JWT
  if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    return res.status(statusCode).json({
      success: false,
      message: 'Token inválido'
    });
  }

  if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    return res.status(statusCode).json({
      success: false,
      message: 'Token expirado'
    });
  }

  // Error genérico
  const response = {
    success: false,
    message: error.message || 'Error interno del servidor',
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  };

  // Solo incluir stack trace en desarrollo
  if (process.env.NODE_ENV === 'development') {
    response.stack = error.stack;
  }

  res.status(statusCode).json(response);
};

/**
 * Middleware para rate limiting simple
 */
const createRateLimit = (windowMs = 15 * 60 * 1000, max = 100) => {
  const requests = new Map();

  return (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();
    
    if (!requests.has(ip)) {
      requests.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    const data = requests.get(ip);
    // Reiniciar el contador para la nueva ventana
    if (now > data.resetTime) {
      requests.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (data.count >= max) {
      return res.status(429).json({
        success: false,
        message: 'Demasiadas peticiones, por favor intenta más tarde',
        retryAfter: Math.ceil((data.resetTime - now) / 1000)
      });
    }

    data.count++;
    next();
  };
};


// Middleware de logging de peticiones

const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // !Log de petición entrante
  console.log(`${req.method} ${req.originalUrl} - IP: ${req.ip} - ${new Date().toISOString()}`);
  
  // Interceptar la respuesta para logging
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    
    console.log(`${req.method} ${req.originalUrl} - ${statusCode} - ${duration}ms`);
    
    originalSend.call(this, data);
  };
  
  next();
};


// Middleware de validación de Content-Type para POST/PUT

const validateContentType = (req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.get('Content-Type');
    
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(400).json({
        success: false,
        message: 'Content-Type debe ser application/json'
      });
    }
  }
  
  next();
};

module.exports = {
  notFound,
  errorHandler,
  createRateLimit,
  requestLogger,
  validateContentType
};