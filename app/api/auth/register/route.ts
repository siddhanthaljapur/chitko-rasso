
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, phone, password, otp } = body;

        // Validation
        if (!name || !email || !phone) {
            return NextResponse.json(
                { message: 'Missing required fields' },
                { status: 400 }
            );
        }

        await dbConnect();

        // 1. Verify OTP if provided (Security Check)
        // For Email OTP signup, we expect 'otp' to be present.

        if (otp) {
            const OTP = (await import("@/models/OTP")).default;
            const otpRecord = await OTP.findOne({ email, code: otp });

            if (!otpRecord) {
                return NextResponse.json(
                    { message: 'Invalid or expired Verification Code' },
                    { status: 400 }
                );
            }
            // Consume OTP - DISABLED for Auto-Login flow
            // We need this OTP to remain valid for the immediate loginWithOtp() call that follows signup.
            // The login handler will delete it.
            // await OTP.deleteOne({ _id: otpRecord._id });
        } else if (!password) {
            // Password or OTP is required
            return NextResponse.json(
                { message: 'Password or Verification Code required' },
                { status: 400 }
            );
        }

        // Check if user exists
        const existingUser = await User.findOne({
            $or: [{ email }, { phone }]
        });

        if (existingUser) {
            return NextResponse.json(
                { message: 'User with this email or phone already exists' },
                { status: 409 }
            );
        }

        // Hash Password if exists
        let hashedPassword = undefined;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        // Create User
        const newUser = await User.create({
            name,
            email,
            phone,
            password: hashedPassword, // Can be undefined for OTP-only users
            role: 'user', // Default role
        });

        return NextResponse.json(
            { message: 'User created successfully', userId: newUser._id },
            { status: 201 }
        );

    } catch (error: any) {
        console.error('Registration Error:', error);
        return NextResponse.json(
            { message: 'Internal Server Error', error: error.message },
            { status: 500 }
        );
    }
}
