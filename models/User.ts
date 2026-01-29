
import mongoose, { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email',
        ],
    },
    password: {
        type: String,
        // Password is optional for potential OAuth users in future
        select: false,
    },
    phone: {
        type: String,
        required: [true, 'Please provide a phone number'],
        unique: true,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    loyaltyPoints: {
        type: Number,
        default: 0,
    },
    addresses: [{
        name: String,
        phone: String,
        address: String,
        city: String,
        pincode: String,
        landmark: String,
        type: { type: String, enum: ['Home', 'Work', 'Other'], default: 'Home' }
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Prevent model overwrite model compilation error
const User = models.User || model('User', UserSchema);

export default User;
