import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import dbConnect from '@/lib/db';
import Coupon from '@/models/Coupon';

export async function GET(req: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const code = searchParams.get('code');

        if (code) {
            // Validate specific coupon (public access allowed for checkout)
            const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

            if (!coupon) {
                return NextResponse.json({ message: 'Invalid coupon' }, { status: 404 });
            }

            // Check expiry
            if (coupon.expiryDate && new Date() > new Date(coupon.expiryDate)) {
                return NextResponse.json({ message: 'Coupon expired' }, { status: 400 });
            }

            // Check usage limit
            if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
                return NextResponse.json({ message: 'Coupon usage limit exceeded' }, { status: 400 });
            }

            return NextResponse.json(coupon);
        }

        // List all coupons (Admin only)
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            // Return empty list instead of 401 to avoid breaking UI that expects list, or strict check
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const coupons = await Coupon.find({}).sort({ createdAt: -1 });
        return NextResponse.json(coupons);

    } catch (error) {
        return NextResponse.json({ message: 'Error fetching coupons' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        await dbConnect();

        const newCoupon = await Coupon.create(body);
        return NextResponse.json(newCoupon, { status: 201 });
    } catch (error: any) {
        if (error.code === 11000) {
            return NextResponse.json({ message: 'Coupon code already exists' }, { status: 409 });
        }
        return NextResponse.json({ message: 'Error creating coupon', error }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        await dbConnect();
        await Coupon.findByIdAndDelete(id);

        return NextResponse.json({ message: 'Deleted successfully' });
    } catch (error) {
        return NextResponse.json({ message: 'Error deleting coupon' }, { status: 500 });
    }
}
