import asyncHandler from "../middleware/asyncHandler.js";
import User from '../models/userModel.js';
import Order from "../models/orderModels.js";
import generateToken from "../utils/generateToken.js";

// @desc auth user & get the token
// @route GET /api/users/login
// @access Public
const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        generateToken(res, user._id)
        // console.log("Token generated and set:", token)

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            qanaPoints: user.qanaPoints,
            isAdmin: user.isAdmin,
            
        })
    } else {
        res.status(401);
        throw new Error('Invalid email or password')
    }

});

// @desc Register new user
// @route POST /api/users/login
// @access Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists')
    }

    const user = await User.create({
        name,
        email,
        password
    })

    if (user) {
        generateToken(res, user._id);
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            // qanaPoints: user.qanaPoints,
            isAdmin: user.isAdmin,
        });
        
    }  else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc Logout user / clear cookie
// @route POST /api/users/logout
// @access Private

const logoutUser = asyncHandler(async (req, res) => {
    console.log("logout user called")
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0) // electively deleting the new cookie
    });

    res.status(200).json({ message: 'Logged out successfully'})
});



// //@desc Redeem user Qana Points
// // @route POST /api/users/redeem
// //@access Private
const redeemQanaPoints = asyncHandler(async (req, res) => {
    const { points, orderId} = req.body;
    const user = await User.findById(req.user._id)

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Check if the user has at least 2,000 points to redeem
    if (user.qanaPoints < 2000) {
        res.status(400);
        throw new Error('Error: You need at least 2,000 Qana points to redeem.')
    }


    const order = await Order.findById(orderId);

    //Ensure the order exists
    if (!order) {
        res.status(404);
        throw new Error('Order not found')
    }

    // Check if points have already been redeemed for this order
    if (order.redeemedPoints > 0) {
        res.status(400);
        throw new Error('Points have already been redeemed for this order.');
    }

    // Check if the user has enough points to match the redemption amount
    if (user.qanaPoints < points) {
        res.status(400);
        throw new Error('Error: Not enough Qana points to redeem this offer.')
    }

    // Apply the corresponding offer or discount
    if (points === 2000 && order.totalPrice >= 350) {    
            order.totalPrice -= 50; // SEK 50 discount
            order.redeemedPoints = points;
    } else {
        res.status(400);
        throw new Error('Conditions not met for redemption.');
    }
    // await user.save();
    await order.save();


    res.status(200).json({ 
        message: 'Redemption successful',
        orderPrices: {
            itemsPrice: order.itemsPrice,
            deliveryPrice: order.deliveryPrice,
            taxPrice: order.taxPrice,
            totalPrice: order.totalPrice
        }
     });
})



// @desc Get user profile
// @route GET /api/users/profile
// @access Private
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            qanaPoints: user.qanaPoints,
            isAdmin: user.isAdmin,
        })
    } else {
        res.status(404);
        throw new Error('User not found')
    }
    console.log('user new details:', user)
});



// @desc Update user profile
// @route PUT /api/users/login  no id is passed here bcos we using the web token
// @access Public
const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.status(200).json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin,
        })
    } else {
        res.status(401)
        throw new Error('User not found')
    }
});

// @desc Get users
// @route Get /api/users/ 
// @access Private/Admin
const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find({});
    res.status(200).json(users);
});


// @desc Get user by ID
// @route Get /api/users/:id
// @access Private/Admin
const getUserByID = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password')

    if (user) {
      res.status(200).json(user);

    } else {
      res.status(400);
      throw new Error('User not found')
    }
});

// @desc Get users
// @route Get /api/users/: 
// @access Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
      if (user.isAdmin) {
        res.status(400);
        throw new Error ('Cannot delete admin user')
      }
      await User.deleteOne({_id: user._id})
      res.status(200).json({message: 'User deleted successfully'})
    } else {
        res.status(404)
        throw new Error('User not found')
    }
});

// @desc Update user
// @route PUT /api/users/:id
// @access Private/Admin
const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.isAdmin = Boolean(req.body.isAdmin);

      const updatedUser = await user.save();

      res.status(200).json({
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin
      })
    }
});

export {
    authUser,
    registerUser,
    logoutUser,
    getUserProfile,
    updateUserProfile,
    redeemQanaPoints,
    getUsers,
    deleteUser,
    getUserByID,
    updateUser,
}