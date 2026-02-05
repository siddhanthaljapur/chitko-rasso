import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { name, phone } = await req.json();

        if (!name && !phone) {
            return NextResponse.json({ message: 'Nothing to update' }, { status: 400 });
        }

        await dbConnect();

        const updateFields: any = {};
        if (name) updateFields.name = name;
        if (phone) updateFields.phone = phone;

        // Update User via Mongoose
        const updatedUser = await User.findOneAndUpdate(
            { email: session.user.email },
            { $set: updateFields },
            { new: true } // Return updated doc if needed
        );

        if (!updatedUser) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
