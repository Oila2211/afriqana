import Coupon from '../models/couponModel.js';
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



// @desc Fetch a Coupon
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

    const {discountPercentage, expiryDate, isActive} = req.body

    // Step 2: Error handling for discountPercentage
    if (!discountPercentage && discountPercentage !== 0) {
        return res.status(400).send({ message: "Discount percentage is required." });
    }

    const coupon = await Coupon.findById(req.params.id);

    if (coupon) {
        coupon.discountPercentage = discountPercentage;
        coupon.expiryDate = expiryDate;
        coupon.isActive = isActive

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

// @desc Redeem a coupon
// @route POST /api/coupons/redeem
// @access Private
const redeemCoupon = asyncHandler(async (req, res) => {
    const { couponCode, userId } = req.body;  // You might get userId differently, e.g., from JWT or session.

    const coupon = await Coupon.findOne({ code: couponCode });

    if (!coupon) {
        return res.status(404).json({ message: 'Coupon not found' });
    }

    if (coupon.usersRedeemed.includes(userId)) {
        return res.status(400).json({ message: 'You have already used this coupon.' });
    }

    // 1. Check if the coupon is active
    if (!coupon.isActive) {
        return res.status(400).json({ message: 'This coupon is no longer active.' });
    }

    // 2. Check if the coupon has expired
    const currentDate = new Date();
    if (coupon.expiryDate < currentDate) {
        return res.status(400).json({ message: 'This coupon has expired.' });
    }

    

    // Mark the coupon as redeemed by this user
    coupon.usersRedeemed.push(userId);
    await coupon.save();

    res.status(200).json({ message: 'Coupon applied successfully', discount: coupon.discountPercentage });
});

export {
    createCoupon,
    listCoupons,
    getCouponById,
    updateCoupon,
    deleteCoupon,
    redeemCoupon,
}
