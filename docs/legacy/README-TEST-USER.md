# Creación de Usuario de Prueba para Spoon Restaurant

Este documento proporciona instrucciones para crear un usuario de prueba para la aplicación Spoon Restaurant utilizando PostgreSQL.

## Datos del Usuario de Prueba

El usuario de prueba tendrá las siguientes credenciales:

- **Email**: `test@spoonrestaurant.com`
- **Contraseña**: `Test2025!`
- **Nombre**: Usuario
- **Apellido**: Prueba
- **Rol**: OWNER (Propietario)
- **Permisos**: Lectura/escritura de menú, órdenes e inventario

## Método 1: Usando los Scripts Automatizados

Este es el método más sencillo y recomendado para la mayoría de los usuarios.

### Para usuarios de Windows:

1. Abre una terminal en la carpeta raíz del proyecto.
2. Ejecuta el script batch:

```
scripts\create-test-user.bat
```

### Para usuarios de Linux/Mac:

1. Abre una terminal en la carpeta raíz del proyecto.
2. Dale permisos de ejecución al script:

```bash
chmod +x scripts/create-test-user.sh
```

3. Ejecuta el script:

```bash
./scripts/create-test-user.sh
```

Estos scripts automatizados realizarán los siguientes pasos:
1. Instalar las dependencias necesarias
2. Inicializar las tablas en PostgreSQL
3. Crear el usuario de prueba

## Método 2: Paso a Paso Manual

Si prefieres ejecutar los pasos manualmente o si el método automatizado no funciona, puedes seguir estos pasos:

### Paso 1: Inicializar las Tablas en PostgreSQL

Antes de crear un usuario de prueba, asegúrate de que las tablas necesarias existan en la base de datos PostgreSQL.

#### Requisitos:

- Node.js instalado
- Dependencia `pg` instalada
- Dependencia `dotenv` instalada
- Conexión a la base de datos PostgreSQL configurada

#### Instrucciones:

1. Asegúrate de que el archivo `.env.local` en la raíz del proyecto contenga la configuración correcta de PostgreSQL:

```
POSTGRES_USER=spoon_admin
POSTGRES_HOST=localhost
POSTGRES_DATABASE=spoon
POSTGRES_PASSWORD=Carlos0412*
POSTGRES_PORT=5432
```

2. Abre una terminal en la carpeta raíz del proyecto.

3. Instala las dependencias necesarias si no están instaladas:

```bash
npm install pg dotenv
```

4. Ejecuta el script de inicialización de tablas:

```bash
node scripts/init-postgres-tables.js
```

5. Verifica que el script se haya ejecutado correctamente y que las tablas se hayan creado.

### Paso 2: Crear un Usuario de Prueba

Una vez que las tablas estén inicializadas, puedes crear un usuario de prueba.

#### Requisitos adicionales:

- Dependencia `bcryptjs` instalada

#### Instrucciones:

1. Instala la dependencia adicional si no está instalada:

```bash
npm install bcryptjs
```

2. Ejecuta el script para crear un usuario de prueba:

```bash
node scripts/create-postgres-test-user.js
```

3. Espera a que el proceso termine. Verás un mensaje de confirmación en la terminal.

4. Usa las credenciales proporcionadas para iniciar sesión en la aplicación.

## Solución de Problemas

### Si recibes un error de conexión a la base de datos:

Verifica que:
- La base de datos PostgreSQL esté en ejecución
- Las credenciales en `.env.local` sean correctas
- El puerto de PostgreSQL sea el correcto
- La base de datos 'spoon' exista

### Si recibes un error de que el usuario ya existe:

El usuario ya existe en la base de datos. Puedes usar las credenciales proporcionadas para iniciar sesión.

### Si recibes un error de que las tablas no existen:

Asegúrate de haber ejecutado primero el script `init-postgres-tables.js` para crear las tablas necesarias.

## Notas Importantes

- Este método es para desarrollo y pruebas. No debe usarse en producción.
- El usuario creado tiene permisos de propietario (OWNER), lo que le da acceso completo a la aplicación.
- Si necesitas modificar los datos del usuario de prueba, puedes editar el archivo `create-postgres-test-user.js` antes de ejecutarlo.
