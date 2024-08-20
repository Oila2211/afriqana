import mongoose from 'mongoose';
import Coupon from '../models/couponModel.js';
import Order from '../models/orderModels.js';
import asyncHandler from '../middleware/asyncHandler.js';
import generateCoupon from '../utils/generateCoupon.js';

// Create a coupon
// @route POST 
// @ACCESS Private/Admin
const createCoupon = asyncHandler(async(req, res) => {
    
    const { 
        code = generateCoupon(10), 
        discountPercentage = 10, 
        expiryDate = new Date().setDate(new Date().getDate() + 30),
        limitPerUser = 1, 
        isActive = false,
    } = req.body;
    console.log(req.body)
    // Ensure that discountPercentage is between 1 and 100
    if (discountPercentage <= 0 || discountPercentage > 100) {
        res.status(400).json({ message: "Discount percentage should be between 1 and 100" });
        return;
    }

    const coupon = await Coupon.create({
        code,
        discountPercentage,
        expiryDate,
        limitPerUser,
        isActive,
    });
    


    if (coupon) {
        res.status(201).json(coupon);
    } else {
        res.status(400);
        throw new Error('Invalid coupon data');
    }
    console.log('coupon body is:', req.body)
});

// @desc List all active coupons
// @route GET /api/coupons
// @access Private/Admin
const listCoupons = asyncHandler(async (req, res) => {
    const coupons = await Coupon.find({ });

    if (coupons.length === 0) {
        return res.status(200).json([]);  // Return an empty array explicitly
    }

    res.status(200).json(coupons);
});



// @desc Fetch/Edit a Coupon
// @route GET /api/coupon/:id
// @access Admin/Private
const getCouponById = asyncHandler(async (req, res) => {
    const coupon = await Coupon.findById(req.params.id);

    if(coupon) {
        return res.json(coupon);
    } else {
        res.status(404);
        throw new Error('Resource not found')
    }
});


// @desc Update a coupon
// @route PUT /api/coupon/:id
// @access Private/Admin
const updateCoupon = asyncHandler(async (req, res) => {
        // Step 1: Logging the received payload
        console.log("Received payload:", req.body);

    const {discountPercentage, expiryDate,limitPerUser, isActive} = req.body

    // Step 2: Error handling for discountPercentage
    if (!discountPercentage && discountPercentage !== 0) {
        return res.status(400).send({ message: "Discount percentage is required." });
    }


    const coupon = await Coupon.findById(req.params.id);

    if (coupon) {
        coupon.discountPercentage = discountPercentage;
        coupon.expiryDate = expiryDate;
        coupon.isActive = isActive;
        coupon.limitPerUser = limitPerUser

        const updatedCoupon = await coupon.save();
        res.status(200).json(updatedCoupon);
    } else {
        res.status(404);
        throw new Error('Coupon not found');
    }
});

// @desc Delete a coupon
// @route DELETE /api/coupons/:id
// @access Private/Admin
const deleteCoupon = asyncHandler(async (req, res) => {
    const coupon = await Coupon.findById(req.params.id);

    if (coupon) {
        coupon.isActive = false;
        await Coupon.deleteOne({_id: coupon._id});
        await coupon.save();
        res.status(200).json({ message: 'Coupon deactivated' });
    } else {
        res.status(404);
        throw new Error('Coupon not found');
    }
});

// @desc Apply or validate a coupon
// @route POST /api/coupons/validate
// @access Private
const validateCoupon = asyncHandler(async (req, res) => {
    console.log("Full Request body:", req.body);

    const { couponCode, orderId } = req.body;  

    console.log("Coupon code received:", couponCode);
    console.log("Order ID received:", orderId);  // Debugging 

    // Ensure the couponCode is a string before proceeding
    if (!couponCode || typeof couponCode !== 'string') {
        return res.status(400).json({ message: 'Invalid coupon code' });
    }

    if (!orderId) {
        return res.status(400).json({ message: 'Order ID is not defined' });
    }

    // Use the id from the protected route middleware
    const userId = req.user.id;

    // Check if orderId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        console.log("Invalid Order ID format:", orderId);
        return res.status(400).json({ message: 'Invalid Order ID format' });
    } else {
        console.log("Valid Order ID:", orderId);
    }


    // Fetch the coupon and the order
    const coupon = await Coupon.findOne({ code: couponCode });
    const order = await Order.findById(orderId);
    if (!order) {
        return res.status(404).json({ message: 'Order not found' });
    }

    if (!coupon) {
        return res.status(404).json({ message: 'Coupon not found' });
    }

    if (!order) {
        return res.status(404).json({ message: 'Order not found' });
    }

    // Check if the user has already used the coupon
    const userRedeemCount = coupon.usersRedeemed.filter(user => String(user) === String(userId)).length;
    if (userRedeemCount >= coupon.limitPerUser) {
        return res.status(400).json({ message: `You have already used this coupon the maximum allowed ${coupon.limitPerUser} times.` });
    }
    

    // 1. Check if the coupon is active and valid
    if (!coupon.isActive) {
        return res.status(400).json({ message: 'This coupon is no longer active.' });
    }

    // 2. Check if the coupon has expired
    const currentDate = new Date();
    if (coupon.expiryDate < currentDate) {
        return res.status(400).json({ message: 'This coupon has expired.' });
    }

    // Apply the discount to the order (but don't save it to the database yet)
    const discountAmount = (order.itemsPrice * coupon.discountPercentage) / 100;
    const newTotalPrice = order.totalPrice - discountAmount;

    

    // Mark the coupon as redeemed by this user
    // coupon.usersRedeemed.push(userId);
    // await coupon.save();

    res.status(200).json({ 
        message: 'Coupon applied successfully', 
        discount: coupon.discountPercentage,
        orderPrices: {
            itemsPrice: order.itemsPrice,
            deliveryPrice: order.deliveryPrice,
            taxPrice: order.taxPrice,
            totalPrice: newTotalPrice,
            discountAmount
        }
     });
});


