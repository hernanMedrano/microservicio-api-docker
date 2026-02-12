
# Database Maintenance Service - Resumen Unificado

## Descripción
Microservicio para ejecutar tareas de mantenimiento y consultar el estado de bases de datos SQL Server usando parámetros dinámicos. Permite despliegue en Docker, migración desde scripts batch, troubleshooting y configuración multiplataforma.

---

## Características
- Parámetros dinámicos por solicitud (sin variables de entorno)
- Ejecución asincrónica multihilo
- Health checks integrados
- Seguridad con Helmet y CORS
- Dockerización y escalabilidad

---

## Instalación y Configuración
- Node.js >= 18, npm >= 9, Docker, SQL Server 2019+
- Clona el proyecto, instala dependencias y configura `.env`
- Para Windows: usa Docker Desktop y edita `.env` según tu entorno

---

## Uso del Endpoint
`POST /api/maintenance/status`

Ejemplo:
```bash
curl -X POST http://localhost:3000/api/maintenance/status \
  -H "Content-Type: application/json" \
  -d '{
    "serverIp": "192.168.25.10",
    "port": 1433,
    "username": "Sa",
    "password": "Sa123456",
    "database": "RP207"
  }'
```

Respuesta:
```json
{
  "success": true,
  "data": [
    {
      "DbId": 5,
      "DatabaseName": "RP207",
      "TotalSizeMb": 91.25,
      "State": "ONLINE",
      "RecoveryModel": "FULL"
    }
  ],
  "serverInfo": {
    "ip": "192.168.25.10",
    "port": 1433,
    "database": "RP207"
  }
}
```

---

## Dockerización
- Construye la imagen:
  ```bash
  docker build -t database-maintenance-service .
  ```
- Ejecuta el contenedor:
  ```bash
  docker run -p 3000:3000 database-maintenance-service
  ```
- Usa docker-compose para producción y escalabilidad

---

## Migración
- Antes: scripts batch por servidor
- Ahora: API REST con parámetros dinámicos

---

## Troubleshooting
- Verifica IP, puerto, credenciales y logs
- Usa health-check.sh para diagnóstico
- Ajusta timeouts y pool de conexiones en `.env` o `docker-compose.yml`

---

## Producción
- Variables de entorno en `.env.production`
- Nginx como reverse proxy (opcional)
- Health checks, monitoreo y backups

---

## Cambios
- Parámetros dinámicos para consultar el estado de la base de datos
- Dockerización
- Mejoras de seguridad, performance y validación

---

Solo se requiere la opción de parámetros dinámicos para consultar el estado de la base de datos.
