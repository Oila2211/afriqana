// import asyncHandler from "../middleware/asyncHandler.js";
// import Order from "../models/orderModels.js";
// import User from "../models/userModel.js";
// import Coupon from "../models/couponModel.js";
// import calculateDeliveryPrice from "../utils/calculateDeliveryPrice.js";
// import Stripe from "stripe";



// // @desc Calculate delivery price
// // @route POST /api/orders/calculate-delivery
// // @access Public
// const calculateDelivery = asyncHandler(async (req, res) => {
//     const { deliveryAddress } = req.body;
//     const afriqanaAddress = "Björnkullavägen 12, Huddinge Sweden";

//     try {
//         const price = await calculateDeliveryPrice(deliveryAddress, afriqanaAddress);
//         res.json({ deliveryPrice: price });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// });



// // @desc Create new orders
// // @route POST /api/orders
// // @access Private
// const addOrderItems = asyncHandler(async (req, res) => {
//     const {
//         orderItems,
//         deliveryAddress,
//         phoneNumber,
//         paymentMethod,
//         itemsPrice,
//         taxPrice,
//         deliveryPrice,
//         totalPrice
//     } = req.body;

//     if (orderItems && orderItems.length === 0) {
//         res.status(400).json({ error: 'No order items'});
//         throw new Error ('No order items')
//     } else {
//         const order = new Order ({
//             orderItems: orderItems.map((x) => ({
//                 ...x,
//                 product: x._id,
//                 _id: undefined
//             })),
//             user: req.user._id,
//             deliveryAddress,
//             phoneNumber,
//             paymentMethod,
//             itemsPrice,
//             taxPrice,
//             deliveryPrice,
//             totalPrice,
//         });

//         const createdOrder = await order.save();

//         // Calculate Qana points based on totalPrice (1 Qana for every 1 SEK)
//         const potentialQanaPoints = totalPrice;

//         res.status(201).json({createdOrder, potentialQanaPoints})
//     }
// });


// // @desc Get logged in user orders
// // @route GET /api/orders/myorders
// // @access Private
// const getMyOrders = asyncHandler(async (req, res) => {
//     const orders = await Order.find({ user: req.user._id });
//     res.status(200).json(orders)
// });


// // @desc Get Order by ID
// // @route GET /api/orders/:id
// // @access Private
// const getOrderById = asyncHandler(async (req, res) => {
//     const order = await Order.findById(req.params.id).populate('user', 'name email')
    
//     if (order) {
//         res.status(200).json(order);
//     } else {
//         res.status(404);
//         throw new Error('Order not found');
//     };
// });



// // @desc Create Stripe Payment Intent
// // @route POST /api/config/stripe
// // @access Private
// const createStripePaymentIntent = asyncHandler(async (req, res) => {
//     // Step 1: Retrieve the most recent order for the user
//     const order = await Order.findOne({ user: req.user._id }).sort({ createdAt: -1 });
//     if (!order) {
//         res.status(404);
//         throw new Error('No recent orders found for this user');
//     }

//     // Step 2: Calculate the total amount from the retrieved order's items
//     const totalAmount = order.orderItems.reduce((acc, item) => acc + (item.price * 100), 0); // Multiply by 100 to convert to cents

//     // Step 3: Create the payment intent
//     const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
//     try {
//         const paymentIntent = await stripe.paymentIntents.create({
//             amount: totalAmount,
//             currency: 'sek',
//             payment_method_types:['card', 'klarna'],
//             description: `Payment for order ${order._id}`,  // changed to use the actual order ID
//             metadata: { order_id: order._id.toString() },
//             // receipt_email: req.user.email
//         });

//         res.status(200).send({
//             clientSecret: paymentIntent.client_secret
//         });
//     } catch (error) {
//         res.status(400).send({ error: `Stripe payment intent failed: ${error.message}` });
//     }
// });



// // @desc Update order to paid
// // @route PUT /api/orders/:id/pay
// // @access Private
// const updateOrderToPaid = asyncHandler(async (req, res) => {
//     const order = await Order.findById(req.params.id);
//     const { id, status, update_time, email_address } = req.body;
//     if (!id || !status || !update_time || !email_address) {
//         return res.status(400).send('Missing required fields in request body.');
//     }

    
//     if (order) {
//         const { couponCode } = req.body;

