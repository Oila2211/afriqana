import mongoose from 'mongoose';

const regionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    baseDeliveryPrice: {
        type: Number,
        required: true,
        default: 0.0,
    },
    maxDistance: {
        type: Number,
        required: true,
        default: 4000, // Maximum distance before extra charges apply (in kilometers)
    },
    extraChargePerKm: {
        type: Number,
        required: true,
        default: 0.0, // Extra charge per kilometer beyond maxDistance
    },
    location: {
        type: { type: String, enum: ['Point'], required: true, default: 'Point' },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true,
        }
    },
    // isActive: {
    //     type: Boolean,
    //     required: true,
    //     default: true, // Only active regions will be considered for delivery
    // },
}, {
    timestamps: true,
});

// Create a 2dsphere index on the coordinates field
regionSchema.index({ location: '2dsphere' });

const Region = mongoose.model('Region', regionSchema);

export default Region;
