const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { 
  validateRegister, 
  validateLogin, 
  validateUpdateProfile 
} = require('../middleware/validation');

// Rutas de autenticación

// POST /api/auth/register - Registrar nuevo usuario
router.post('/register', validateRegister, authController.register);

// POST /api/auth/login - Iniciar sesión
router.post('/login', validateLogin, authController.login);

// GET /api/auth/profile - Obtener perfil del usuario autenticado
router.get('/profile', authenticateToken, authController.getProfile);

// PUT /api/auth/profile - Actualizar perfil del usuario autenticado
router.put('/profile', authenticateToken, validateUpdateProfile, authController.updateProfile);

module.exports = router;