/**
 * List of countries with phone prefixes for WhatsApp
 * Format: { code: 'UY', name: 'Uruguay', prefix: '598', flag: '🇺🇾', phoneLength: 8, phonePattern: '2-3-3' }
 * phoneLength: Expected number of digits (e.g., 8 for Uruguay)
 * phonePattern: Spacing pattern (e.g., '2-3-3' = 2 digits, space, 3 digits, space, 3 digits)
 */
export const COUNTRIES = [
  // Latin America
  { code: 'UY', name: 'Uruguay', prefix: '598', flag: '🇺🇾', phoneLength: 8, phonePattern: '2-3-3' },
  { code: 'AR', name: 'Argentina', prefix: '54', flag: '🇦🇷', phoneLength: 10, phonePattern: '2-4-4' },
  { code: 'BR', name: 'Brasil', prefix: '55', flag: '🇧🇷', phoneLength: 10, phonePattern: '2-5-3' },
  { code: 'CL', name: 'Chile', prefix: '56', flag: '🇨🇱', phoneLength: 9, phonePattern: '2-4-3' },
  { code: 'CO', name: 'Colombia', prefix: '57', flag: '🇨🇴', phoneLength: 10, phonePattern: '3-3-4' },
  { code: 'EC', name: 'Ecuador', prefix: '593', flag: '🇪🇨', phoneLength: 9, phonePattern: '2-4-3' },
  { code: 'PE', name: 'Perú', prefix: '51', flag: '🇵🇪', phoneLength: 9, phonePattern: '2-4-3' },
  { code: 'BO', name: 'Bolivia', prefix: '591', flag: '🇧🇴', phoneLength: 8, phonePattern: '3-2-3' },
  { code: 'PY', name: 'Paraguay', prefix: '595', flag: '🇵🇾', phoneLength: 9, phonePattern: '2-4-3' },
  { code: 'MX', name: 'México', prefix: '52', flag: '🇲🇽', phoneLength: 10, phonePattern: '3-3-4' },

  // Europe
  { code: 'ES', name: 'España', prefix: '34', flag: '🇪🇸', phoneLength: 9, phonePattern: '3-3-3' },
  { code: 'GB', name: 'Reino Unido', prefix: '44', flag: '🇬🇧', phoneLength: 10, phonePattern: '4-3-3' },
  { code: 'FR', name: 'Francia', prefix: '33', flag: '🇫🇷', phoneLength: 9, phonePattern: '2-3-2-2' },
  { code: 'DE', name: 'Alemania', prefix: '49', flag: '🇩🇪', phoneLength: 10, phonePattern: '3-3-4' },
  { code: 'IT', name: 'Italia', prefix: '39', flag: '🇮🇹', phoneLength: 10, phonePattern: '3-3-4' },
  { code: 'PT', name: 'Portugal', prefix: '351', flag: '🇵🇹', phoneLength: 9, phonePattern: '2-4-3' },

  // North America
  { code: 'US', name: 'Estados Unidos', prefix: '1', flag: '🇺🇸', phoneLength: 10, phonePattern: '3-3-4' },
  { code: 'CA', name: 'Canadá', prefix: '1', flag: '🇨🇦', phoneLength: 10, phonePattern: '3-3-4' },

  // Asia-Pacific
  { code: 'AU', name: 'Australia', prefix: '61', flag: '🇦🇺', phoneLength: 9, phonePattern: '2-4-3' },
  { code: 'NZ', name: 'Nueva Zelanda', prefix: '64', flag: '🇳🇿', phoneLength: 9, phonePattern: '2-4-3' },
  { code: 'JP', name: 'Japón', prefix: '81', flag: '🇯🇵', phoneLength: 10, phonePattern: '2-4-4' },
  { code: 'CN', name: 'China', prefix: '86', flag: '🇨🇳', phoneLength: 11, phonePattern: '3-4-4' },
  { code: 'IN', name: 'India', prefix: '91', flag: '🇮🇳', phoneLength: 10, phonePattern: '3-3-4' },
];

export const DEFAULT_COUNTRY = COUNTRIES.find(c => c.code === 'UY') || COUNTRIES[0];

/**
 * Format phone number for display with spaces based on country pattern
 * @param {string} digits - Phone digits without prefix (e.g., '98123456')
 * @param {string} phonePattern - Pattern like '2-3-3' or '3-3-4'
 * @returns {string} - Formatted phone with spaces (e.g., '98 123 456')
 */
export const formatPhoneDisplay = (digits, phonePattern = '2-3-3') => {
  if (!digits) return '';

  const groups = phonePattern.split('-').map(Number);
  const parts = [];
  let pos = 0;

  // Apply pattern groups
  for (const groupSize of groups) {
    if (pos >= digits.length) break;
    parts.push(digits.slice(pos, pos + groupSize));
    pos += groupSize;
  }

  // Add any remaining digits as final group
  if (pos < digits.length) {
    parts.push(digits.slice(pos));
  }

  return parts.join(' ');
};

/**
 * Format phone number with country prefix
 * @param {string} countryPrefix - Country prefix (e.g., '598')
 * @param {string} phoneNumber - Phone number without prefix
 * @returns {string} - Formatted phone number
 */
export const formatPhoneWithPrefix = (countryPrefix, phoneNumber) => {
  if (!phoneNumber) return '';
  const cleanDigits = phoneNumber.replace(/\D/g, '');
  return countryPrefix + cleanDigits;
};

/**
 * Extract country and phone from stored number
 * @param {string} storedNumber - Full phone number (e.g., '59898123456')
 * @returns {object} - { country, phoneNumber }
 */
export const extractCountryAndPhone = (storedNumber) => {
  if (!storedNumber) return { country: DEFAULT_COUNTRY, phoneNumber: '' };

  for (const country of COUNTRIES) {
    if (storedNumber.startsWith(country.prefix)) {
      const phoneNumber = storedNumber.slice(country.prefix.length);
      return { country, phoneNumber };
    }
  }

  // Default to Uruguay if prefix not recognized
  return { country: DEFAULT_COUNTRY, phoneNumber: storedNumber };
};
