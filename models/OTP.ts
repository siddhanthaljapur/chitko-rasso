
import mongoose, { Schema, model, models } from 'mongoose';

const OTPSchema = new Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    code: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 600 // Auto-delete after 10 minutes
    }
});

const OTP = models.OTP || model('OTP', OTPSchema);

export default OTP;
