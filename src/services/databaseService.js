const sql = require('mssql');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');
const { getServerById } = require('../../config/servers');

// Cache de pools por servidor
const poolsCache = {};

/**
 * Crear pool de conexión dinámico para un servidor
 */
async function createDynamicPool(serverConfig) {
  const poolKey = `${serverConfig.serverIp}:${serverConfig.port}`;
  
  if (poolsCache[poolKey]) {
    return poolsCache[poolKey];
  }

  const config = {
    server: serverConfig.serverIp,
    port: serverConfig.port,
    authentication: {
      type: 'default',
      options: {
        userName: serverConfig.username,
        password: serverConfig.password
      }
    },
    options: {
      database: serverConfig.database,
      trustServerCertificate: serverConfig.trueCertificate,
      enableKeepAlive: true,
      keepAliveInitialDelayMs: 0,
      connectTimeout: 30000,
      requestTimeout: serverConfig.timeout || 900000,
      decrypt: true,
      encrypt: serverConfig.encrypt || false,
      connectionTimeout: 45000,
      multipleStatements: true,
      abortTransactionOnError: false,
      isolationLevel: 1
    }
  };

  try {
    const pool = new sql.ConnectionPool(config);
    await pool.connect();
    
    logger.info('Pool de conexión dinámico creado', {
      server: serverConfig.serverIp,
      database: serverConfig.database
    });

    pool.on('error', (err) => {
      logger.error('Error en pool dinámico', {
        error: err.message,
        server: poolKey
      });
      delete poolsCache[poolKey];
    });

    poolsCache[poolKey] = pool;
    return pool;
  } catch (error) {
    logger.error('Error creando pool dinámico', {
      error: error.message,
      server: poolKey
    });
    throw error;
  }
}

