const { Product } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

// Controlador de Productos - Maneja el CRUD de productos del inventario (solo administradores)

const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search;
    const sortBy = req.query.sortBy || 'fecha_ingreso';
    const order = req.query.order || 'DESC';
    const activo = req.query.activo;

    // Construir condiciones de búsqueda
    const whereClause = {};
    
    if (search) {
      whereClause[Op.or] = [
        { nombre: { [Op.like]: `%${search}%` } },
        { numero_lote: { [Op.like]: `%${search}%` } }
      ];
    }

    if (activo !== undefined) {
      whereClause.activo = activo === 'true';
    }

    // Obtener productos con paginación
    const { count, rows: products } = await Product.findAndCountAll({
      where: whereClause,
      order: [[sortBy, order]],
      limit,
      offset
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      message: 'Productos obtenidos exitosamente',
      data: {
        products,
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
    console.error('Error al obtener productos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Producto obtenido exitosamente',
      data: product
    });

  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


const createProduct = async (req, res) => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    const { numero_lote, nombre, precio, cantidad_disponible, fecha_ingreso, descripcion } = req.body;

    // Verificar si el número de lote ya existe
    const existingProduct = await Product.findOne({ where: { numero_lote } });
    if (existingProduct) {
      return res.status(409).json({
        success: false,
        message: 'Este número de lote ya existe'
      });
    }

    // Crear el producto
    const newProduct = await Product.create({
      numero_lote,
      nombre,
      precio,
      cantidad_disponible,
      fecha_ingreso: fecha_ingreso || new Date(),
      descripcion
    });

    res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      data: newProduct
    });

  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


const updateProduct = async (req, res) => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const updates = req.body;

    // Buscar el producto
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Si se actualiza el número de lote, verificar que no exista
    if (updates.numero_lote && updates.numero_lote !== product.numero_lote) {
      const existingProduct = await Product.findOne({ 
        where: { 
          numero_lote: updates.numero_lote,
          id: { [Op.ne]: id }
        } 
      });
      if (existingProduct) {
        return res.status(409).json({
          success: false,
          message: 'Este número de lote ya existe'
        });
      }
    }

    // Actualizar el producto
    await product.update(updates);

    res.json({
      success: true,
      message: 'Producto actualizado exitosamente',
      data: product
    });

  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Soft delete - solo marcar como inactivo
    await product.update({ activo: false });

    res.json({
      success: true,
      message: 'Producto eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


const getProductCatalog = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search;
    const sortBy = req.query.sortBy || 'nombre';
    const order = req.query.order || 'ASC';

    // Construir condiciones - solo productos activos y con stock
    const whereClause = {
      activo: true,
      cantidad_disponible: { [Op.gt]: 0 }
    };
    
    if (search) {
      whereClause.nombre = { [Op.like]: `%${search}%` };
    }

    // Obtener productos con paginación (información limitada para clientes)
    const { count, rows: products } = await Product.findAndCountAll({
      where: whereClause,
      attributes: ['id', 'numero_lote', 'nombre', 'precio', 'cantidad_disponible', 'descripcion'],
      order: [[sortBy, order]],
      limit,
      offset
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      message: 'Catálogo obtenido exitosamente',
      data: {
        products,
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
    console.error('Error al obtener catálogo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductCatalog
};