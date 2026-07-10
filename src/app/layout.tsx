import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Alumni Connect",
  description: "Platform untuk menghubungkan alumni dan mengelola komunitas",
  icons: {
    icon: "/favicon.svg",
  },
};

import { Toaster } from "react-hot-toast";
import ThemeToggle from "@/shared/components/ui/theme-toggle";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
