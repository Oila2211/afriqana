

import mongoose from "mongoose";
import asyncHandler from "../middleware/asyncHandler.js";
import Order from "../models/orderModels.js";
import User from "../models/userModel.js";
import Coupon from "../models/couponModel.js";
import Region from "../models/regionModels.js";
import Stripe from "stripe";

console.log("Mongoose is:", mongoose)

// @desc Create new orders
// @route POST /api/orders
// @access Private
const addOrderItems = asyncHandler(async (req, res) => {
    try {
        console.log("Order data received in controller:", req.body);

        const { orderItems, deliveryAddress, phoneNumber, paymentMethod, itemsPrice, taxPrice, totalPrice } = req.body;

        if (!orderItems || orderItems.length === 0) {
            res.status(400).json({ error: 'No order items' });
            throw new Error('No order items');
        }

        const { longitude, latitude } = deliveryAddress;
        console.log("Longitude and latitude:", longitude, latitude );

        const region = await Region.aggregate([
            {
                $geoNear: {
                    near: { type: "Point", coordinates: [longitude, latitude] },
                    distanceField: "distanceToCenter",
                    maxDistance: 25000,
                    spherical: true,
                },
            },
            { $limit: 1 }, 
        ]);

        if (!region.length) {
            res.status(400).json({ error: 'Delivery not available for this location' });
            throw new Error('Delivery not available for this location');
        }

        const selectedRegion = region[0];

        let deliveryPrice = selectedRegion.baseDeliveryPrice;

        // Calculate the distance to the delivery location (in meters)
        const distanceToCenter = selectedRegion.distanceToCenter;


        if (distanceToCenter > selectedRegion.maxDistance) {
            const extraDistance = distanceToCenter - selectedRegion.maxDistance; // Extra distance in meters

            const extraCharge = ( extraDistance / 1000 ) * selectedRegion.extraChargePerKm; // Convert to km

            deliveryPrice += extraCharge;
        } else {
            console.log (" No extra charge applied. Distance is within the max distance.")
        }


        // Round the deliveryPrice to two decimal places
        deliveryPrice = parseFloat(deliveryPrice.toFixed(2));


        const calculatedTotalPrice = (
            Number(itemsPrice) +
            Number(taxPrice) +
            Number(deliveryPrice)
        ).toFixed(2);

        const order = new Order({
            orderItems: orderItems.map((x) => ({
                ...x,
                product: x._id,
                _id: undefined
            })),
            user: req.user._id,
            deliveryAddress,
            phoneNumber,
            paymentMethod,
            itemsPrice,
            taxPrice,
            deliveryPrice,
            totalPrice: calculatedTotalPrice,
        });

        console.log("Order to be created:", {
            orderItems, 
            user: req.user._id,
            deliveryAddress,
            phoneNumber,
            paymentMethod,
            itemsPrice,
            taxPrice,
            deliveryPrice,
            totalPrice: calculatedTotalPrice
        });
        

        const createdOrder = await order.save();

        const potentialQanaPoints = calculatedTotalPrice;
        res.status(201).json({ createdOrder, potentialQanaPoints });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
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
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    // // Validate the orderId format
    
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





const updateOrderToPaid = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    const { id, status, update_time, email_address, couponCode } = req.body;

    console.log("Request body:", req.body);

    if (!id || !status || !update_time || !email_address) {
        return res.status(400).send('Missing required fields in request body.');
    }

    if (order) {
        console.log("Order found:", order);

        if (!couponCode) {
            console.log("couponCode is not present or is null.");
        } else {
            console.log("couponCode is present:", couponCode);

            const coupon = await Coupon.findOne({ code: couponCode });
            if (!coupon) {
                console.log("No coupon found with code:", couponCode);
            } else {
                console.log("Coupon found:", coupon);
                const userIdString = order.user.toString();
                console.log("Checking if user:", userIdString, "has already redeemed this coupon.");
                if (!coupon.usersRedeemed.some(userId => userId.toString() === userIdString)) {
                    console.log("User has not redeemed this coupon yet. Adding user to usersRedeemed.");
                    coupon.usersRedeemed.push(order.user);
                    await coupon.save();
                    console.log("Updated coupon after adding user:", coupon);
                } else {
                    console.log("User has already redeemed this coupon.");
                }
            }
        }

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

            const user = await User.findById(order.user);
            if (user) {
                if (order.redeemedPoints) {
                    user.qanaPoints = user.qanaPoints - order.redeemedPoints;
                }
                user.qanaPoints = user.qanaPoints + order.totalPrice;
                await user.save();
                console.log("my qana points:", user.qanaPoints);
            }

            const updatedOrder = await Order.findById(req.params.id);
            if (updatedOrder) {
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
        res.status(404).json({ error: 'Order not found' });
    }
});





// @desc Update order to delivered
// @route PUT /api/orders/:id/delivered
// @access Private/Admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        order.isDelivered = true;
        order.deliveredAt = Date.now();

        const updatedOrder = await order.save();
        res.status(200).json(updatedOrder);
    } else {
        res.status(404);
        throw new Error("Order not found");
    }
});


// @desc Get all orders
// @route GET /api/orders
// @access Private/Admin
const getOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({}).populate('user', 'id name');
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
    
};
