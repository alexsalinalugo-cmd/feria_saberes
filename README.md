# Feria de Saberes

## Ejecutar con Docker Compose

Se necesita Docker con Docker Compose v2. Desde la raíz del repositorio:

1. Copiá `.env.example` como `.env`.
2. Completá las contraseñas de MariaDB, las claves JWT y la contraseña inicial
   del administrador. Usá secretos propios y no compartas ni subas `.env`.
   Para `DB_PASSWORD`, usá letras y números para que la URL de conexión no
   necesite codificación adicional.
3. Iniciá los servicios:

   ```sh
   docker compose up --build -d
   ```

4. Abrí `http://localhost:8080` (o el puerto configurado en `HTTP_PORT`).

Nginx sirve las páginas estáticas del frontend y reenvía `/api/` al backend,
quitando el prefijo `/api`. MariaDB queda en una red interna de Docker y sus
datos persisten en el volumen `feria_saberes_db`. Al iniciar, un servicio
temporal aplica el esquema de Prisma antes de arrancar la API.

El administrador inicial se crea si no existe un usuario con el nombre
configurado. Las variables `INITIAL_ADMIN_USERNAME` e
`INITIAL_ADMIN_PASSWORD` no actualizan una cuenta existente. Las imágenes de
proyectos requieren las variables de Cloudinary, que son opcionales para el
resto del sistema.

Para detener los contenedores sin borrar los datos:

```sh
docker compose down
```

`docker compose down -v` también elimina la base de datos persistida.

Para publicar el servicio en Internet, configurá HTTPS en el proxy o balanceador
externo y usá secretos de producción robustos.
