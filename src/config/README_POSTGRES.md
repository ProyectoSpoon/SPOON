# Configuración de PostgreSQL

Este proyecto ha sido completamente migrado de Firebase a PostgreSQL para gestionar la autenticación, sesiones, y almacenamiento de datos.

## Configuración Requerida

Para que la aplicación funcione, debes tener PostgreSQL instalado y configurado:

1. **Instalar PostgreSQL**:
   - Windows: Descargar e instalar desde [postgresql.org](https://www.postgresql.org/download/windows/)
   - macOS: `brew install postgresql` (usando Homebrew)
   - Linux: `sudo apt-get install postgresql` (Ubuntu/Debian)

2. **Crear la base de datos**:
   ```sql
   CREATE DATABASE spoon;
   ```

3. **Configurar credenciales**:
   Edita el archivo `.env.local` en la raíz del proyecto para establecer las credenciales correctas:
   ```
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=tu_contraseña
   POSTGRES_HOST=localhost
   POSTGRES_PORT=5432
   POSTGRES_DATABASE=spoon_restaurant
   JWT_SECRET=tu_clave_secreta_para_tokens
   ```

## Estructura del Sistema

- `src/config/database.ts`: Configuración de conexión a PostgreSQL
- `src/config/db-init.ts`: Inicialización de tablas de la base de datos
- `src/services/postgres/`: Servicios que implementan la lógica de negocio
- `src/auth/postgres-auth.ts`: Implementación de autenticación con JWT

## Tablas principales

La aplicación utiliza las siguientes tablas:

1. **dueno_restaurante**: Almacena información de los usuarios/dueños
2. **sessions**: Gestiona las sesiones de los usuarios
3. **horarios**: Almacena la configuración de horarios de los restaurantes
4. **restaurantes**: Información sobre los restaurantes

## Notas importantes

- Firebase ha sido completamente eliminado del proyecto
- Los datos que anteriormente estaban en Firebase deberán ser migrados manualmente a PostgreSQL
- Los tokens JWT tienen una duración de 7 días por defecto
- Si necesitas restaurar la conexión a Firebase, tendrás que reinstalar las dependencias