//         if (couponCode) {
//             const coupon = await Coupon.findOne({ code: couponCode});
//             if (coupon) {
//                 // Redeem the coupon for the user
//                 coupon.usersRedeemed.push(order.user);
//                 await coupon.save();
                
//             }
//         };
//         try {
//             // Use updateOne method for direct database update
//             await Order.updateOne({ _id: req.params.id }, { $set: { 
//                 isPaid: true, 
//                 paidAt: Date.now(), 
//                 paymentResults: {
//                     id: req.body.id,
//                     status: req.body.status,
//                     update_time: req.body.update_time,
//                     email_address: req.body.email_address
//                 } 
//             }});

//             // Fetch the user associated with the order
//             const user = await User.findById(order.user);
            

//             if (user ) {
//                 // Deducting redeeemed Qana points if any
//                 if(order.redeemedPoints) {
//                     user.qanaPoints = user.qanaPoints - order.redeemedPoints;
//                 }

//                 //Add the Qana points based on the order's totalPrice
//                 user.qanaPoints = user.qanaPoints + order.totalPrice;
//                 await user.save();
//                 console.log("my qana points:", user.qanaPoints)
//             }

//             console.log(user)
            

//             // Fetch the updated order to send as a response
//             const updatedOrder = await Order.findById(req.params.id);
//             if(updatedOrder) {
//                 res.status(200).json({
//                   updatedOrder: updatedOrder,
//                   updatedUser: user,
//                 });
//             } else {
//                 res.status(500).send('Failed to fetch updated order');
//             }
//         } catch (error) {
//             console.error(`Error in updating order ${req.params.id} to paid:`, error.message);
//             res.status(500).send('Server Error');
//         }
//     } else {
//         res.status(404).json({ error: 'Order not found'});
//     }
// });



// // // @desc Update order to delivered
// // // @route PUT /api/orders/:id/delivered
// // // @access Private/Admin
// const updateOrderToDelivered = asyncHandler(async (req, res) => {
//     const order = await Order.findById(req.params.id);

//     if (order) {
//         order.isDelivered = true;
//         order.deliveredAt = Date.now();

//         const updatedOrder = await order.save();
//         res.status(200).json(updatedOrder)
//     } else {
//         res.status(404);
//         throw new Error("Order not found")
//     }
// });



// // @desc Get all orders
// // @route GET /api/orders
// // @access Private/Admin
// const getOrders = asyncHandler(async (req, res) => {
//     const orders = await Order.find({}).populate('user', 'id name') 
//     res.status(200).json(orders);
// });


// export {
//     calculateDelivery,
//     addOrderItems,
//     getOrders,
//     getMyOrders,
//     getOrderById,
//     createStripePaymentIntent,
//     updateOrderToPaid,
//     updateOrderToDelivered,
// }



import mongoose from "mongoose";
import asyncHandler from "../middleware/asyncHandler.js";
import Order from "../models/orderModels.js";
import User from "../models/userModel.js";
import Coupon from "../models/couponModel.js";
import Stripe from "stripe";

console.log("Mongoose is:", mongoose)