export {
    createCoupon,
    listCoupons,
    getCouponById,
    updateCoupon,
    deleteCoupon,
    validateCoupon,
}




// const validateCoupon = asyncHandler(async (req, res) => {
//     console.log("Full Request body:", req.body);

//     const { couponCode, orderId } = req.body;  


//     // Ensure orderId is provided
//     if (!orderId) {
//         return res.status(400).json({ message: 'Order ID is not defined' });
//     }


//     // Use the id from the protected route middleware
//     const userId = req.user.id;


//     try {
//         // Fetch the coupon
//         console.log("Looking for the coupon in the database...");
//         const coupon = await Coupon.findOne({ code: couponCode });
//         if (!coupon) {
//             console.log("Coupon not found:", couponCode);
//             return res.status(404).json({ message: 'Coupon not found' });
//         }

//         // Fetch the order
//         console.log("Looking for the order in the database...");
//         const order = await Order.findById(orderId);
//         console.log("Order lookup result:", order);  // Logging the result of the order lookup
//         if (!order) {
//             console.log("Order not found for ID:", orderId);
//             return res.status(404).json({ message: 'Order not found' });
//         }

//         console.log("Order found:", order);

//         // Remaining logic for validating and applying the coupon...
//         // (Same as before)
//     } catch (error) {
//         console.error("Error during coupon validation:", error);
//         return res.status(500).json({ message: 'An error occurred while validating the coupon' });
//     }




//     // Fetch the coupon
//     console.log("Looking for the coupon in the database...");
//     const coupon = await Coupon.findOne({ code: couponCode });
//     if (!coupon) {
//         console.log("Coupon not found:", couponCode);
//         return res.status(404).json({ message: 'Coupon not found' });
//     }

//     // Fetch the order
//     console.log("Looking for the order in the database...");
//     const order = await Order.findById(orderId);
//     if (!order) {
//         console.log("Order not found for ID:", orderId);
//         return res.status(404).json({ message: 'Order not found' });
//     }

//     console.log("Order found:", order);

//     // Check if the user has already used the coupon
//     const userRedeemCount = coupon.usersRedeemed.filter(user => String(user) === String(userId)).length;
//     if (userRedeemCount > coupon.limitPerUser) {
//         console.log("User has already used the coupon the maximum allowed times:", coupon.limitPerUser);
//         return res.status(400).json({ message: `You have already used this coupon the maximum allowed ${coupon.limitPerUser} times.` });
//     }

//     // 1. Check if the coupon is active and valid
//     if (!coupon.isActive) {
//         console.log("Coupon is no longer active.");
//         return res.status(400).json({ message: 'This coupon is no longer active.' });
//     }

//     // 2. Check if the coupon has expired
//     const currentDate = new Date();
//     if (coupon.expiryDate < currentDate) {
//         console.log("Coupon has expired.");
//         return res.status(400).json({ message: 'This coupon has expired.' });
//     }

//     // Apply the discount to the order (but don't save it to the database yet)
//     const discountAmount = (order.itemsPrice * coupon.discountPercentage) / 100;
//     const newTotalPrice = order.totalPrice - discountAmount;

//     console.log("Discount applied. New total price:", newTotalPrice);

//     // Mark the coupon as redeemed by this user
//     // Uncomment these lines if you want to save the coupon as redeemed
//     // coupon.usersRedeemed.push(userId);
//     // await coupon.save();

//     res.status(200).json({ 
//         message: 'Coupon applied successfully', 
//         discount: coupon.discountPercentage,
//         orderPrices: {
//             itemsPrice: order.itemsPrice,
//             deliveryPrice: order.deliveryPrice,
//             taxPrice: order.taxPrice,
//             totalPrice: newTotalPrice,
//             discountAmount
//         }
//      });
// });


