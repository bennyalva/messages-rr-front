import type { Metadata } from "next";
import localFont from "next/font/local";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import StoreProvider from "@/lib/store/StoreProvider";
import ThemeSynchronizer from "@/components/ThemeSynchronizer";

const roboto = localFont({
  src: [
    { path: "../public/assets/fonts/Roboto-Thin.ttf", weight: "100", style: "normal" },
    { path: "../public/assets/fonts/Roboto-ThinItalic.ttf", weight: "100", style: "italic" },
    { path: "../public/assets/fonts/Roboto-Light.ttf", weight: "300", style: "normal" },
    { path: "../public/assets/fonts/Roboto-LightItalic.ttf", weight: "300", style: "italic" },
    { path: "../public/assets/fonts/Roboto-Regular.ttf", weight: "400", style: "normal" },
    { path: "../public/assets/fonts/Roboto-Italic.ttf", weight: "400", style: "italic" },
    { path: "../public/assets/fonts/Roboto-Medium.ttf", weight: "500", style: "normal" },
    { path: "../public/assets/fonts/Roboto-MediumItalic.ttf", weight: "500", style: "italic" },
    { path: "../public/assets/fonts/Roboto-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../public/assets/fonts/Roboto-SemiBoldItalic.ttf", weight: "600", style: "italic" },
    { path: "../public/assets/fonts/Roboto-Bold.ttf", weight: "700", style: "normal" },
    { path: "../public/assets/fonts/Roboto-BoldItalic.ttf", weight: "700", style: "italic" },
    { path: "../public/assets/fonts/Roboto-ExtraBold.ttf", weight: "800", style: "normal" },
    { path: "../public/assets/fonts/Roboto-ExtraBoldItalic.ttf", weight: "800", style: "italic" },
    { path: "../public/assets/fonts/Roboto-Black.ttf", weight: "900", style: "normal" },
    { path: "../public/assets/fonts/Roboto-BlackItalic.ttf", weight: "900", style: "italic" },
  ],
  variable: "--font-roboto",
  display: "swap",
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
        className={`${roboto.variable} ${geistMono.variable} antialiased`}
      >
        <StoreProvider>
          <ThemeSynchronizer />
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}

