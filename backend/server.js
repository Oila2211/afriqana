import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from './config/db.js';
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import asyncHandler from "./middleware/asyncHandler.js";
import Order from "./models/orderModels.js";
import Stripe from "stripe";
import { protect } from "./middleware/authMiddleware.js";


dotenv.config()
if (!process.env.PORT || !process.env.STRIPE_SECRET_KEY) {
    throw new Error("Essential environment variables are missing. Ensure PORT and STRIPE_SECRET_KEY are set.");
}

const port = process.env.PORT;
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

connectDB(); //connect to MongoDB

const app = express();

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({extended: true}))

// Cookie parser middleware
app.use(cookieParser());

app.use(cors({ credentials: true,origin: 'http://localhost:3000' }));

app.get('/', (req, res) => {
    res.send('API is running...')
})

app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);


app.use(notFound);
app.use(errorHandler);

app.listen(port, () => console.log(`server is running on port ${port}`))