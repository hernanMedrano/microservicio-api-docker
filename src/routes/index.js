const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');
const { asyncHandler } = require('../middleware/errorHandler');

// Health check
router.get('/health', maintenanceController.healthCheck.bind(maintenanceController));

// Info del servicio
router.get('/info', maintenanceController.getServiceInfo.bind(maintenanceController));

// Listar servidores disponibles
router.get('/maintenance/servers', maintenanceController.getAvailableServers.bind(maintenanceController));

// Ejecutar mantenimiento con parámetros dinámicos
router.post(
  '/maintenance/execute',
  asyncHandler(maintenanceController.executeMaintenance.bind(maintenanceController))
);

// Obtener estado de la base de datos (GET con query params o POST con body)
router.get(
  '/maintenance/status',
  asyncHandler(maintenanceController.getDatabaseStatus.bind(maintenanceController))
);

router.post(
  '/maintenance/status',
  asyncHandler(maintenanceController.getDatabaseStatus.bind(maintenanceController))
);

module.exports = router;