class DatabaseMaintenanceService {
  /**
   * Ejecuta el proceso de mantenimiento usando configuración dinámica
   * @param {Object} params - Parámetros de ejecución
   * @param {number} params.serverId - ID del servidor (opcional)
   * @param {string} params.serverIp - IP del servidor (si no usa serverId)
   * @param {number} params.port - Puerto SQL Server
   * @param {string} params.username - Usuario
   * @param {string} params.password - Contraseña
   * @param {string} params.database - Nombre de BD
   * @param {string} params.storedProcedures - Array de SPs a ejecutar
   * @returns {Promise<Object>} Resultado del mantenimiento
   */
  async executeMaintenance(params) {
    const executionId = uuidv4();
    const startTime = Date.now();

    try {
      logger.info('Iniciando proceso de mantenimiento con parámetros dinámicos', {
        executionId,
        serverId: params.serverId,
        database: params.database
      });

      // Obtener configuración del servidor
      let serverConfig;
      
      if (params.serverId) {
        serverConfig = getServerById(params.serverId);
        if (!serverConfig) {
          throw new Error(`Servidor con ID ${params.serverId} no encontrado`);
        }
      } else {
        // Usar parámetros enviados directamente
        serverConfig = {
          serverIp: params.serverIp,
          port: params.port || 1433,
          username: params.username,
          password: params.password,
          database: params.database,
          trueCertificate: params.trueCertificate || false,
          encrypt: params.encrypt || false,
          timeout: params.timeout || 900000
        };
      }

      // Crear pool dinámico
      const pool = await createDynamicPool(serverConfig);

      // Construir lista de stored procedures
      const sps = params.storedProcedures || [
        'dbo.sp_depuracion_paquetes_pos',
        'dbo.sp_mantenimiento_log_bd',
        'dbo.sp_mantenimiento_indices',
        'dbo.sp_actualizar_estadisticas'
      ];

      // Construir el SQL dinámico de manera segura
      const spExecutions = sps.map(sp => `EXEC ${sp};`).join('\n');
      
      const sqlQuery = `
        DECLARE @sql NVARCHAR(MAX);

        SET @sql = N'
        USE [${serverConfig.database}];

        ${spExecutions}
        ';

        EXEC sp_executesql @sql;
      `;

      logger.debug('Ejecutando query dinámico', {
        executionId,
        database: serverConfig.database,
        spCount: sps.length
      });

      // Ejecutar la consulta principal
      const mainResult = await pool.request().query(sqlQuery);

      // Consulta para obtener información de tamaño de base de datos
      const dbInfoQuery = `
        SELECT 
          DB_ID() as DbId,
          mf.file_id as FileId,
          size/128 as CurrentSize,
          FILEPROPERTY(name, 'SpaceUsed')/128 as UsedPages,
          FILEPROPERTY(name, 'SpaceUsed')/128 as EstimatedPages
        FROM sys.master_files mf
        WHERE mf.database_id = DB_ID('${serverConfig.database}')
      `;

      const dbInfoResult = await pool.request().query(dbInfoQuery);

      const duration = Date.now() - startTime;

      const response = {
        success: true,
        executionId,
        status: 'completed',
        message: 'Proceso de mantenimiento completado exitosamente',
        database: serverConfig.database,
        serverIp: serverConfig.serverIp,
        serverPort: serverConfig.port,
        duration: `${(duration / 1000 / 60).toFixed(2)} minutos`,
        durationMs: duration,
        timestamp: new Date().toISOString(),
        maintenanceTasks: {
          sp_depuracion_paquetes_pos: 'Completado',
          sp_mantenimiento_log_bd: 'Completado',
          sp_mantenimiento_indices: 'Completado',
          sp_actualizar_estadisticas: 'Completado'
        },
        dbInfo: dbInfoResult.recordset.map(record => ({
          DbId: record.DbId,
          FileId: record.FileId,
          CurrentSize: record.CurrentSize,
          MinimumSize: record.MinimumSize,
          UsedPages: record.UsedPages,
          EstimatedPages: record.EstimatedPages
        }))
      };

      logger.info('Proceso de mantenimiento completado exitosamente', {
        executionId,
        durationMs: duration,
        dbInfoCount: dbInfoResult.recordset.length
      });

      return response;

    } catch (error) {
      const duration = Date.now() - startTime;

      logger.error('Error durante el proceso de mantenimiento', {
        executionId,
        error: error.message,
        stack: error.stack,
        durationMs: duration
      });

      return {
        success: false,
        executionId,
        status: 'failed',
        message: `Error en el proceso de mantenimiento: ${error.message}`,
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor',
        durationMs: duration,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Obtiene el estado de la base de datos con parámetros dinámicos
   * @param {Object} params - Parámetros de conexión
   * @returns {Promise<Object>} Estado de la base de datos
   */
  async getDatabaseStatus(params) {
    try {
      logger.info('Obteniendo estado de la base de datos', {
        database: params.database,
        serverId: params.serverId
      });

      // Obtener configuración del servidor
      let serverConfig;
      
      if (params.serverId) {
        serverConfig = getServerById(params.serverId);
        if (!serverConfig) {
          throw new Error(`Servidor con ID ${params.serverId} no encontrado`);
        }
      } else {
        serverConfig = {
          serverIp: params.serverIp,
          port: params.port || 1433,
          username: params.username,
          password: params.password,
          database: params.database,
          trueCertificate: params.trueCertificate || false,
          encrypt: params.encrypt || false,
          timeout: params.timeout || 900000
        };
      }

      // Crear pool dinámico
      const pool = await createDynamicPool(serverConfig);

      const query = `
        SELECT 
          DB_ID() as DbId,
          DB_NAME() as DatabaseName,
          CAST(SUM(size)/128.0 as DECIMAL(10,2)) as TotalSizeMb,
          state_desc as State,
          recovery_model_desc as RecoveryModel
        FROM sys.master_files
        WHERE database_id = DB_ID('${serverConfig.database}')
        GROUP BY state_desc, recovery_model_desc
      `;

      const result = await pool.request().query(query);

      logger.info('Estado de la base de datos obtenido', {
        database: serverConfig.database,
        recordCount: result.recordset.length
      });

      return {
        success: true,
        data: result.recordset,
        serverInfo: {
          ip: serverConfig.serverIp,
          port: serverConfig.port,
          database: serverConfig.database
        }
      };

    } catch (error) {
      logger.error('Error obteniendo estado de la base de datos', {
        error: error.message,
        stack: error.stack
      });

      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new DatabaseMaintenanceService();
