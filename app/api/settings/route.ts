import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import dbConnect from '@/lib/db';
import Settings from '@/models/Settings';

export async function GET(req: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const key = searchParams.get('key');

        if (key) {
            const setting = await Settings.findOne({ key });
            return NextResponse.json({ value: setting ? setting.value : null });
        }

        const settings = await Settings.find({});
        return NextResponse.json(settings);
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching settings' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { key, value } = body;

        await dbConnect();
        const setting = await Settings.findOneAndUpdate(
            { key },
            { value, updatedBy: session.user.email },
            { upsert: true, new: true }
        );

        return NextResponse.json(setting);
    } catch (error) {
        return NextResponse.json({ message: 'Error updating settings' }, { status: 500 });
    }
}
