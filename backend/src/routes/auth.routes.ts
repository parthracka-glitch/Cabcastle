import { Router } from 'express';
import multer from 'multer';
import {
  getCurrentUser,
  getCurrentAdmin,
  authRateLimiter,
} from '../middlewares/security.middleware.js';
import * as authController from '../controllers/auth.controller.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
});

export const authRouter = Router();

// Public Authentication & Password Recovery Routes (Rate-Limited)
authRouter.post('/auth/register', authRateLimiter, authController.register);
authRouter.post('/auth/login', authRateLimiter, authController.login);
authRouter.post('/auth/google', authRateLimiter, authController.googleAuth);
authRouter.post('/auth/forgot-password', authRateLimiter, authController.forgotPassword);
authRouter.post('/auth/reset-password', authRateLimiter, authController.resetPassword);

// Customer Account Protected Routes
authRouter.get('/auth/me', getCurrentUser, authController.getCurrentUserHandler);
authRouter.put('/auth/profile', getCurrentUser, authController.updateProfile);
authRouter.post('/auth/change-password', getCurrentUser, authController.changeCustomerPassword);
authRouter.post('/auth/upload-photo', getCurrentUser, upload.single('file'), authController.uploadPhoto);
authRouter.post('/auth/upload-document', getCurrentUser, upload.single('file'), authController.uploadDocument);
authRouter.post('/auth/logout', authController.logout);

// Admin Console Protected Routes
authRouter.get('/admin/settings', getCurrentAdmin, authController.getAdminSettings);
authRouter.put('/admin/settings', getCurrentAdmin, authController.updateAdminSettings);
authRouter.post('/admin/change-password', getCurrentAdmin, authController.changeAdminPassword);
authRouter.post('/admin/upload-photo', getCurrentAdmin, upload.single('file'), authController.uploadPhoto);
