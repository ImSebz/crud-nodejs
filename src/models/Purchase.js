const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Modelo de Compra - Gestiona las compras realizadas por los clientes
const Purchase = sequelize.define('Purchase', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  fecha_compra: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  total: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: {
      min: {
        args: [0.01],
        msg: 'El total debe ser mayor a 0'
      },
      isDecimal: {
        msg: 'El total debe ser un número válido'
      }
    }
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'completada', 'cancelada'),
    allowNull: false,
    defaultValue: 'completada'
  },
  numero_factura: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'compras',
  hooks: {
    // Hook que se ejecuta antes de crear una compra - Genera automáticamente el número de factura
    beforeCreate: (purchase) => {
      if (!purchase.numero_factura) {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        purchase.numero_factura = `FAC-${timestamp}-${random}`;
      }
    }
  }
});

module.exports = Purchase;