import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";

export const metadata: Metadata = {
  title: "YAGHAR | The Real Estate Operating System for India",
  description: "The all-in-one operating system for independent real estate consultants and small brokerages in India. Manage leads, properties, WhatsApp sharing, site visits, and commission invoicing.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f766e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 font-sans antialiased selection:bg-teal-500 selection:text-white pb-20 md:pb-0">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
