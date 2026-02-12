scrape_configs:
echo "❌ Service is down"
echo "Backup completado: logs_$DATE.tar.gz"
on:
jobs:
## Guía rápida para probar y dockerizar

### 1. Probar la aplicación localmente

```bash
# Instalar dependencias
npm install

# Iniciar el servidor
npm start

# Probar el endpoint
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

### 2. Dockerizar la aplicación

```bash
# Construir la imagen
docker build -t database-maintenance-service .

# Ejecutar el contenedor
docker run -p 3000:3000 database-maintenance-service
```

### 3. (Opcional) Usar docker-compose

```bash
docker-compose up -d
```

---

Solo se requiere la opción de parámetros dinámicos para consultar el estado de la base de datos.
```
