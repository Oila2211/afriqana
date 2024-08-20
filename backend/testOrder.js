import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './models/orderModels.js'; // Adjust the path as needed
import connectDB from './config/db.js'; // Adjust the path as needed

dotenv.config(); // Load environment variables

const orderId = '66b88cc9d6543141aa89172'; // Replace this with your actual orderId

// Connect to the database
connectDB();

const testOrderRetrieval = async () => {
    console.log("Testing retrieval of Order with ID:", orderId);
    try {
        // Directly try to find the order without validation
        const order = await Order.findById(orderId);

        if (order) {
            console.log("Order found:", order);
        } else {
            console.log("Order not found.");
        }
    } catch (error) {
        console.error("Error retrieving order:", error.message);
    } finally {
        mongoose.connection.close();
    }
};

testOrderRetrieval();
