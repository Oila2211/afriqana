import asyncHandler from "../middleware/asyncHandler.js";
import Order from "../models/orderModels.js";
import Stripe from "stripe";
import generateToken from "../utils/generateToken.js";

// @desc Create new orders
// @route POST /api/orders
// @access Private
const addOrderItems = asyncHandler(async (req, res) => {
    const {
        orderItems,
        deliveryAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        deliveryPrice,
        totalPrice
    } = req.body;

    if (orderItems && orderItems.length === 0) {
        res.status(400);
        throw new Error ('No order items')
    } else {
        const order = new Order ({
            orderItems: orderItems.map((x) => ({
                ...x,
                product: x._id,
                _id: undefined
            })),
            user: req.user._id,
            deliveryAddress,
            paymentMethod,
            itemsPrice,
            taxPrice,
            deliveryPrice,
            totalPrice,
        });

        const createdOrder = await order.save();

        res.status(201).json(createdOrder)
    }
});


// @desc Get logged in user orders
// @route GET /api/orders/myorders
// @access Private
const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id });
    res.status(200).json(orders)
});


// @desc Get Order by ID
// @route GET /api/orders/:id
// @access Private
const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email')
    
    if (order) {
        res.status(200).json(order);
    } else {
        res.status(404);
        throw new Error('Order not found');
    };
});



// @desc Create Stripe Payment Intent
// @route POST /api/config/stripe
// @access Private
const createStripePaymentIntent = asyncHandler(async (req, res) => {
    // Step 1: Retrieve the most recent order for the user
    const order = await Order.findOne({ user: req.user._id }).sort({ createdAt: -1 });
    if (!order) {
        res.status(404);
        throw new Error('No recent orders found for this user');
    }

    // Step 2: Calculate the total amount from the retrieved order's items
    const totalAmount = order.orderItems.reduce((acc, item) => acc + (item.price * 100), 0); // Multiply by 100 to convert to cents

    // Step 3: Create the payment intent
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: totalAmount,
            currency: 'sek',
            automatic_payment_methods: { enabled: true },
            description: `Payment for order ${order._id}`,  // changed to use the actual order ID
            metadata: { order_id: order._id.toString() },
            receipt_email: req.user.email
        });

        res.status(200).send({
            clientSecret: paymentIntent.client_secret
        });
    } catch (error) {
        res.status(400).send({ error: `Stripe payment intent failed: ${error.message}` });
    }
});



// @desc Update order to paid
// @route PUT /api/orders/:id/pay
// @access Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    
    if (order) {
        try {
            // Use updateOne method for direct database update
            await Order.updateOne({ _id: req.params.id }, { $set: { 
                isPaid: true, 
                paidAt: Date.now(), 
                paymentResults: {
                    id: req.body.id,
                    status: req.body.status,
                    update_time: req.body.update_time,
                    email_address: req.body.email_address
                } 
            }});

            // Fetch the updated order to send as a response
            const updatedOrder = await Order.findById(req.params.id);
            res.status(200).json(updatedOrder);
        } catch (error) {
            res.status(500).send('Server Error');
        }
    } else {
        res.status(404);
    }
});



// // @desc Update order to delivered
// // @route PUT /api/orders/:id/delivered
// // @access Private
const updateOrderToDelivered = asyncHandler(async (req, res) => {
    res.send('update Order to delivered');
});



// @desc Create new orders
// @route POST /api/orders
// @access Private/Admin
const getOrders = asyncHandler(async (req, res) => {
    res.send('get all orders');
});


export {
    addOrderItems,
    getOrders,
    getMyOrders,
    getOrderById,
    createStripePaymentIntent,
    updateOrderToPaid,
    updateOrderToDelivered,
}
