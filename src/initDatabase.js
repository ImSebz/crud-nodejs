const { testConnection, syncDatabase } = require('./config/database');
const { seedDatabase } = require('./utils/seed');

// Script de inicialización de la base de datos
const initDatabase = async () => {
  try {
    console.log('Inicializando base de datos...');

    // Probar conexión
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('No se pudo conectar a la base de datos');
    }

    // Sincronizar modelos (crear tablas)
    await syncDatabase(false); // false = no eliminar datos existentes

    // Crear datos de ejemplo
    await seedDatabase();

    console.log('¡Base de datos inicializada correctamente!');
    console.log('\nUsuarios de prueba creados:');
    console.log('\nAdministrador: admin@inventario.com / admin123456');
    console.log('\nCliente: cliente@test.com / cliente123456');
    console.log('\nProductos de ejemplo agregados al inventario');
    console.log('\nPuedes iniciar el servidor con: npm run dev');

    process.exit(0);

  } catch (error) {
    console.error('Error al inicializar la base de datos:', error.message);
    process.exit(1);
  }
};

// Ejecutar inicialización
initDatabase();