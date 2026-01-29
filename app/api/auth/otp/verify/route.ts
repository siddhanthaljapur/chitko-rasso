
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import OTP from '@/models/OTP';

export async function POST(req: Request) {
    try {
        const { email, code } = await req.json();

        if (!email || !code) {
            return NextResponse.json({ message: 'Email and code are required' }, { status: 400 });
        }

        await dbConnect();

        // Find the OTP record
        const record = await OTP.findOne({ email, code });

        if (record) {
            // OTP is valid
            // Do NOT delete yet if used for registration (consumed in next step)
            // If used for Login, we could delete here, but let's consistency handle it.
            // Actually for login, there is no second step, 'verify' is just a check or part of authorize.
            // If this endpoint is used for pure verification feedback (UI), we shouldn't delete.

            return NextResponse.json({ valid: true, message: 'OTP Verified' });
        } else {
            return NextResponse.json({ valid: false, message: 'Invalid OTP' }, { status: 400 });
        }

    } catch (error) {
        console.error('OTP Verify Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
