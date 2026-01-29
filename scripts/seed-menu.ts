
import mongoose, { Schema, model, models } from 'mongoose';
import { menuData } from '../lib/menuData'; // Now properly imported via TS
import * as dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chitko';

// Simplified Schema for Seed Script (just to satisfy Mongoose)
// Ideally, import the official model, but in a standalone script, local definition is safer usually
const MenuItemSchema = new Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true },
    isVeg: { type: Boolean, required: true },
    isBestseller: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    spiceLevel: { type: String },
    preparationTime: { type: String },
    available: { type: Boolean, default: true },
    stock: { type: Number, default: 100 },
});

// Use existing model or compile new ONE-OFF model for this script
const MenuItem = models.MenuItem || model('MenuItem', MenuItemSchema);

async function seed() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected.');

        console.log('🧹 Clearing existing menu items...');
        await MenuItem.deleteMany({});

        console.log(`🌱 Seeding ${menuData.length} items from menuData.ts...`);
        await MenuItem.insertMany(menuData);

        console.log('✨ Database successfully seeded!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

seed();
