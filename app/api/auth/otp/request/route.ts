
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import OTP from '@/models/OTP';
import User from '@/models/User'; // Added User import

export async function POST(req: Request) {
    try {
        const { email, type } = await req.json(); // Added 'type' param

        if (!email) { // Modified email validation
            return NextResponse.json(
                { message: 'Email is required' },
                { status: 400 }
            );
        }

        // Connect to DB
        await connectDB(); // Changed dbConnect to connectDB

        // Check if user exists
        const userExists = await User.findOne({ email });

        if (type === 'login') {
            if (!userExists) {
                return NextResponse.json(
                    { message: 'Account not found. Please create an account.' },
                    { status: 404 }
                );
            }
        } else if (type === 'signup') {
            if (userExists) {
                return NextResponse.json(
                    { message: 'Account already exists. Please login.' },
                    { status: 409 }
                );
            }
        }

        // Delete any existing OTPs for this email to prevent duplicates
        await OTP.deleteMany({ email });

        // Generate a 4-digit numeric code
        const code = Math.floor(1000 + Math.random() * 9000).toString();

        // Create new OTP record
        await OTP.create({ email, code });

        // Send Email (Real or Simulation handled inside)
        const { sendOTPEmail } = await import('@/lib/mail');
        await sendOTPEmail(email, code);

        return NextResponse.json({ message: 'OTP sent successfully' });

    } catch (error) {
        console.error('OTP Request Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
