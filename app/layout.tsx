import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google"; // Restored
import SessionProvider from "@/components/SessionProvider";
import { CartProvider } from "@/lib/context/CartContext";
import { AuthProvider } from "@/lib/context/AuthContext"; // Restored
import { ToastProvider } from "@/lib/context/ToastContext"; // Restored
import { FavoritesProvider } from "@/lib/context/FavoritesContext"; // Restored
import { AddressProvider } from "@/lib/context/AddressContext"; // Restored
import { ReviewsProvider } from "@/lib/context/ReviewsContext"; // Restored
import { NotificationProvider } from "@/lib/context/NotificationContext"; // Restored
import { SupportProvider } from "@/lib/context/SupportContext"; // Restored
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable}`}>
        <SessionProvider>
          <ToastProvider>
            <AuthProvider>
              <NotificationProvider>
                <FavoritesProvider>
                  <AddressProvider>
                    <SupportProvider>
                      <ReviewsProvider>
                        <CartProvider>
                          {children}
                        </CartProvider>
                      </ReviewsProvider>
                    </SupportProvider>
                  </AddressProvider>
                </FavoritesProvider>
              </NotificationProvider>
            </AuthProvider>
          </ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
