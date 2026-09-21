/**
 * Indian Currency & Number Formatting
 */
export function formatINR(amount: number | null | undefined, options?: { showUnitOnly?: boolean }): string {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹ 0';

  if (amount >= 10000000) {
    const cr = amount / 10000000;
    const formatted = cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(2);
    return options?.showUnitOnly ? `${formatted} Cr` : `₹ ${formatted} Cr`;
  }
  
  if (amount >= 100000) {
    const l = amount / 100000;
    const formatted = l % 1 === 0 ? l.toFixed(0) : l.toFixed(2);
    return options?.showUnitOnly ? `${formatted} L` : `₹ ${formatted} L`;
  }

  const inr = amount.toLocaleString('en-IN');
  return options?.showUnitOnly ? inr : `₹ ${inr}`;
}

export function parseINR(value: string): number {
  const cleaned = value.trim().toLowerCase().replace(/₹|,|\s/g, '');
  if (cleaned.endsWith('cr') || cleaned.endsWith('crore') || cleaned.endsWith('crores')) {
    const num = parseFloat(cleaned.replace(/cr|crore|crores/, ''));
    return isNaN(num) ? 0 : Math.round(num * 10000000);
  }
  if (cleaned.endsWith('l') || cleaned.endsWith('lakh') || cleaned.endsWith('lakhs')) {
    const num = parseFloat(cleaned.replace(/l|lakh|lakhs/, ''));
    return isNaN(num) ? 0 : Math.round(num * 100000);
  }
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Indian Phone Number Normalization
 * Ensures numbers are properly prefixed with +91 and strip spaces/dashes
 */
export function normalizeIndianPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+${digits}`;
  }
  if (phone.startsWith('+')) {
    return phone.replace(/\s+/g, '');
  }
  return `+91${digits.slice(-10)}`;
}

export function formatPhoneDisplay(phone: string): string {
  const cleaned = normalizeIndianPhone(phone);
  if (cleaned.startsWith('+91') && cleaned.length === 13) {
    return `+91 ${cleaned.slice(3, 8)} ${cleaned.slice(8)}`;
  }
  return phone;
}

/**
 * WhatsApp click-to-chat URL generator
 */
export function getWhatsAppUrl(phone: string, text: string): string {
  const normalized = normalizeIndianPhone(phone).replace('+', '');
  return `https://wa.me/${normalized}?text=${encodeURIComponent(text)}`;
}

/**
 * Replace variables in templates
 */
export function replaceTemplateVariables(template: string, variables: Record<string, string>): string {
  let result = template;
  for (const [key, val] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, val || '');
  }
  return result;
}

/**
 * Date and Time formatters
 */
export function formatDate(dateString: string | Date | null | undefined): string {
  if (!dateString) return '-';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(dateString: string | Date | null | undefined): string {
  if (!dateString) return '-';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
