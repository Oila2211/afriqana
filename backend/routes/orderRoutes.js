// import express from 'express';
// const router = express.Router();
// import { 
//     calculateDelivery,
//     getMyOrders,
//     addOrderItems,
//     getOrders,
//     getOrderById,
//     updateOrderToPaid,
//     updateOrderToDelivered,
//     createStripePaymentIntent,
// } from "../controllers/orderController.js";
// import { protect, admin } from "../middleware/authMiddleware.js";


// // remember all these re connected to '/api/orders/'
// router.post('/calculate-delivery', protect, calculateDelivery);
// router.route('/').post(protect, addOrderItems).get(protect, admin, getOrders);
// router.route('/myorders').get(protect, getMyOrders);
// router.route('/:id').get(protect, getOrderById);
// router.route('/config/stripe').post(protect, createStripePaymentIntent);
// router.route('/:id/pay').put(protect, updateOrderToPaid);
// router.route('/:id/deliver').put(protect, admin, updateOrderToDelivered);



// export default router;




import express from 'express';
const router = express.Router();
import { 
    getMyOrders,
    addOrderItems,
    getOrders,
    getOrderById,
    updateOrderToPaid,
    updateOrderToDelivered,
    createStripePaymentIntent,
} from "../controllers/orderController.js";
import { protect, admin } from "../middleware/authMiddleware.js";


// remember all these re connected to '/api/orders/'
router.route('/').post(protect, addOrderItems).get(protect, admin, getOrders);
router.route('/myorders').get(protect, getMyOrders);
router.route('/:id').get(protect, getOrderById);
router.route('/config/stripe').post(protect, createStripePaymentIntent);
router.route('/:id/pay').put(protect, updateOrderToPaid);
router.route('/:id/deliver').put(protect, admin, updateOrderToDelivered);



export default router;