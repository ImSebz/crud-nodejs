const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');
const { authenticateToken, requireAdmin, requireClient } = require('../middleware/auth');
const { validatePurchase } = require('../middleware/validation');

// Rutas de compras

// POST /api/purchases - Crear nueva compra (solo Clientes)
router.post('/', authenticateToken, requireClient, validatePurchase, purchaseController.createPurchase);

// GET /api/purchases/my-purchases - Obtener historial de compras del cliente autenticado
router.get('/my-purchases', authenticateToken, requireClient, purchaseController.getMyPurchases);

// GET /api/purchases/invoice/:id - Obtener factura de una compra específica
router.get('/invoice/:id', authenticateToken, requireClient, purchaseController.getInvoice);

// GET /api/purchases/admin/all - Obtener todas las compras (solo Admin)
router.get('/admin/all', authenticateToken, requireAdmin, purchaseController.getAllPurchases);

module.exports = router;