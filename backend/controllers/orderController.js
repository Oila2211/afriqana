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

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// @desc Generate Stripe Payment Intent
// @route POST /api/config/stripe
// @access Private
const generateStripeToken  = asyncHandler(async (req, res) => {
    const paymentIntent = await stripe.paymentIntents.create({
        amount: req.body.amount, // Amount should be in cents
        currency: 'sek', 
    });

    res.status(200).send({
        clientSecret: paymentIntent.client_secret
    })
})


// @desc Send Stripe API Key
// @route GET /api/config/stripe/key
// @access Private
const sendStripeAPIKey = asyncHandler(async (req, res) => {
    console.log("STRIPE_PUBLIC_KEY:", process.env.STRIPE_PUBLIC_KEY);

    res.status(200).send({
        stripeAPIKey: process.env.STRIPE_PUBLIC_KEY
        // stripeAPIKey: ""
    });
});


// @desc Update order to paid
// @route PUT /api/orders/:id/pay
// @access Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
    
    if (order) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
            id: req.body.id,
            status: req.body.status,
            update_time: req.body.update_time,
            email_address: req.body.payer.email_address
        };
        const updatedOrder = await order.save();

        res.status(200).json(updatedOrder)
    } else {
        res.status(404);
        throw new Error("Order not Found")
    }
});

// @desc Update order to delivered
// @route PUT /api/orders/:id/delivered
// @access Private
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
    updateOrderToPaid,
    updateOrderToDelivered,
    generateStripeToken,
    sendStripeAPIKey
}

