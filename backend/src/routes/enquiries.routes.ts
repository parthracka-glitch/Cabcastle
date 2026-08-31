import { Router } from 'express';
import { getCurrentAdmin } from '../middlewares/security.middleware.js';
import * as enquiryController from '../controllers/enquiry.controller.js';

export const enquiriesRouter = Router();

enquiriesRouter.get('/admin/enquiries', getCurrentAdmin, enquiryController.listEnquiries);
enquiriesRouter.post('/admin/enquiries', getCurrentAdmin, enquiryController.createEnquiry);
enquiriesRouter.patch('/admin/enquiries/:enquiry_id/status', getCurrentAdmin, enquiryController.updateEnquiryStatus);
enquiriesRouter.delete('/admin/enquiries/:enquiry_id', getCurrentAdmin, enquiryController.deleteEnquiry);
enquiriesRouter.get('/admin/export/enquiries/excel', getCurrentAdmin, enquiryController.exportEnquiriesExcel);
