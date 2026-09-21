import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";
import { SITE_URL, LEGAL_ENTITY_NAME } from "@/config/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "YAGHAR | Real Estate CRM & GST Invoicing for India",
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
  authors: [{ name: LEGAL_ENTITY_NAME }],
  creator: LEGAL_ENTITY_NAME,
  publisher: LEGAL_ENTITY_NAME,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "YAGHAR | Real Estate CRM & GST Invoicing for India",
    description: "The all-in-one operating system for independent real estate consultants and small brokerages in India. Manage leads, inventory, WhatsApp sharing, site visits, and GST commission invoicing.",
    url: SITE_URL,
    siteName: "YAGHAR",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "YAGHAR - Real Estate CRM & GST Invoicing for India",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "YAGHAR | Real Estate CRM & GST Invoicing for India",
    description: "The all-in-one operating system for independent real estate consultants and small brokerages in India. Manage leads, inventory, WhatsApp sharing, site visits, and GST commission invoicing.",
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        alt: "YAGHAR - Real Estate CRM & GST Invoicing for India",
      },
    ],
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f766e",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "YAGHAR",
  "operatingSystem": "Web Browser",
  "applicationCategory": "BusinessApplication",
  "url": SITE_URL,
  "description": "The all-in-one operating system for independent real estate consultants and small brokerages in India. Manage leads, inventory, WhatsApp sharing, site visits, and GST commission invoicing.",
  "offers": [
    {
      "@type": "Offer",
      "name": "Starter Consultant",
      "price": "999",
      "priceCurrency": "INR",
      "billingDuration": "P1M"
    },
    {
      "@type": "Offer",
      "name": "Pro Broker",
      "price": "2499",
      "priceCurrency": "INR",
      "billingDuration": "P1M"
    },
    {
      "@type": "Offer",
      "name": "Brokerage Team",
      "price": "4999",
      "priceCurrency": "INR",
      "billingDuration": "P1M"
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-slate-50 font-sans antialiased selection:bg-teal-500 selection:text-white pb-20 md:pb-0">
        <AppProvider>
          {children}
          <WhatsAppButton />
        </AppProvider>
      </body>
    </html>
  );
}
