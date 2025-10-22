const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Importar configuración de base de datos
const { testConnection, syncDatabase } = require('./config/database');

// Importar middlewares
const { 
  notFound, 
  errorHandler, 
  createRateLimit, 
  requestLogger, 
  validateContentType 
} = require('./middleware/errorHandler');

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const purchaseRoutes = require('./routes/purchaseRoutes');

// Importar modelos para establecer relaciones
require('./models');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de logs
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, '../logs/access.log'), 
  { flags: 'a' }
);


// Middlewares globales


// Rate limiting - máximo 100 peticiones por IP cada 15 minutos
app.use(createRateLimit(15 * 60 * 1000, 100));

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Logging con Morgan
app.use(morgan('combined', { stream: accessLogStream }));
app.use(morgan('dev'));

// Request logger personalizado
app.use(requestLogger);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Validación de Content-Type
app.use(validateContentType);

// Trust proxy para obtener IP real en producción
app.set('trust proxy', 1);

// Rutas de la API

// Ruta para favicon (evita errores en el navegador)
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '¡Bienvenido a la API de Inventario!',
    version: '1.0.0',
    health: '/health',
    api: '/api',
    timestamp: new Date().toISOString() //!TODO Revisar el formato de tiempo para Bogotá
  });
});

// Ruta de health
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Ruta de información de la API
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'API de Inventario',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      purchases: '/api/purchases'
    },
    timestamp: new Date().toISOString()
  });
});

// Rutas principales
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/purchases', purchaseRoutes);

// Middleware de manejo de errores
app.use(notFound);
app.use(errorHandler);

// Función para inicializar la aplicación
const initializeApp = async () => {
  try {
    console.log('Iniciando aplicación...');
     
    // Probar conexión a la base de datos
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('No se pudo conectar a la base de datos');
    }

    // Sincronizar modelos con la base de datos
    await syncDatabase(false); //!false = no eliminar datos existentes
    
    console.log('Base de datos configurada correctamente');

  } catch (error) {
    console.error('Error al inicializar la aplicación:', error.message);
    process.exit(1);
  }
};

// Iniciar servidor
const startServer = async () => {
  await initializeApp();
  
  app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en puerto ${PORT}`);
    console.log(`API disponible en http://localhost:${PORT}/api`);
    console.log(`Health en http://localhost:${PORT}/health`);
    console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
  });
};


// Iniciar la app
startServer();

module.exports = app;