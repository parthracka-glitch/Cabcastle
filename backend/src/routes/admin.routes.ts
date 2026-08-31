import { Router } from 'express';
import { getCurrentAdmin } from '../middlewares/security.middleware.js';
import * as adminController from '../controllers/admin.controller.js';

export const adminRouter = Router();

adminRouter.get('/admin/analytics', getCurrentAdmin, adminController.getAnalytics);
adminRouter.get('/admin/export/excel', getCurrentAdmin, adminController.exportBookingsExcel);
adminRouter.get('/admin/export/pdf', getCurrentAdmin, adminController.exportBookingsPdf);
adminRouter.get('/admin/export/bookings/pdf', getCurrentAdmin, adminController.exportBookingsPdf);

