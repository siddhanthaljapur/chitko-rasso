import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { CartProvider } from "@/lib/context/CartContext";
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

export const metadata: Metadata = {
  title: "CHITKO RASSO - Authentic Saoji Flavours from Nagpur",
  description: "Order authentic Saoji-style cuisine from CHITKO RASSO cloud kitchen in Secunderabad. Spicy starters, biryanis, thalis, and more delivered to your door.",
  keywords: ["Saoji food", "cloud kitchen", "Secunderabad", "biryani", "spicy food", "Indian cuisine"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable}`}>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
