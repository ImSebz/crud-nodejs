const { Purchase, PurchaseItem, Product, User } = require('../models');
const { validationResult } = require('express-validator');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');

// Controlador de Compras - Maneja las compras de los clientes y la visualización para administradores

const createPurchase = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    const { items, observaciones } = req.body;
    const userId = req.user.id;

    // Verificar que todos los productos existan y tengan stock suficiente
    let totalCompra = 0;
    const purchaseItems = [];

    for (const item of items) {
      const product = await Product.findByPk(item.product_id, { transaction });
      
      if (!product || !product.activo) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: `Producto con ID ${item.product_id} no encontrado o no disponible`
        });
      }

      if (!product.tieneStock(item.cantidad)) {
        await transaction.rollback();
        return res.status(409).json({
          success: false,
          message: `Stock insuficiente para ${product.nombre}. Disponible: ${product.cantidad_disponible}, Solicitado: ${item.cantidad}`
        });
      }

      const subtotal = product.precio * item.cantidad;
      totalCompra += subtotal;

      purchaseItems.push({
        product_id: product.id,
        cantidad: item.cantidad,
        precio_unitario: product.precio,
        subtotal: subtotal,
        nombre_producto: product.nombre,
        numero_lote_producto: product.numero_lote
      });
    }

    // Crear la compra
    const purchase = await Purchase.create({
      user_id: userId,
      total: totalCompra,
      observaciones
    }, { transaction });

    // Crear los items de la compra y actualizar stock
    for (let i = 0; i < purchaseItems.length; i++) {
      const itemData = purchaseItems[i];
      itemData.purchase_id = purchase.id;
      
      await PurchaseItem.create(itemData, { transaction });
      
      // Reducir stock del producto
      const product = await Product.findByPk(itemData.product_id, { transaction });
      await product.reducirStock(itemData.cantidad);
    }

    await transaction.commit();

    // Obtener la compra completa con sus items para la respuesta
    const completePurchase = await Purchase.findByPk(purchase.id, {
      include: [
        {
          model: PurchaseItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'producto',
              attributes: ['id', 'nombre', 'numero_lote']
            }
          ]
        },
        {
          model: User,
          as: 'usuario',
          attributes: ['id', 'nombre', 'email']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Compra realizada exitosamente',
      data: completePurchase
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Error al crear compra:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


const getMyPurchases = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const sortBy = req.query.sortBy || 'fecha_compra';
    const order = req.query.order || 'DESC';
    const userId = req.user.id;

    const { count, rows: purchases } = await Purchase.findAndCountAll({
      where: { user_id: userId },
      include: [
        {
          model: PurchaseItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'producto',
              attributes: ['id', 'nombre', 'numero_lote']
            }
          ]
        }
      ],
      order: [[sortBy, order]],
      limit,
      offset
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      message: 'Historial de compras obtenido exitosamente',
      data: {
        purchases,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: count,
          itemsPerPage: limit,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error al obtener historial de compras:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const purchase = await Purchase.findOne({
      where: { 
        id,
        user_id: userId // Solo puede ver sus propias facturas
      },
      include: [
        {
          model: PurchaseItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'producto',
              attributes: ['id', 'nombre', 'numero_lote', 'descripcion']
            }
          ]
        },
        {
          model: User,
          as: 'usuario',
          attributes: ['id', 'nombre', 'email', 'telefono']
        }
      ]
    });

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Compra no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Factura obtenida exitosamente',
      data: purchase
    });

  } catch (error) {
    console.error('Error al obtener factura:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


const getAllPurchases = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search;
    const sortBy = req.query.sortBy || 'fecha_compra';
    const order = req.query.order || 'DESC';
    const fechaInicio = req.query.fechaInicio;
    const fechaFin = req.query.fechaFin;

    // Construir condiciones de búsqueda
    const whereClause = {};
    const userWhereClause = {};

    if (fechaInicio && fechaFin) {
      whereClause.fecha_compra = {
        [Op.between]: [new Date(fechaInicio), new Date(fechaFin + ' 23:59:59')]
      };
    } else if (fechaInicio) {
      whereClause.fecha_compra = {
        [Op.gte]: new Date(fechaInicio)
      };
    } else if (fechaFin) {
      whereClause.fecha_compra = {
        [Op.lte]: new Date(fechaFin + ' 23:59:59')
      };
    }

    if (search) {
      userWhereClause[Op.or] = [
        { nombre: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows: purchases } = await Purchase.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'usuario',
          attributes: ['id', 'nombre', 'email', 'telefono'],
          where: Object.keys(userWhereClause).length > 0 ? userWhereClause : undefined
        },
        {
          model: PurchaseItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'producto',
              attributes: ['id', 'nombre', 'numero_lote']
            }
          ]
        }
      ],
      order: [[sortBy, order]],
      limit,
      offset
    });

    // Calcular estadísticas
    const totalVentas = await Purchase.sum('total', {
      where: whereClause,
      include: Object.keys(userWhereClause).length > 0 ? [
        {
          model: User,
          as: 'usuario',
          where: userWhereClause
        }
      ] : undefined
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      message: 'Compras obtenidas exitosamente',
      data: {
        purchases,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: count,
          itemsPerPage: limit,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        statistics: {
          totalVentas: totalVentas || 0,
          totalCompras: count
        }
      }
    });

  } catch (error) {
    console.error('Error al obtener compras:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  createPurchase,
  getMyPurchases,
  getInvoice,
  getAllPurchases
};