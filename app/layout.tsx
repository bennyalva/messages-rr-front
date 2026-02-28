import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import StoreProvider from "@/lib/store/StoreProvider";
import ThemeSynchronizer from "@/components/ThemeSynchronizer";

const geistSans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cabina Digital",
  description: "Para Djs y Sonideros",
  icons: {
    icon: "/favicon-dj.jpeg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <StoreProvider>
          <ThemeSynchronizer />
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}

