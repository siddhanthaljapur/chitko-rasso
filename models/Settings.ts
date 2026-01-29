import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true, // e.g., 'kitchen_status', 'tax_rate'
    },
    value: {
        type: mongoose.Schema.Types.Mixed, // Can be string, number, boolean, object
        required: true,
    },
    updatedBy: String,
}, { timestamps: true });

export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);
