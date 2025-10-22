const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Modelo de Item de Compra - Gestiona los productos individuales dentro de cada compra
const PurchaseItem = sequelize.define('PurchaseItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  purchase_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'compras',
      key: 'id'
    }
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'productos',
      key: 'id'
    }
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: {
        args: [1],
        msg: 'La cantidad debe ser mayor a 0'
      },
      isInt: {
        msg: 'La cantidad debe ser un número entero'
      }
    }
  },
  precio_unitario: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: {
        args: [0.01],
        msg: 'El precio unitario debe ser mayor a 0'
      },
      isDecimal: {
        msg: 'El precio unitario debe ser un número válido'
      }
    }
  },
  subtotal: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: {
      min: {
        args: [0.01],
        msg: 'El subtotal debe ser mayor a 0'
      },
      isDecimal: {
        msg: 'El subtotal debe ser un número válido'
      }
    }
  },
  // Información del producto al momento de la compra (para mantener histórico)
  nombre_producto: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  numero_lote_producto: {
    type: DataTypes.STRING(50),
    allowNull: false
  }
}, {
  tableName: 'items_compra',
  hooks: {
    // Hook que se ejecuta antes de crear un item de compra - Calcula automáticamente el subtotal
    beforeCreate: (item) => {
      item.subtotal = item.cantidad * item.precio_unitario;
    },
    // Hook que se ejecuta antes de actualizar un item de compra - Recalcula el subtotal si cambian cantidad o precio
    beforeUpdate: (item) => {
      if (item.changed('cantidad') || item.changed('precio_unitario')) {
        item.subtotal = item.cantidad * item.precio_unitario;
      }
    }
  }
});

module.exports = PurchaseItem;