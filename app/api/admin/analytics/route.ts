
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import dbConnect from '@/lib/db';
import Order from '@/models/Order';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // Parse query params
        const { searchParams } = new URL(req.url);
        const range = searchParams.get('range') || '7d';
        const customStart = searchParams.get('start');
        const customEnd = searchParams.get('end');

        let startDate = new Date();
        let endDate = new Date();
        const now = new Date();

        // Calculate Date Range
        if (range === 'custom' && customStart && customEnd) {
            startDate = new Date(customStart);
            endDate = new Date(customEnd);
            endDate.setHours(23, 59, 59);
        } else {
            switch (range) {
                case '30d': startDate.setDate(now.getDate() - 30); break;
                case '90d': startDate.setDate(now.getDate() - 90); break;
                case 'ytd': startDate = new Date(now.getFullYear(), 0, 1); break;
                case '7d':
                default:
                    startDate.setDate(now.getDate() - 7);
            }
        }

        // Fetch Orders
        const orders = await Order.find({
            createdAt: { $gte: startDate, $lte: endDate },
            status: { $ne: 'cancelled' }
        }).sort({ createdAt: 1 });

        return NextResponse.json(orders);

    } catch (error) {
        console.error('Analytics API Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
