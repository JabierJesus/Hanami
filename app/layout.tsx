import type { Metadata } from "next";
import { Noto_Sans_JP, Noto_Serif_JP } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import CartButton from "@/components/CartButton";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
});

const notoSerifJP = Noto_Serif_JP({
  variable: "--font-noto-serif-jp",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hanami",
  description: "Mochis, taiyakis, onigiris y más.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${notoSansJP.variable} ${notoSerifJP.variable}`}
      >
        <CartProvider>
          {children}
          <CartButton />
        </CartProvider>
      </body>
    </html>
  );
}  