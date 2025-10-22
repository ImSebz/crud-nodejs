const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateToken, requireAdmin, requireClient } = require('../middleware/auth');
const { validateProduct, validateUpdateProduct } = require('../middleware/validation');

// Rutas de productos

// GET /api/products/catalog - Obtener catálogo de productos (para Clientes)
router.get('/catalog', authenticateToken, requireClient, productController.getProductCatalog);

// GET /api/products - Obtener todos los productos (solo Admin)
router.get('/', authenticateToken, requireAdmin, productController.getProducts);

// GET /api/products/:id - Obtener un producto por ID (solo Admin)
router.get('/:id', authenticateToken, requireAdmin, productController.getProductById);

// POST /api/products - Crear nuevo producto (solo Admin)
router.post('/', authenticateToken, requireAdmin, validateProduct, productController.createProduct);

// PUT /api/products/:id - Actualizar producto (solo Admin)
router.put('/:id', authenticateToken, requireAdmin, validateUpdateProduct, productController.updateProduct);

// DELETE /api/products/:id - Eliminar producto (solo Admin)
router.delete('/:id', authenticateToken, requireAdmin, productController.deleteProduct);

module.exports = router;