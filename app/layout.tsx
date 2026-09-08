import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";

export const metadata: Metadata = {
  title: "Hanami",
  description: "Hanami",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}