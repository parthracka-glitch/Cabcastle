import { Router } from 'express';
import { getCurrentAdmin } from '../middlewares/security.middleware.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { ValidateCouponSchema, CreateCouponSchema } from '../schemas/index.js';
import * as couponController from '../controllers/coupon.controller.js';

export const couponsRouter = Router();

couponsRouter.post('/coupons/validate', validateBody(ValidateCouponSchema), couponController.validateCoupon);
couponsRouter.get('/coupons/public', couponController.listPublicCoupons);
couponsRouter.get('/admin/coupons', getCurrentAdmin, couponController.listCoupons);
couponsRouter.post('/admin/coupons', getCurrentAdmin, validateBody(CreateCouponSchema), couponController.createCoupon);
couponsRouter.put('/admin/coupons/:coupon_id', getCurrentAdmin, couponController.updateCoupon);
couponsRouter.delete('/admin/coupons/:coupon_id', getCurrentAdmin, couponController.deleteCoupon);
