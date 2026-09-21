import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";

export const metadata: Metadata = {
  metadataBase: new URL('https://yaghar.netlify.app'),
  title: {
    default: "YAGHAR | The Real Estate Operating System for India 🇮🇳",
    template: "%s | YAGHAR",
  },
  description: "The all-in-one operating system for independent real estate consultants and small brokerages in India. Manage leads, inventory, WhatsApp sharing, site visits, and GST commission invoicing.",
  keywords: [
    "Real Estate CRM India",
    "MahaRERA Real Estate Agent Software",
    "WhatsApp Real Estate CRM",
    "Real Estate Broker Invoicing SAC 997222",
    "Indian Property Consultant Tool",
    "Mumbai Real Estate Broker CRM",
    "Pune Real Estate CRM",
    "Property Matcher India"
  ],
  authors: [{ name: "YAGHAR Technologies" }],
  creator: "YAGHAR",
  publisher: "YAGHAR",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "YAGHAR | The Real Estate Operating System for India 🇮🇳",
    description: "Empowering Indian real estate consultants to close more deals with 1-tap WhatsApp sharing, instant GST tax invoices, and branded consultant microsites.",
    url: "https://yaghar.netlify.app",
    siteName: "YAGHAR",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "YAGHAR | Real Estate OS for India",
    description: "The modern operating system for Indian real estate consultants. Close deals faster on WhatsApp.",
  },
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
