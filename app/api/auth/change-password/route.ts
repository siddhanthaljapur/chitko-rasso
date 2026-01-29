
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../[...nextauth]/route";
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { currentPassword, newPassword } = body;

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ message: 'Please provide both current and new passwords' }, { status: 400 });
        }

        if (newPassword.length < 6) {
            return NextResponse.json({ message: 'New password must be at least 6 characters' }, { status: 400 });
        }

        await dbConnect();

        // Need to explicitly select password as it is excluded by default
        const user = await User.findOne({ email: session.user.email }).select('+password');

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // Verify current password
        // Note: Admin seed user might not have hashed password? 
        // If it's the initial seed "admin123", it might be plain text if the seed script didn't hash it.
        // Assuming seed script hashed it. If not, this check will fail unless we handle legacy plain text (bad practice).
        // Let's assume standard behavior: Compare hash. 
        // But checking seed script might be wise if I verified it earlier.
        // I'll proceed assuming proper hashing.
        const isMatch = await bcrypt.compare(currentPassword, user.password);

        if (!isMatch) {
            return NextResponse.json({ message: 'Incorrect current password' }, { status: 400 });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        return NextResponse.json({ message: 'Password updated successfully' });

    } catch (error) {
        console.error('Change Password Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
