
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import dbConnect from '@/lib/db';
import MenuItem from '@/models/MenuItem';

export async function GET(req: Request) {
    try {
        await dbConnect();

        // Fetch all items from DB
        const menuItems = await MenuItem.find({}); // Fetch ALL for admin to see disabled ones too provided available:false

        // Cache control for performance (60 seconds)
        return NextResponse.json(menuItems, {
            headers: {
                'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=59',
            }
        });
    } catch (error) {
        console.error('Failed to fetch menu:', error);
        return NextResponse.json(
            { message: 'Failed to fetch menu data' },
            { status: 500 }
        );
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

        // Remove 'id' if present, allow mongo to generate _id
        const { id, ...itemData } = body;

        const newItem = await MenuItem.create(itemData);
        return NextResponse.json(newItem, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: 'Error creating item', error }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { _id, id, ...updateData } = body;
        const targetId = _id || id;

        await dbConnect();
        const updatedItem = await MenuItem.findByIdAndUpdate(targetId, updateData, { new: true });
        return NextResponse.json(updatedItem);
    } catch (error) {
        return NextResponse.json({ message: 'Error updating item', error }, { status: 500 });
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
        await MenuItem.findByIdAndDelete(id);

        return NextResponse.json({ message: 'Deleted successfully' });
    } catch (error) {
        return NextResponse.json({ message: 'Error deleting item', error }, { status: 500 });
    }
}
