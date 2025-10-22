const { body } = require('express-validator');

// Validaciones para autenticación

// Validaciones para el registro de usuarios
const validateRegister = [
  body('nombre')
    .trim()
    .notEmpty()
    .withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('El email es requerido')
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),

  body('rol')
    .optional()
    .isIn(['administrador', 'cliente'])
    .withMessage('El rol debe ser administrador o cliente'),

  body('telefono')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('El teléfono no puede tener más de 20 caracteres')
];

// Validaciones para el login
const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('El email es requerido')
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
];

// Validaciones para actualizar perfil
const validateUpdateProfile = [
  body('nombre')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),

  body('telefono')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('El teléfono no puede tener más de 20 caracteres'),

  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres')
];

// Validaciones para productos

// Validaciones para crear/actualizar productos
const validateProduct = [
  body('numero_lote')
    .trim()
    .notEmpty()
    .withMessage('El número de lote es requerido')
    .isLength({ min: 1, max: 50 })
    .withMessage('El número de lote debe tener entre 1 y 50 caracteres'),

  body('nombre')
    .trim()
    .notEmpty()
    .withMessage('El nombre del producto es requerido')
    .isLength({ min: 2, max: 200 })
    .withMessage('El nombre debe tener entre 2 y 200 caracteres'),

  body('precio')
    .notEmpty()
    .withMessage('El precio es requerido')
    .isFloat({ min: 0.01 })
    .withMessage('El precio debe ser mayor a 0'),

  body('cantidad_disponible')
    .notEmpty()
    .withMessage('La cantidad disponible es requerida')
    .isInt({ min: 0 })
    .withMessage('La cantidad disponible debe ser un número entero mayor o igual a 0'),

  body('fecha_ingreso')
    .optional()
    .isISO8601()
    .withMessage('La fecha de ingreso debe ser una fecha válida'),

  body('descripcion')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('La descripción no puede tener más de 1000 caracteres')
];

/**
 * Validaciones para actualizar productos (campos opcionales)
 */
const validateUpdateProduct = [
  body('numero_lote')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('El número de lote debe tener entre 1 y 50 caracteres'),

  body('nombre')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('El nombre debe tener entre 2 y 200 caracteres'),

  body('precio')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('El precio debe ser mayor a 0'),

  body('cantidad_disponible')
    .optional()
    .isInt({ min: 0 })
    .withMessage('La cantidad disponible debe ser un número entero mayor o igual a 0'),

  body('fecha_ingreso')
    .optional()
    .isISO8601()
    .withMessage('La fecha de ingreso debe ser una fecha válida'),

  body('descripcion')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('La descripción no puede tener más de 1000 caracteres')
];

/**
 * Validaciones para compras
 */

// Validaciones para crear una compra
const validatePurchase = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Debe incluir al menos un producto en la compra'),

  body('items.*.product_id')
    .notEmpty()
    .withMessage('El ID del producto es requerido')
    .isInt({ min: 1 })
    .withMessage('El ID del producto debe ser un número entero válido'),

  body('items.*.cantidad')
    .notEmpty()
    .withMessage('La cantidad es requerida')
    .isInt({ min: 1 })
    .withMessage('La cantidad debe ser un número entero mayor a 0'),

  body('observaciones')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Las observaciones no pueden tener más de 500 caracteres')
];

module.exports = {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateProduct,
  validateUpdateProduct,
  validatePurchase
};