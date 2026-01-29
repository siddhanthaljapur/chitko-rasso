
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User'; // Ensure User model is loaded
import { isKitchenOpen } from '@/lib/kitchenUtils';

export async function POST(req: Request) {
    try {
        // 1. Check Authentication (Optional for guest? No, we force login)
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // 2. Check Kitchen Status
        if (!isKitchenOpen()) {
            return NextResponse.json({ message: 'Kitchen is currently closed' }, { status: 403 });
        }

        const body = await req.json();
        const { items, totalAmount, customerDetails, paymentMethod } = body;

        if (!items || items.length === 0) {
            return NextResponse.json({ message: 'Cart is empty' }, { status: 400 });
        }

        await dbConnect();

        // 3. Create Order
        const orderNumber = `ORD${Date.now()}`; // Simple timestamp based ID. In prod, use NanoID or Counter.

        const newOrder = await Order.create({
            userId: session.user.id,
            orderNumber,
            customerDetails,

            items,
            totalAmount,
            paymentMethod,
            paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PENDING', // Online will update this later
            status: 'Placed',
            statusHistory: [{ status: 'Placed', comment: 'Order placed successfully' }]
        });

        // 4. Update Loyalty Points (Mock logic: 1 point per 100rs)
        const points = Math.floor(totalAmount / 100);
        if (points > 0) {
            await User.findByIdAndUpdate(session.user.id, {
                $inc: { loyaltyPoints: points }
            });
        }

        return NextResponse.json({
            message: 'Order placed successfully',
            orderId: newOrder._id,
            loyaltyPointsEarned: points
        }, { status: 201 });

    } catch (error: any) {
        console.error('Order Creation Error:', error);
        return NextResponse.json(
            { message: 'Internal Server Error', error: error.message },
            { status: 500 }
        );
    }
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        let query = {};
        if (session.user.role !== 'admin') {
            query = { userId: session.user.id };
        }

        const orders = await Order.find(query)
            .sort({ createdAt: -1 }) // Newest first
            .limit(session.user.role === 'admin' ? 100 : 20); // Admins see more


        return NextResponse.json(orders);
    } catch (error) {
        console.error('Order Fetch Error:', error);
        return NextResponse.json({ message: 'Failed to fetch orders' }, { status: 500 });
    }
}
