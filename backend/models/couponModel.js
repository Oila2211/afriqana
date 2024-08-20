import mongoose from "mongoose";
import generateCoupon from "../utils/generateCoupon.js";


const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        default: generateCoupon(10), 
        // This generates a 10 character unique code
    },
    discountPercentage: {
        type: Number,
        required: true,
        validate: {
            validator: function (value) {
                return value > 0 && value <= 100;
            },
            message: "Discount percentage should be between 1 and 100"
        }
    },
    expiryDate: {
        type: Date,
        required: true
    },
    usersRedeemed: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    limitPerUser: {
        type: Number,
        required: true,
        default: 1,
    },
    isActive: {
        type: Boolean,
        require: true,
        default: false,
    }
});

const Coupon = mongoose.model("Coupon", couponSchema);

export default Coupon;