import { Router } from 'express';
import { getCurrentAdmin } from '../middlewares/security.middleware.js';
import * as vehicleController from '../controllers/vehicle.controller.js';

export const vehiclesRouter = Router();

vehiclesRouter.get('/vehicles', vehicleController.listVehicles);
vehiclesRouter.get('/vehicles/:vehicle_id', vehicleController.getVehicleById);

// Admin Vehicle Management Routes (supports both /admin/vehicles and /vehicles endpoints)
vehiclesRouter.post('/admin/vehicles', getCurrentAdmin, vehicleController.createVehicle);
vehiclesRouter.put('/admin/vehicles/:vehicle_id', getCurrentAdmin, vehicleController.updateVehicle);
vehiclesRouter.patch('/admin/vehicles/:vehicle_id', getCurrentAdmin, vehicleController.updateVehicle);
vehiclesRouter.delete('/admin/vehicles/:vehicle_id', getCurrentAdmin, vehicleController.deleteVehicle);

vehiclesRouter.post('/vehicles', getCurrentAdmin, vehicleController.createVehicle);
vehiclesRouter.put('/vehicles/:vehicle_id', getCurrentAdmin, vehicleController.updateVehicle);
vehiclesRouter.patch('/vehicles/:vehicle_id', getCurrentAdmin, vehicleController.updateVehicle);
vehiclesRouter.delete('/vehicles/:vehicle_id', getCurrentAdmin, vehicleController.deleteVehicle);
