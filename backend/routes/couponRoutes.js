import express from 'express';
const router = express.Router();
import { 
    createCoupon,
    listCoupons,
    getCouponById,
    updateCoupon,
    deleteCoupon,
    validateCoupon
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

// Apply or validate a coupon
router.route('/apply')
  .post(protect, validateCoupon)


  
export default router;
