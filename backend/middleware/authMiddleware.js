import jwt from "jsonwebtoken"
import asyncHandler from "./asyncHandler.js";
import User from "../models/userModel.js";

// User must be authorized
const protect = asyncHandler(async (req, res, next) => {
    let token;
    
    // Read the JWT from the code
    token = req.cookies.jwt;

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.userId).select('-password');
            
            next();
        } catch (error) {
            console.error(error);
            res.status(401);
            throw new Error('Not authorized, token failed')
        }
    } else {
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

