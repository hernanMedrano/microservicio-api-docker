const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
require('express-async-errors');
require('dotenv').config();

const logger = require('./src/utils/logger');
const { errorHandler, notFoundHandler } = require('./src/middleware/errorHandler');
const routes = require('./src/routes');
const { closePool } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de seguridad
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Middleware de parseo
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ limit: '10kb', extended: true }));

// Middleware de logging de solicitudes
app.use((req, res, next) => {
  logger.debug(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// Rutas
app.use('/api', routes);

// Manejo de rutas no encontradas
app.use(notFoundHandler);

// Manejador de errores global
app.use(errorHandler);

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', {
    promise: promise.toString(),
    reason: reason instanceof Error ? reason.message : reason
  });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', {
    error: error.message,
    stack: error.stack
  });
  process.exit(1);
});

// Iniciar servidor
const server = app.listen(PORT, () => {
  logger.info('Servidor iniciado', {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version
  });
});

// Graceful shutdown
const handleShutdown = async (signal) => {
  logger.info(`Señal ${signal} recibida, iniciando shutdown...`);
  
  server.close(async () => {
    try {
      await closePool();
      logger.info('Servidor cerrado correctamente');
      process.exit(0);
    } catch (error) {
      logger.error('Error durante el shutdown', { error: error.message });
      process.exit(1);
    }
  });

  // Forzar cierre después de 30 segundos
  setTimeout(() => {
    logger.error('Timeout durante el shutdown, forzando cierre');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

module.exports = app;
