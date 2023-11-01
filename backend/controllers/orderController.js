import asyncHandler from "../middleware/asyncHandler.js";
import Order from "../models/orderModels.js";
import User from "../models/userModel.js";
import Stripe from "stripe";

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
        res.status(400).json({ error: 'No order items'});
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

        // Calculate Qana points based on totalPrice (1 Qana for every 1 SEK)
        const potentialQanaPoints = totalPrice;

        res.status(201).json({createdOrder, potentialQanaPoints})
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
            payment_method_types:['card', 'klarna'],
            description: `Payment for order ${order._id}`,  // changed to use the actual order ID
            metadata: { order_id: order._id.toString() },
            // receipt_email: req.user.email
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
    const { id, status, update_time, email_address } = req.body;
    if (!id || !status || !update_time || !email_address) {
        return res.status(400).send('Missing required fields in request body.');
    }

    
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

            // Fetch the user associated with the order
            const user = await User.findById(order.user);
            

            if (user ) {
                // Deducting redeeemed Qana points if any
                if(order.redeemedPoints) {
                    user.qanaPoints = user.qanaPoints - order.redeemedPoints;
                }

                //Add the Qana points based on the order's totalPrice
                user.qanaPoints = user.qanaPoints + order.totalPrice;
                await user.save();
                console.log("my qana points:", user.qanaPoints)
            }

            console.log(user)
            

            // Fetch the updated order to send as a response
            const updatedOrder = await Order.findById(req.params.id);
            if(updatedOrder) {
                res.status(200).json({
                  updatedOrder: updatedOrder,
                  updatedUser: user,
                });
            } else {
                res.status(500).send('Failed to fetch updated order');
            }
        } catch (error) {
            console.error(`Error in updating order ${req.params.id} to paid:`, error.message);
            res.status(500).send('Server Error');
        }
    } else {
        res.status(404).json({ error: 'Order not found'});
    }
});



// // @desc Update order to delivered
// // @route PUT /api/orders/:id/delivered
// // @access Private/Admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        order.isDelivered = true;
        order.deliveredAt = Date.now();

        const updatedOrder = await order.save();
        res.status(200).json(updatedOrder)
    } else {
        res.status(404);
        throw new Error("Order not found")
    }
});



// @desc Get all orders
// @route GET /api/orders
// @access Private/Admin
const getOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({}).populate('user', 'id name') 
    res.status(200).json(orders);
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