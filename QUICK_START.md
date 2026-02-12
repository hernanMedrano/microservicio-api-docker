// Archivo eliminado. Documentación consolidada en DOCUMENTACION.md

## ⚡ Inicio en 5 minutos

### Requisitos mínimos
- Node.js 18+ o Docker
- SQL Server accesible
- Puerto 3000 disponible

### Opción 1: Local (Node.js)

```bash
# 1. Instalar dependencias
NODE_ENV=development
PORT=3000
LOG_LEVEL=info

# ⬇️ EDITAR CON TUS DATOS DE SQL SERVER ⬇️
DB_SERVER=192.168.1.100      # IP o nombre del servidor
DB_PORT=1433                  # Puerto (por defecto 1433)
DB_USER=sa                    # Usuario
DB_PASSWORD=TuPassword123!    # Contraseña
DB_NAME=TuBaseDatos          # Base de datos

# Configuración avanzada (normalmente dejar como está)
DB_ENCRYPT=true
TRUST_SERVER_CERTIFICATE=false
DB_CONNECT_TIMEOUT=30000
DB_REQUEST_TIMEOUT=900000
CORS_ORIGIN=*
SERVICE_PORT=3000
```

---

## 🧪 Probar el Servicio

### Health Check (Simple)
```bash
curl http://localhost:3000/api/health
```

### Ejecutar Mantenimiento (Principal)
```bash
curl -X POST http://localhost:3000/api/maintenance/execute \
  -H "Content-Type: application/json" \
  -d '{
    "serverIp": "192.168.1.100",
    "databaseName": "TuBaseDatos"
  }'
```

### Con PowerShell (Windows)
```powershell
$body = @{
    serverIp = "192.168.1.100"
    databaseName = "TuBaseDatos"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:3000/api/maintenance/execute `
    -Method POST `
    -ContentType "application/json" `
    -Body $body | Select-Object -ExpandProperty Content
```

---

## 📂 Estructura del Proyecto

```
database-maintenance-service/
├── src/                          # Código fuente
│   ├── controllers/              # Controladores (rutas)
│   ├── services/                 # Lógica de negocios
│   ├── routes/                   # Definición de rutas
│   ├── middleware/               # Middlewares
│   └── utils/                    # Utilidades (logs)
├── config/                       # Configuración
│   └── database.js              # Conexión a BD
├── logs/                         # Logs (se crean automáticamente)
├── app.js                        # Punto de entrada
├── package.json                  # Dependencias
├── Dockerfile                    # Imagen Docker
├── docker-compose.yml            # Orquestación
├── .env.example                  # Plantilla de variables
├── .env                          # ⬅️ EDITAR ESTO
├── README.md                     # Documentación completa
├── WINDOWS_SETUP.md              # Guía Windows
├── PRODUCTION_DEPLOYMENT.md      # Despliegue en producción
└── TROUBLESHOOTING.md            # Solución de problemas
```

---

## 🔧 Comandos Útiles

### Desarrollo

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo (con reload automático)
npm run dev

# Ejecutar normalmente
npm start

# Ver logs
docker-compose logs -f
```

### Docker

```bash
# Construir imagen
docker-compose build

# Iniciar servicio
docker-compose up -d

# Ver estado
docker-compose ps

# Ver logs
docker-compose logs -f

# Detener
docker-compose down

# Recrear desde cero
docker-compose down -v && docker-compose build --no-cache && docker-compose up -d
```

### Testing

```bash
# Ejecutar pruebas
npm test

# Ver cobertura
npm test -- --coverage
```

---

## ✅ Checklist de Verificación

- [ ] ¿SQL Server está iniciado y accesible?
- [ ] ¿Credenciales en .env son correctas?
- [ ] ¿Puerto 1433 está abierto (si es remoto)?
- [ ] ¿Puerto 3000 está disponible?
- [ ] ¿npm/node instalados? (`node -v`, `npm -v`)
- [ ] ¿Docker instalado? (`docker -v`, `docker-compose -v`)

---

## 🆘 Problemas Rápidos

| Problema | Solución |
|----------|----------|
| `ECONNREFUSED 127.0.0.1:1433` | Cambiar `DB_SERVER` a `host.docker.internal` en Windows/Mac |
| `Login failed for user` | Verificar `DB_USER` y `DB_PASSWORD` en .env |
| `Cannot find module` | Ejecutar `npm install` |
| `Port 3000 already in use` | Cambiar `SERVICE_PORT=3001` en .env |
| `ETIMEDOUT` | Verificar conectividad: `ping 192.168.1.100` |

Ver [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) para más detalles.

---

## 📚 Documentación

- **[README.md](./README.md)** - Documentación completa
- **[WINDOWS_SETUP.md](./WINDOWS_SETUP.md)** - Instalación en Windows
- **[PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md)** - Despliegue en producción
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Solución de problemas
- **[examples.js](./examples.js)** - Ejemplos en múltiples lenguajes

---

## 🌐 Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/health` | Verificar estado del servicio |
| `GET` | `/api/info` | Información del servicio |
| `POST` | `/api/maintenance/execute` | Ejecutar mantenimiento de BD |
| `GET` | `/api/maintenance/status/:db` | Obtener estado de BD |

---

## 📞 Contacto y Soporte

En caso de problemas:

1. Revisar [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
2. Verificar los logs: `docker-compose logs database-maintenance-service`
3. Ejecutar diagnóstico: `./health-check.sh` (si está disponible)
4. Revisar README.md para documentación completa

---

**¡Listo para usar! 🎉**

El servicio estará disponible en `http://localhost:3000/api/health`
