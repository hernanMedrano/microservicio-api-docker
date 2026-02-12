const sql = require('mssql');
const logger = require('../src/utils/logger');

const config = {
  server: process.env.DB_SERVER,
  port: parseInt(process.env.DB_PORT || '1433'),
  authentication: {
    type: 'default',
    options: {
      userName: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    }
  },
  options: {
    database: process.env.DB_NAME,
    trustServerCertificate: process.env.TRUST_SERVER_CERTIFICATE === 'true',
    enableKeepAlive: true,
    keepAliveInitialDelayMs: 0,
    connectTimeout: parseInt(process.env.DB_CONNECT_TIMEOUT || '30000'),
    requestTimeout: parseInt(process.env.DB_REQUEST_TIMEOUT || '900000'), // 15 minutos
    encrypt: process.env.DB_ENCRYPT !== 'false'
  }
};

let pool = null;
let poolCreationPromise = null;

const createPool = async () => {
  if (pool) {
    return pool;
  }

  if (poolCreationPromise) {
    return poolCreationPromise;
  }

  poolCreationPromise = new Promise(async (resolve, reject) => {
    try {
      logger.info('Intentando conectar a SQL Server', {
        server: config.server,
        database: config.options.database,
        port: config.port
      });

      pool = new sql.ConnectionPool(config);
      
      await pool.connect();
      logger.info('Pool de conexiones SQL Server creado exitosamente');
      
      // Manejo de errores del pool
      pool.on('error', (err) => {
        logger.error('Error en el pool de conexiones', { error: err.message, stack: err.stack });
        pool = null;
        poolCreationPromise = null;
      });

      resolve(pool);
    } catch (error) {
      logger.error('Error al crear el pool de conexiones SQL Server', {
        error: error.message,
        stack: error.stack,
        server: config.server
      });
      pool = null;
      poolCreationPromise = null;
      reject(error);
    }
  });

  return poolCreationPromise;
};

const getPool = async () => {
  try {
    if (!pool) {
      await createPool();
    }
    return pool;
  } catch (error) {
    logger.error('Error obteniendo pool de conexiones', { error: error.message });
    throw error;
  }
};

const closePool = async () => {
  try {
    if (pool) {
      await pool.close();
      pool = null;
      poolCreationPromise = null;
      logger.info('Pool de conexiones SQL Server cerrado');
    }
  } catch (error) {
    logger.error('Error al cerrar el pool de conexiones', { error: error.message });
  }
};

module.exports = {
  getPool,
  closePool,
  sql
};
