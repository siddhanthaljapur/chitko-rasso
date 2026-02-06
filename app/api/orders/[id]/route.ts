
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import dbConnect from '@/lib/db';
import Order from '@/models/Order';

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const { id } = await params;

        const order = await Order.findById(id);

        if (!order) {
            return NextResponse.json({ message: 'Order not found' }, { status: 404 });
        }

        // Security: Ensure user owns the order OR is admin
        if (order.userId.toString() !== session.user.id && session.user.role !== 'admin') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        return NextResponse.json(order);
    } catch (error) {
        console.error('Fetch Order Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || session.user.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const { id } = await params;
        const body = await req.json();
        const { status } = body;

        const order = await Order.findById(id);
        if (!order) {
            return NextResponse.json({ message: 'Order not found' }, { status: 404 });
        }

        order.status = status;
        order.statusHistory.push({ status, comment: `Status updated to ${status} by Admin` });
        order.updatedAt = new Date();

        await order.save();

        return NextResponse.json({ message: 'Order updated successfully', order });
    } catch (error) {
        console.error('Update Order Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
