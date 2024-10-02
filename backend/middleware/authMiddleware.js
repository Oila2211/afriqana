import jwt from "jsonwebtoken"
import asyncHandler from "./asyncHandler.js";
import User from "../models/userModel.js";

// User must be authorized
const protect = asyncHandler(async (req, res, next) => {
    let token;
    
    // Read the JWT from the code
    token = req.cookies.jwt;
    console.log("Token from cookies: ", token);  // Log token from cookies

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.userId).select('-password');
            console.log("Authenticated user: ", req.user);  // Log authenticated user
            
            next();
        } catch (error) {
            console.error("Token verification failed:",error);
            res.status(401);
            throw new Error('Not authorized, token failed')
        }
    } else {
        console.log("No token found in cookies");  // Log if no token is found
        res.status(401);
        throw new Error('Not authorized, no token')
    }
})

// User must be admin
const admin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(401);
        throw new Error('Not authorized, as admin');
    }
}

export { admin, protect };