// @desc Create new orders
// @route POST /api/orders
// @access Private
const addOrderItems = asyncHandler(async (req, res) => {
    const {
        orderItems,
        deliveryAddress,
        phoneNumber,
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
            phoneNumber,
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

// @desc Update order to paid
// @route PUT /api/orders/:id/pay
// @access Private
// const updateOrderToPaid = asyncHandler(async (req, res) => {
//     const order = await Order.findById(req.params.id);
//     const { id, status, update_time, email_address } = req.body;

//     if (!id || !status || !update_time || !email_address) {
//         return res.status(400).send('Missing required fields in request body.');
//     }

//     if (order) {
//         const { couponCode } = req.body;

//         if (couponCode) {
//             const coupon = await Coupon.findOne({ code: couponCode });

//             if (coupon) {
//                 console.log("Coupon found:", coupon);
//                 const userIdString = order.user.toString();
//                 console.log("Checking if user:", userIdString, "has already redeemed this coupon.");
                
//                 // Explicitly use mongoose to check ObjectId validity and push to array
//                 if (!coupon.usersRedeemed.some(userId => mongoose.Types.ObjectId(userId).equals(order.user))) {
//                     console.log("User has not redeemed this coupon yet. Adding user to usersRedeemed.");
//                     coupon.usersRedeemed.push(mongoose.Types.ObjectId(order.user));
//                     await coupon.save();
//                     console.log("Updated coupon after adding user:", coupon);
//                 } else {
//                     console.log("User has already redeemed this coupon.");
//                 }
//             } else {
//                 console.log("Coupon not found with code:", couponCode);
//             }
//         }

//         try {
//             await Order.updateOne({ _id: req.params.id }, { $set: { 
//                 isPaid: true, 
//                 paidAt: Date.now(), 
//                 paymentResults: {
//                     id: req.body.id,
//                     status: req.body.status,
//                     update_time: req.body.update_time,
//                     email_address: req.body.email_address
//                 } 
//             }});

//             const user = await User.findById(order.user);
//             if (user) {
//                 if (order.redeemedPoints) {
//                     user.qanaPoints = user.qanaPoints - order.redeemedPoints;
//                 }
//                 user.qanaPoints = user.qanaPoints + order.totalPrice;
//                 await user.save();
//                 console.log("my qana points:", user.qanaPoints);
//             }

//             const updatedOrder = await Order.findById(req.params.id);
//             if (updatedOrder) {
//                 res.status(200).json({
//                     updatedOrder: updatedOrder,
//                     updatedUser: user,
//                 });
//             } else {
//                 res.status(500).send('Failed to fetch updated order');
//             }
//         } catch (error) {
//             console.error(`Error in updating order ${req.params.id} to paid:`, error.message);
//             res.status(500).send('Server Error');
//         }
//     } else {
//         res.status(404).json({ error: 'Order not found' });
//     }
// });




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






// @desc Update order to paid
// @route PUT /api/orders/:id/pay
// @access Private
// const updateOrderToPaid = asyncHandler(async (req, res) => {
//     const { id: orderId } = req.params;

//     // Validate the orderId format
//     if (!mongoose.Types.ObjectId.isValid(orderId)) {
//         console.error("Invalid Order ID format:", orderId);
//         return res.status(400).json({ message: 'Invalid Order ID format' });
//     }

//     const order = await Order.findById(orderId);
//     const { id, status, update_time, email_address } = req.body;

//     if (!id || !status || !update_time || !email_address) {
//         return res.status(400).send('Missing required fields in request body.');
//     }

//     if (order) {
//         const { couponCode } = req.body;

//         if (couponCode) {
//             const coupon = await Coupon.findOne({ code: couponCode });
//             if (coupon) {
//                 // Redeem the coupon for the user
//                 coupon.usersRedeemed.push(order.user);
//                 await coupon.save();
//             }
//         }
//         try {
//             // Use updateOne method for direct database update
//             await Order.updateOne({ _id: orderId }, { $set: { 
//                 isPaid: true, 
//                 paidAt: Date.now(), 
//                 paymentResults: {
//                     id: req.body.id,
//                     status: req.body.status,
//                     update_time: req.body.update_time,
//                     email_address: req.body.email_address
//                 } 
//             }});

//             // Fetch the user associated with the order
//             const user = await User.findById(order.user);

//             if (user) {
//                 // Deducting redeemed Qana points if any
//                 if (order.redeemedPoints) {
//                     user.qanaPoints -= order.redeemedPoints;
//                 }

//                 // Add the Qana points based on the order's totalPrice
//                 user.qanaPoints += order.totalPrice;
//                 await user.save();
//                 console.log("my qana points:", user.qanaPoints);
//             }

//             console.log(user);

//             // Fetch the updated order to send as a response
//             const updatedOrder = await Order.findById(orderId);
//             if (updatedOrder) {
//                 res.status(200).json({
//                     updatedOrder: updatedOrder,
//                     updatedUser: user,
//                 });
//             } else {
//                 res.status(500).send('Failed to fetch updated order');
//             }
//         } catch (error) {
//             console.error(`Error in updating order ${orderId} to paid:`, error.message);
//             res.status(500).send('Server Error');
//         }
//     } else {
//         res.status(404).json({ error: 'Order not found' });
//     }
// });




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
