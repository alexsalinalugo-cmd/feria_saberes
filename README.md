# Feria de Saberes

## Deploy en Ubuntu Server 24.04

La aplicación se ejecuta como un monolito por capas: Nginx del host termina
HTTPS en 80/443, Nginx del contenedor sirve el frontend y enruta `/api/`, NestJS
escucha en 3000 dentro de la red de Compose y MariaDB en 3306. Solo el Nginx del
host es público; la web de Compose se publica únicamente en `127.0.0.1:8080`, y
la API y la base de datos no publican puertos al host.

### 1. Configurar el dominio

En el proveedor DNS del dominio, creá:

- El registro `A` de `@` debe apuntar a `149.50.151.151`. Actualmente ya
  resuelve a esa IP, así que no hace falta cambiarlo mientras siga siendo la
  IPv4 pública del VPS.
- Un registro `CNAME` para `www` apuntando a `rectificadoralasflores.uno` (o
  registros `A` equivalentes).
- Registros `AAAA` solo si el servidor tiene IPv6 pública y está configurado
  para atenderla.

Este dominio ya apunta a un proyecto anterior. Confirmá que tenés autorización
para reutilizarlo y anotá sus registros actuales antes de cambiar cualquier
otro registro. La consulta actual no encontró un registro A para `www`; creá el
CNAME indicado y verificá que ambos nombres resuelvan al VPS antes de pedir el
certificado TLS.

### 2. Preparar Ubuntu y el firewall

Conectate por SSH, actualizá el sistema e instalá Nginx y Certbot:

```bash
sudo apt update
sudo apt full-upgrade -y
sudo apt install -y nginx certbot python3-certbot-nginx ca-certificates curl
```

Instalá Docker Engine y Compose v2 siguiendo las instrucciones oficiales para
Ubuntu 24.04: <https://docs.docker.com/engine/install/ubuntu/>. Verificá la
instalación:

```bash
sudo docker run hello-world
sudo docker compose version
```

Permití SSH antes de activar UFW para no perder la sesión; luego habilitá
solamente SSH, HTTP y HTTPS en UFW **y en el firewall del proveedor del VPS**:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
```

No abras 3000, 3306 ni 8080 a Internet. Docker puede administrar reglas de red
fuera de UFW; por eso el puerto publicado por Compose está atado explícitamente
a `127.0.0.1`. Consultá también las advertencias de firewall de la
[documentación de Docker](https://docs.docker.com/engine/install/ubuntu/#firewall-limitations).

### 3. Descargar y configurar la aplicación

Cloná el repositorio en una ruta de servicio, por ejemplo `/opt/feria_saberes`,
y entrá en esa carpeta. Si el repositorio es privado, usá una deploy key SSH
con permisos de solo lectura.

```bash
cd /opt/feria_saberes
sudo cp .env.example .env
sudo nano .env
```

Completá las dos contraseñas de MariaDB, `INITIAL_ADMIN_PASSWORD` y dos claves
JWT independientes. Generá secretos hexadecimales para evitar caracteres que
necesiten escape en `.env` y en la URL de MariaDB:

```bash
openssl rand -hex 32
```

Usá una salida distinta para cada contraseña/secreto. Conservá el `.env` fuera
del control de versiones y con acceso restringido (`sudo chmod 600 .env`).
`CORS_ORIGIN` debe contener los orígenes HTTPS exactos separados por coma. Las
credenciales Cloudinary solo son necesarias para subir imágenes de proyectos.

### 4. Iniciar y comprobar los contenedores

Desde la raíz del repositorio:

```bash
sudo docker compose up --build -d
sudo docker compose ps
sudo docker compose logs --tail=100 migrate backend web
```

Compose levanta MariaDB con un volumen persistente, espera a que esté sana,
aplica el esquema Prisma en una ejecución temporal y luego inicia el backend y
el frontend. El administrador inicial se crea con las credenciales de `.env`
si ese nombre todavía no existe; cambiar esas variables después no restablece
la contraseña existente. El frontend debe responder localmente en
`http://127.0.0.1:8080`.

El servicio de migración usa `prisma db push`, adecuado para la primera
instalación desde cero de este proyecto, que todavía no contiene migraciones
Prisma. Antes de actualizar el esquema en una base con datos reales, hacé y
verificá un backup; para cambios evolutivos de producción, conviene crear y
revisar migraciones Prisma en vez de aceptar cambios destructivos a ciegas.

### 5. Configurar Nginx y HTTPS

Instalá la plantilla incluida como sitio de Nginx en el host:

```bash
sudo cp deploy/nginx-rectificadoralasflores.conf /etc/nginx/sites-available/feria_saberes
sudo ln -s /etc/nginx/sites-available/feria_saberes /etc/nginx/sites-enabled/feria_saberes
sudo nginx -t
sudo systemctl reload nginx
```

Si el sitio `default` sigue habilitado y causa conflictos, deshabilitalo
selectivamente. Cuando el DNS resuelva correctamente y los puertos 80/443 sean
accesibles, solicitá el certificado y redirección HTTPS:

```bash
sudo certbot --nginx \
  -d rectificadoralasflores.uno \
  -d www.rectificadoralasflores.uno \
  --redirect
sudo certbot renew --dry-run
```

Certbot configura la renovación. El desafío HTTP-01 de Let's Encrypt requiere
que el dominio llegue a este servidor por el puerto 80:
<https://letsencrypt.org/docs/challenge-types/#http-01-challenge>.

### 6. Verificar y operar

- Abrí `https://rectificadoralasflores.uno` y `https://www.rectificadoralasflores.uno`.
- Probá inicio/cierre de sesión, refresh de sesión, reportes y carga de imágenes
  si Cloudinary está configurado.
- Consultá logs con `sudo docker compose logs -f backend web`.
- Para actualizaciones: guardá backup, descargá el cambio aprobado y ejecutá
  `sudo docker compose up --build -d`.
- Para detener sin borrar la base: `sudo docker compose down`.
- **No ejecutes** `sudo docker compose down -v` salvo que quieras eliminar
  permanentemente el volumen de MariaDB.

Antes de poner datos reales, configurá backups automáticos fuera del servidor y
probá una restauración. Mantené Ubuntu, Docker e imágenes base actualizados.
