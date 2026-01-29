
import mongoose, { Schema, model, models } from 'mongoose';

const MenuItemSchema = new Schema({
    id: { type: String, required: true, unique: true }, // Keep existing string IDs for now to avoid breaking frontend
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true },
    isVeg: { type: Boolean, required: true },
    isBestseller: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    spiceLevel: { type: String, enum: ['Low', 'Medium', 'High', 'Extra Hot'] },
    preparationTime: { type: String },

    // Inventory Management
    available: { type: Boolean, default: true },
    stock: { type: Number, default: 100 },
});

const MenuItem = models.MenuItem || model('MenuItem', MenuItemSchema);

export default MenuItem;
