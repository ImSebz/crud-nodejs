const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Modelo de Producto - Gestiona el inventario de productos del sistema
const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  numero_lote: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: {
      msg: 'Este número de lote ya existe'
    },
    validate: {
      notEmpty: {
        msg: 'El número de lote es requerido'
      },
      len: {
        args: [1, 50],
        msg: 'El número de lote debe tener entre 1 y 50 caracteres'
      }
    }
  },
  nombre: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El nombre del producto es requerido'
      },
      len: {
        args: [2, 200],
        msg: 'El nombre debe tener entre 2 y 200 caracteres'
      }
    }
  },
  precio: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: {
        args: [0.01],
        msg: 'El precio debe ser mayor a 0'
      },
      isDecimal: {
        msg: 'El precio debe ser un número válido'
      }
    }
  },
  cantidad_disponible: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: {
        args: [0],
        msg: 'La cantidad disponible no puede ser negativa'
      },
      isInt: {
        msg: 'La cantidad disponible debe ser un número entero'
      }
    }
  },
  fecha_ingreso: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    validate: {
      isDate: {
        msg: 'La fecha de ingreso debe ser una fecha válida'
      }
    }
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'productos',
  indexes: [
    {
      fields: ['numero_lote']
    },
    {
      fields: ['nombre']
    },
    {
      fields: ['activo']
    }
  ]
});

// Método para verificar si hay stock suficiente
Product.prototype.tieneStock = function(cantidad) {
  return this.cantidad_disponible >= cantidad && cantidad > 0;
};

// Método para reducir el stock del producto
Product.prototype.reducirStock = async function(cantidad) {
  if (!this.tieneStock(cantidad)) {
    throw new Error(`Stock insuficiente. Disponible: ${this.cantidad_disponible}, Requerido: ${cantidad}`);
  }
  
  this.cantidad_disponible -= cantidad;
  return await this.save();
};

// Método para aumentar el stock del producto
Product.prototype.aumentarStock = async function(cantidad) {
  this.cantidad_disponible += cantidad;
  return await this.save();
};

module.exports = Product;