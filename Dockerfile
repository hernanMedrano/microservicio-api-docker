# Etapa 1: Build (Construcción)
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias de producción y desarrollo (para build si es necesario)
RUN npm ci --only=production && \
    npm cache clean --force

# Etapa 2: Runtime (Ejecución)
FROM node:18-alpine

WORKDIR /app

# Instalar dumb-init para manejo de señales
RUN apk add --no-cache dumb-init

# Crear usuario no-root para mayor seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copiar solo node_modules y archivos necesarios de la etapa anterior
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copiar el código fuente
COPY --chown=nodejs:nodejs . .

# Crear directorio de logs
RUN mkdir -p /app/logs && \
    chown -R nodejs:nodejs /app/logs

# Cambiar a usuario no-root
USER nodejs

# Exponer puerto
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Usar dumb-init para reemplazar PID 1
ENTRYPOINT ["dumb-init", "--"]

# Comando por defecto
CMD ["npm", "start"]
