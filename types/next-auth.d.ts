
import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: {
            /** The user's unique identifier. */
            id: string
            /** The user's role. */
            role: 'user' | 'admin'
        } & DefaultSession["user"]
    }

    interface User {
        id: string
        role: 'user' | 'admin'
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role: 'user' | 'admin'
        id: string
    }
}
