
import mongoose from 'mongoose';
import User from '../models/User'; // Adjust path if needed
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('MONGODB_URI is missing in .env.local');
    process.exit(1);
}

async function seedAdmin() {
    try {
        await mongoose.connect(MONGODB_URI as string);
        console.log('Connected to MongoDB Atlas...');

        const adminEmail = 'admin@chitko.com';
        const adminPass = 'admin123';
        const adminPhone = '9999999999';

        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log('Admin user already exists.');
        } else {
            const hashedPassword = await bcrypt.hash(adminPass, 10);
            await User.create({
                name: 'Chitko Admin',
                email: adminEmail,
                phone: adminPhone,
                password: hashedPassword,
                role: 'admin',
                loyaltyPoints: 1000
            });
            console.log(`Admin user created! Login: ${adminEmail} / ${adminPass}`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
}

seedAdmin();
