import mongoose from 'mongoose';

const CouponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
    },
    discountType: {
        type: String,
        enum: ['PERCENTAGE', 'FLAT'],
        required: true,
    },
    discountValue: {
        type: Number, // Percentage (e.g. 10 for 10%) or Amount (e.g. 100 for ₹100)
        required: true,
    },
    minOrderValue: {
        type: Number,
        default: 0,
    },
    maxDiscount: {
        type: Number, // Max discount amount (useful for percentage)
        default: null,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    usageLimit: {
        type: Number, // Total times this coupon can be used
        default: null,
    },
    usedCount: {
        type: Number,
        default: 0,
    },
    expiryDate: {
        type: Date,
        default: null,
    }
}, { timestamps: true });

export default mongoose.models.Coupon || mongoose.model('Coupon', CouponSchema);
