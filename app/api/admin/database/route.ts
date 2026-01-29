
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import dbConnect from '@/lib/db';
import mongoose from 'mongoose';
import User from '@/models/User';
import Order from '@/models/Order';
import MenuItem from '@/models/MenuItem';
import Coupon from '@/models/Coupon';
import Settings from '@/models/Settings';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || session.user.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const stats = {
            status: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
            host: mongoose.connection.host,
            name: mongoose.connection.name,
            counts: {
                users: await User.countDocuments(),
                orders: await Order.countDocuments(),
                menuItems: await MenuItem.countDocuments(),
                coupons: await Coupon.countDocuments(),
                settings: await Settings.countDocuments()
            }
        };

        return NextResponse.json(stats);
    } catch (error) {
        console.error('Database Stats Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
