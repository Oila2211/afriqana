import path from 'path';
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import connectDB from './config/db.js';
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import regionRoutes from './routes/regionRoutes.js';
import Stripe from "stripe";

dotenv.config()
if (!process.env.PORT || !process.env.STRIPE_SECRET_KEY) {
    throw new Error("Essential environment variables are missing. Ensure PORT and STRIPE_SECRET_KEY are set.");
}

const port = process.env.PORT;
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


connectDB(); //connect to MongoDB

const app = express();

app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'", 'https://api.stripe.com', 'https://checkout-cookies.stripe.com']
        // Add any other CSP policies as needed
      }
    }
  }));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({extended: true}))

// Cookie parser middleware
app.use(cookieParser());

app.use(cors({ credentials: true,origin: ['http://localhost:3000', 'https://checkout-cookies.stripe.com'] }));

app.get('/', (req, res) => {
    res.send('API is running...')
})

app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/region', regionRoutes);
app.use('/api/coupon', couponRoutes);

const __dirname = path.resolve(); //Set __dirname to current directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use(notFound);
app.use(errorHandler);

app.listen(port, () => console.log(`server is running on port ${port}`))