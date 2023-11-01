import express from 'express';
const router = express.Router();
import { 
    createCoupon,
    listCoupons,
    getCouponById,
    updateCoupon,
    deleteCoupon,
    redeemCoupon
 } from '../controllers/couponController.js';
import { protect, admin } from "../middleware/authMiddleware.js";


// remember all these re connected to '/api/coupon/'

// Create and List coupons routes
router.route('/')
  .post(protect,admin, createCoupon)
  .get(protect, admin, listCoupons);

 // Update, Delete (Deactivate) coupon by its ID 
router.route('/:id')
  .get(protect,admin, getCouponById)
  .put(protect,admin, updateCoupon)
  .delete(protect, admin, deleteCoupon);

// Redeem a coupon
router.route('/redeem')
  .post(protect, redeemCoupon)


  
export default router;
