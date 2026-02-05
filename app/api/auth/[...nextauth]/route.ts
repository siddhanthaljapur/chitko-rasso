
import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    providers: [
        // Google Provider (Optional, requires Client ID/Secret)
        // GoogleProvider({
        //   clientId: process.env.GOOGLE_CLIENT_ID!,
        //   clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        // }),

        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
                code: { label: "Code", type: "text" }
            },
            async authorize(credentials) {
                await dbConnect();

                // --- 1. OTP LOGIN FLOW (Email + Code) ---
                if (credentials?.email && credentials?.code) {
                    const OTP = (await import("@/models/OTP")).default;
                    const email = credentials.email.toLowerCase();
                    const code = credentials.code;

                    console.log(`[NextAuth] Attempting OTP Login for ${email} with code ${code}`);

                    // Verify OTP
                    const otpRecord = await OTP.findOne({ email, code });

                    if (!otpRecord) {
                        console.log(`[NextAuth] OTP Verification Failed for ${email}. Record not found.`);
                        throw new Error('Invalid verification code');
                    }

                    console.log(`[NextAuth] OTP Verified for ${email}`);
                    // Remove used OTP
                    await OTP.deleteOne({ _id: otpRecord._id });

                    // Find User
                    const user = await User.findOne({ email: credentials.email });
                    if (!user) {
                        throw new Error('User not found. Please sign up first.');
                    }

                    return {
                        id: user._id.toString(),
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        phone: user.phone
                    };
                }

                // --- 2. EMAIL/PASSWORD FLOW ---
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Please enter an email and password');
                }

                // Check user
                const user = await User.findOne({ email: credentials.email }).select('+password');

                if (!user) {
                    throw new Error('No user found with this email');
                }

                // Check password
                const isMatch = await bcrypt.compare(credentials.password, user.password);

                if (!isMatch) {
                    throw new Error('Invalid password');
                }

                return {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    phone: user.phone
                };
            }
        })
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
                token.phone = (user as any).phone;
            }
            // Handle session updates from profile changes
            if (trigger === "update") {
                if (session?.name) token.name = session.name;
                if ((session as any)?.phone) token.phone = (session as any).phone;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).role = token.role;
                (session.user as any).id = token.id;
                (session.user as any).phone = token.phone;
            }
            return session;
        }
    },
    pages: {
        signIn: '/login', // Custom login page
        error: '/login',
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
