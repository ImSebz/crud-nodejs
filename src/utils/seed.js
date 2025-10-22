const { User, Product } = require('../models');

// Script para crear datos de ejemplo en la base de datos
const seedDatabase = async () => {
  try {
    console.log(' Iniciando seeding de la base de datos...');

    // Crear usuario administrador por defecto
    const adminExists = await User.findOne({ where: { email: 'admin@inventario.com' } });
    if (!adminExists) {
      await User.create({
        nombre: 'Administrador Sistema',
        email: 'admin@inventario.com',
        password: 'admin123456',
        rol: 'administrador',
        telefono: '1234567890'
      });
      console.log(' Usuario administrador creado: admin@inventario.com -- admin123456');
    }

    // Crear usuario cliente por defecto
    const clientExists = await User.findOne({ where: { email: 'cliente@test.com' } });
    if (!clientExists) {
      await User.create({
        nombre: 'Cliente de Prueba',
        email: 'cliente@test.com',
        password: 'cliente123456',
        rol: 'cliente',
        telefono: '0987654321'
      });
      console.log(' Usuario cliente creado: cliente@test.com -- cliente123456');
    }

    // Crear productos de ejemplo
    const productos = [
      {
        numero_lote: 'LOT-001',
        nombre: 'Laptop Dell Inspiron 15',
        precio: 2500000,
        cantidad_disponible: 15,
        descripcion: 'Laptop Dell Inspiron 15 con procesador Intel i5, 8GB RAM, 256GB SSD'
      },
      {
        numero_lote: 'LOT-002',
        nombre: 'Mouse Inalámbrico Logitech',
        precio: 200000,
        cantidad_disponible: 50,
        descripcion: 'Mouse inalámbrico Logitech MX Master 3 con precisión avanzada'
      },
      {
        numero_lote: 'LOT-003',
        nombre: 'Teclado Mecánico RGB',
        precio: 89999,
        cantidad_disponible: 25,
        descripcion: 'Teclado mecánico gaming con retroiluminación RGB y switches Cherry MX'
      },
      {
        numero_lote: 'LOT-004',
        nombre: 'Monitor 24" Full HD',
        precio: 799000,
        cantidad_disponible: 12,
        descripcion: 'Monitor LED 24 pulgadas Full HD 1920x1080 con entrada HDMI'
      },
      {
        numero_lote: 'LOT-005',
        nombre: 'Auriculares Bluetooth',
        precio: 150000,
        cantidad_disponible: 30,
        descripcion: 'Auriculares inalámbricos Bluetooth con cancelación de ruido'
      }
    ];

    for (const producto of productos) {
      const exists = await Product.findOne({ where: { numero_lote: producto.numero_lote } });
      if (!exists) {
        await Product.create(producto);
        console.log(` Producto creado: ${producto.nombre}`);
      }
    }

    console.log('Seeding completado exitosamente');

  } catch (error) {
    console.error('Error durante el seeding:', error.message);
    throw error;
  }
};

module.exports = { seedDatabase };