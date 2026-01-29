
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

        // Wait for params to be available (Next.js 15+ async params, but current setups might differ, standard approach is fine)
        // Note: In Next.js App Router, params is a promise in newer versions, but if this is an older setup check... 
        // We will assume standard behavior or use await params if required. 
        // Actually, route handlers receive `params` as second arg. In Next 15 it's async. 
        // For safety in this environment (Next 16 mentioned in package.json), we treat it as async/await compatible.

        const { id } = await params;

        const order = await Order.findById(id);

        if (!order) {
            return NextResponse.json({ message: 'Order not found' }, { status: 404 });
        }

        // Security: Ensure user owns the order
        if (order.userId.toString() !== session.user.id) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        return NextResponse.json(order);
    } catch (error) {
        console.error('Fetch Order Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
