// Centralized Business Configuration for YAGHAR
// Any UI element whose value is empty must be hidden, never rendered broken.

// TODO(owner): set the registered entity name
export const LEGAL_ENTITY_NAME = "YAGHAR";

export const SUPPORT_EMAIL = "yagharinfo@gmail.com";
export const SUPPORT_WHATSAPP = "917977132923"; // wa.me format: country code + number, no "+" or spaces
export const SUPPORT_WHATSAPP_DISPLAY = "+91 79771 32923";

// Single constant; used for canonical, og:url, sitemap, JSON-LD, so a custom domain later is a one-line change
export const SITE_URL = "https://yaghar.netlify.app";

// Video slot in #demo section (hidden while empty)
export const DEMO_VIDEO_URL = "";

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  agency: string;
  city: string;
  rating?: number;
}

// Component renders nothing while empty. NEVER invent fake testimonials.
export const TESTIMONIALS: Testimonial[] = [];

// Helper URL for WhatsApp click-to-chat
export const WHATSAPP_CHAT_URL = `https://wa.me/${SUPPORT_WHATSAPP}?text=Hi%20YAGHAR%2C%20I%20want%20to%20know%20more`;
