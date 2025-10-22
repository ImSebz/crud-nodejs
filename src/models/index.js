const User = require('./User');
const Product = require('./Product');
const Purchase = require('./Purchase');
const PurchaseItem = require('./PurchaseItem');

// Configuración de las relaciones entre modelos - Compras

// Relación Usuario - Compras (Un usuario puede tener muchas compras)
User.hasMany(Purchase, {
  foreignKey: 'user_id',
  as: 'compras'
});

Purchase.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'usuario'
});

// Relación Compra - Items de Compra (Una compra puede tener muchos items)
Purchase.hasMany(PurchaseItem, {
  foreignKey: 'purchase_id',
  as: 'items'
});

PurchaseItem.belongsTo(Purchase, {
  foreignKey: 'purchase_id',
  as: 'compra'
});

// Relación Producto - Items de Compra (Un producto puede estar en muchos items)
Product.hasMany(PurchaseItem, {
  foreignKey: 'product_id',
  as: 'items_vendidos'
});

PurchaseItem.belongsTo(Product, {
  foreignKey: 'product_id',
  as: 'producto'
});

// Relación Muchos a Muchos entre Usuario y Producto a través de Purchase y PurchaseItem
User.belongsToMany(Product, {
  through: {
    model: PurchaseItem,
    unique: false
  },
  foreignKey: 'user_id',
  otherKey: 'product_id',
  as: 'productos_comprados'
});

Product.belongsToMany(User, {
  through: {
    model: PurchaseItem,
    unique: false
  },
  foreignKey: 'product_id',
  otherKey: 'user_id',
  as: 'compradores'
});

module.exports = {
  User,
  Product,
  Purchase,
  PurchaseItem
};