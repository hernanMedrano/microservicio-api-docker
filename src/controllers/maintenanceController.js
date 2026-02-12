const databaseService = require('../services/databaseService');
const logger = require('../utils/logger');
const Joi = require('joi');
const { getAllServers } = require('../../config/servers');

// Esquemas de validación

// Para usar servidor predefinido por ID
const maintenanceByIdSchema = Joi.object({
  serverId: Joi.number().min(1).max(35).required(),
  storedProcedures: Joi.array()
    .items(Joi.string().min(1).max(255))
    .optional()
});

// Para enviar parámetros dinámicos
const maintenanceDynamicSchema = Joi.object({
  serverIp: Joi.string().ip().required(),
  port: Joi.number().min(1).max(65535).optional().default(1433),
  username: Joi.string().min(1).max(128).required(),
  password: Joi.string().min(1).max(255).required(),
  database: Joi.string().alphanum().max(128).required(),
  trueCertificate: Joi.boolean().optional().default(false),
  encrypt: Joi.boolean().optional().default(false),
  timeout: Joi.number().min(1000).optional().default(900000),
  storedProcedures: Joi.array()
    .items(Joi.string().min(1).max(255))
    .optional()
});

// Schema que acepta ambas formas
const maintenanceSchema = Joi.alternatives().try(
  maintenanceByIdSchema,
  maintenanceDynamicSchema
);

// Para obtener status
const databaseStatusByIdSchema = Joi.object({
  serverId: Joi.number().min(1).max(35).required()
});

const databaseStatusDynamicSchema = Joi.object({
  serverIp: Joi.string().ip().required(),
  port: Joi.number().min(1).max(65535).optional().default(1433),
  username: Joi.string().min(1).max(128).required(),
  password: Joi.string().min(1).max(255).required(),
  database: Joi.string().alphanum().max(128).required()
});

const databaseStatusSchema = Joi.alternatives().try(
  databaseStatusByIdSchema,
  databaseStatusDynamicSchema
);

class MaintenanceController {
  /**
   * Ejecuta el mantenimiento de base de datos con parámetros dinámicos
   * POST /api/maintenance/execute
   */
  async executeMaintenance(req, res, next) {
    try {
      logger.info('Request recibido en executeMaintenance', {
        ip: req.ip,
        body: req.body
      });

      // Validar entrada
      const { error, value } = maintenanceSchema.validate(req.body, {
        abortEarly: false
      });

      if (error) {
        logger.warn('Validación fallida en executeMaintenance', {
          errors: error.details
        });

        return res.status(400).json({
          success: false,
          message: 'Datos inválidos',
          errors: error.details.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }

      // Ejecutar mantenimiento (proceso asincrónico)
      const result = await databaseService.executeMaintenance(value);

      const statusCode = result.success ? 200 : 500;
      return res.status(statusCode).json(result);

    } catch (error) {
      logger.error('Error no controlado en executeMaintenance', {
        error: error.message,
        stack: error.stack
      });
      next(error);
    }
  }

  /**
   * Obtiene el estado de la base de datos
   * GET /api/maintenance/status
   * POST /api/maintenance/status (con parámetros en body)
   */
  async getDatabaseStatus(req, res, next) {
    try {
      const params = req.method === 'POST' ? req.body : req.query;

      logger.info('Request recibido en getDatabaseStatus', {
        params
      });

      // Validar entrada
      const { error, value } = databaseStatusSchema.validate(params, {
        abortEarly: false
      });

      if (error) {
        logger.warn('Validación fallida en getDatabaseStatus', {
          errors: error.details
        });

        return res.status(400).json({
          success: false,
          message: 'Datos inválidos',
          errors: error.details.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }

      const result = await databaseService.getDatabaseStatus(value);

      const statusCode = result.success ? 200 : 500;
      return res.status(statusCode).json(result);

    } catch (error) {
      logger.error('Error no controlado en getDatabaseStatus', {
        error: error.message,
        stack: error.stack
      });
      next(error);
    }
  }

  /**
   * Obtiene la lista de todos los servidores disponibles
   * GET /api/maintenance/servers
   */
  getAvailableServers(req, res) {
    try {
      const servers = getAllServers();
      
      return res.status(200).json({
        success: true,
        total: servers.length,
        servers: servers.map(s => ({
          id: s.id,
          name: s.name,
          serverIp: s.serverIp,
          port: s.port,
          database: s.database
        }))
      });
    } catch (error) {
      logger.error('Error obteniendo servidores', {
        error: error.message
      });

      return res.status(500).json({
        success: false,
        message: 'Error obteniendo servidores'
      });
    }
  }

  /**
   * Health check del servicio
   * GET /api/health
   */
  healthCheck(req, res) {
    return res.status(200).json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'database-maintenance-service'
    });
  }

  /**
   * Obtiene información del servicio
   * GET /api/info
   */
  getServiceInfo(req, res) {
    return res.status(200).json({
      success: true,
      service: 'database-maintenance-service',
      version: '2.0.0',
      description: 'Microservicio para tareas de mantenimiento de base de datos con soporte dinámico para múltiples servidores',
      features: [
        'Soporte para 35+ servidores SQL Server',
        'Parámetros dinámicos por solicitud',
        'Ejecución asincrónica de stored procedures',
        'Logging completo',
        'Validación de entrada robusta'
      ],
      endpoints: {
        health: {
          method: 'GET',
          path: '/api/health',
          description: 'Verificar estado del servicio'
        },
        info: {
          method: 'GET',
          path: '/api/info',
          description: 'Obtener información del servicio'
        },
        servers: {
          method: 'GET',
          path: '/api/maintenance/servers',
          description: 'Listar todos los servidores disponibles'
        },
        executeMaintenance: {
          method: 'POST',
          path: '/api/maintenance/execute',
          description: 'Ejecutar mantenimiento de base de datos',
          examples: {
            usingServerId: {
              description: 'Usar servidor predefinido por ID',
              body: {
                serverId: 1,
                storedProcedures: [
                  'dbo.sp_depuracion_paquetes_pos',
                  'dbo.sp_mantenimiento_log_bd',
                  'dbo.sp_mantenimiento_indices',
                  'dbo.sp_actualizar_estadisticas'
                ]
              }
            },
            usingDynamicParams: {
              description: 'Usar parámetros dinámicos',
              body: {
                serverIp: '192.168.25.10',
                port: 1433,
                username: 'Sa',
                password: 'Sa123456',
                database: 'RP207',
                trueCertificate: false,
                encrypt: false,
                storedProcedures: [
                  'dbo.sp_depuracion_paquetes_pos'
                ]
              }
            }
          }
        },
        databaseStatus: {
          method: 'GET or POST',
          path: '/api/maintenance/status',
          description: 'Obtener estado de base de datos',
          examples: {
            getWithQueryParams: {
              description: 'GET con query parameters',
              path: '/api/maintenance/status?serverId=1'
            },
            postWithBody: {
              description: 'POST con body',
              body: {
                serverId: 1
              }
            },
            postDynamic: {
              description: 'POST con parámetros dinámicos',
              body: {
                serverIp: '192.168.25.10',
                port: 1433,
                username: 'Sa',
                password: 'Sa123456',
                database: 'RP207'
              }
            }
          }
        }
      }
    });
  }
}

module.exports = new MaintenanceController();
