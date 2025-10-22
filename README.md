# API de Inventario

API REST para gestión de inventario con autenticación JWT y roles de usuario (Administrador/Cliente).

## Descripción

Sistema de inventario con las siguientes funcionalidades:

**Autenticación:**
- Registro y login con JWT
- Roles: Administrador y Cliente
- Encriptación con bcryptjs

**Administrador:**
- CRUD completo de productos
- Visualización de todas las compras
- Gestión del sistema

**Cliente:**
- Compras con múltiples productos
- Facturas detalladas
- Historial de compras

## Tecnologías

- **Node.js** - Runtime
- **Express.js** - Framework web
- **Sequelize** - ORM para MySQL
- **MySQL** - Base de datos
- **JWT** - Autenticación
- **bcryptjs** - Encriptación
- **express-validator** - Validaciones
- **Morgan** - Logging

## Requisitos

- Node.js v14+
- MySQL v5.7+
- npm

## Instalación

### 1. Clonar repositorio
```bash
git clone https://github.com/ImSebz/crud-nodejs.git
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar MySQL
```sql

CREATE DATABASE inventario_db;

```

### 4. Configurar variables de entorno
Crear archivo `.env`:
```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_NAME=inventario_db
DB_USER=*usuario*
DB_PASSWORD=*password*

JWT_SECRET=*JWT*
JWT_EXPIRES_IN=24h

LOG_LEVEL=info
```

### 5. Inicializar base de datos y seeder
```bash
npm run init:db
```

### 6. Crea la carpeta logs
```bash
mkdir logs
```

### 7. Ejecutar aplicación
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## Usuarios de Prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| Administrador | admin@inventario.com | admin123456 |
| Cliente | cliente@test.com | cliente123456 |

## Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/profile` - Obtener perfil
- `PUT /api/auth/profile` - Actualizar perfil

### Productos (Administrador)
- `GET /api/products` - Listar productos
- `GET /api/products/:id` - Obtener producto
- `POST /api/products` - Crear producto
- `PUT /api/products/:id` - Actualizar producto
- `DELETE /api/products/:id` - Eliminar producto

### Catálogo (Cliente)
- `GET /api/products/catalog` - Ver catálogo

### Compras (Cliente)
- `POST /api/purchases` - Realizar compra
- `GET /api/purchases/my-purchases` - Mi historial
- `GET /api/purchases/invoice/:id` - Obtener factura

### Compras (Administrador)
- `GET /api/purchases/admin/all` - Todas las compras

## Ejemplos de Uso

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@inventario.com", "password": "admin123456"}'
```

### Crear Producto (Admin)
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "numero_lote": "LOT-001",
    "nombre": "Laptop Dell",
    "precio": 1500000,
    "cantidad_disponible": 10,
    "descripcion": "Laptop Dell Inspiron 15"
  }'
```

### Realizar Compra (Cliente)
```bash
curl -X POST http://localhost:3000/api/purchases \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "items": [
      {"product_id": 1, "cantidad": 2}
    ],
    "observaciones": "Entrega urgente"
  }'
```

## Comandos NPM

| Comando | Descripción |
|---------|-------------|
| `npm install` | Instalar dependencias |
| `npm run dev` | Desarrollo con nodemon |
| `npm start` | Producción |
| `npm run init:db` | Inicializar BD |

## URLs

- API: `http://localhost:3000/api`
- Health: `http://localhost:3000/health`


## Especificaciones Técnicas

### Campos de Producto
- Número de lote (único)
- Nombre
- Precio
- Cantidad disponible
- Fecha de ingreso

### Sistema de Compras
- Múltiples productos por compra
- Control automático de stock
- Facturas con número único
- Historial completo

### Seguridad
- Validación de JWT
- Rate limiting (100 req/15min)
- Validación de datos
- CORS configurado