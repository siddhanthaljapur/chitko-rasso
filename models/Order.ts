
import mongoose, { Schema, model, models } from 'mongoose';

const OrderItemSchema = new Schema({
    id: String,
    name: String,
    price: Number,
    quantity: Number,
    image: String,
    isVeg: Boolean,
});

const statusHistorySchema = new Schema({
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    comment: String
});

const OrderSchema = new Schema({
    // User Link (Optional for guest checkout, though we force login now)
    userId: { type: Schema.Types.ObjectId, ref: 'User' },

    // Order Identifier
    orderNumber: { type: String, required: true, unique: true },


    // Customer Details Snapshot (in case user changes profile later)
    customerDetails: {
        name: String,
        email: String,
        phone: String,
        address: {
            street: String,
            city: String,
            pincode: String,
            landmark: String,
        }
    },

    items: [OrderItemSchema],

    // Payment
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['COD', 'ONLINE'], default: 'COD' },
    paymentStatus: { type: String, enum: ['PENDING', 'PAID', 'FAILED'], default: 'PENDING' },
    razorpayOrderId: String,
    razorpayPaymentId: String,

    // Order Status
    status: {
        type: String,
        enum: ['Placed', 'Confirmed', 'Preparation', 'Out for Delivery', 'Delivered', 'Cancelled'],
        default: 'Placed'
    },
    statusHistory: [statusHistorySchema],

    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    deliveryTime: Date,
});

const Order = models.Order || model('Order', OrderSchema);

export default Order;
