CREATE DATABASE IF NOT EXISTS feria_saberes;
USE feria_saberes;

-- 1. Tabla: Division (Relación 1:N con Proyectos -> Una división puede tener muchos proyectos)
CREATE TABLE IF NOT EXISTS Division (
    id INT AUTO_INCREMENT PRIMARY KEY,
    anio VARCHAR(50) NOT NULL,              -- Ej: "7mo", "1ro"
    ciclo VARCHAR(50) NOT NULL,             -- Ej: "Basico", "Superior"
    division VARCHAR(50) NULL,              -- Ej: "2da", "A" o NULL si no aplica
    orientacion ENUM('electricidad', 'informatica') NOT NULL -- Ej: 'informatica'
);

-- 2. Tabla: Proyectos (Relación N:1 con Division -> Muchos proyectos pertenecen a una división)
CREATE TABLE IF NOT EXISTS Proyectos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,           -- Ej: "Sistema de Control de Acceso IoT"
    descripcion TEXT NULL,                  -- Ej: "Proyecto basado en ESP32 para gestionar ingresos..."
    valoracion DECIMAL(3, 2) DEFAULT 0.00,  -- Ej: 4.85 (Promedio de votos)
    division_id INT NOT NULL,               -- FK que apunta a Division.id (Ej: 1)
    FOREIGN KEY (division_id) REFERENCES Division(id) ON DELETE CASCADE
);

-- 3. Tabla: Expositores (Relación N:1 con Proyectos -> Varios alumnos pueden exponer un mismo proyecto)
CREATE TABLE IF NOT EXISTS Expositores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_completo VARCHAR(150) NOT NULL,  -- Ej: "Alex Salina"
    proyecto_id INT NOT NULL,               -- FK que apunta a Proyectos.id (Ej: 3)
    FOREIGN KEY (proyecto_id) REFERENCES Proyectos(id) ON DELETE CASCADE
);

-- 4. Tabla: Imagenes_proyectos (Relación N:1 con Proyectos -> Varias fotos para un proyecto)
CREATE TABLE IF NOT EXISTS Imagenes_proyectos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    url_imagen VARCHAR(500) NOT NULL,       -- Ej: "/uploads/proyecto_3_foto1.jpg"
    proyecto_id INT NOT NULL,               -- FK que apunta a Proyectos.id (Ej: 3)
    es_principal BOOLEAN DEFAULT FALSE,     -- Ej: TRUE (es la foto de portada) o FALSE
    FOREIGN KEY (proyecto_id) REFERENCES Proyectos(id) ON DELETE CASCADE
);

-- 5. Tabla: Usuarios (Gestiona los accesos al panel de administración o sistema)
CREATE TABLE IF NOT EXISTS Usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,           -- Ej: "Profesor Juan"
    dni VARCHAR(20) UNIQUE NOT NULL,        -- Ej: "35123456"
    contrasena VARCHAR(255) NOT NULL,       -- Ej: "$2b$10$eI... (Hash bcrypt)"
    rol ENUM('admin', 'usuario') DEFAULT 'usuario' -- Ej: 'admin'
);

-- 6. Tabla: CheckIn (Control de ingreso en la puerta de la escuela)
CREATE TABLE IF NOT EXISTS CheckIn (
    id INT AUTO_INCREMENT PRIMARY KEY,
    categoria ENUM('familiar', 'alumno', 'docente', 'otro') DEFAULT 'otro', -- Ej: 'familiar'
    integrantes INT NOT NULL DEFAULT 1,     -- Ej: 4 (Vienen 4 personas juntas)
    nombre VARCHAR(150) NULL,               -- Ej: "Familia Gomez" (Opcional)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Ej: '2026-11-14 10:30:00'
);