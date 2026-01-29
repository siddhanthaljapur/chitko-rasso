import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();

        // Create signature for verification
        const sign = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
            .update(sign.toString())
            .digest('hex');

        // Verify signature
        if (razorpay_signature === expectedSignature) {
            return NextResponse.json({
                success: true,
                message: 'Payment verified successfully',
            });
        } else {
            return NextResponse.json(
                { success: false, message: 'Invalid signature' },
                { status: 400 }
            );
        }
    } catch (error: any) {
        console.error('Payment verification error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
