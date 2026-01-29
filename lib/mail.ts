
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const sendOTPEmail = async (to: string, code: string) => {

    // Check if credentials are set
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn('⚠️ SMTP Credentials missing. Logging OTP to console instead.');
        console.log(`📧 [EMAIL SIMULATION] To: ${to}, Code: ${code}`);
        return;
    }

    try {
        const info = await transporter.sendMail({
            from: `"Chitko Rasso" <${process.env.SMTP_USER}>`,
            to,
            subject: 'Verification Code - Chitko Rasso',
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #ff6b35;">Chitko Rasso Verification</h2>
                <p>Hello,</p>
                <p>Your verification code is:</p>
                <div style="background: #f4f4f4; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
                    <h1 style="margin: 0; letter-spacing: 5px; color: #333;">${code}</h1>
                </div>
                <p>This code will expire in 10 minutes.</p>
                <p style="color: #888; font-size: 12px; margin-top: 30px;">If you didn't request this, please ignore this email.</p>
            </div>
            `
        });
        console.log(`✅ Email sent: ${info.messageId}`);
    } catch (error) {
        console.error('❌ Error sending email:', error);
        // Fallback to console log so development doesn't stall if email fails
        console.log(`📧 [Falback] To: ${to}, Code: ${code}`);
    }
};
