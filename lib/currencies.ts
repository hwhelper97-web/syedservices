export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  decimals: number;
  locale: string;
}

export const SUPPORTED_CURRENCIES: CurrencyInfo[] = [
  // Primary regional currencies
  { code: "PKR", name: "Pakistani Rupee", symbol: "Rs", decimals: 2, locale: "en-PK" },
  { code: "USD", name: "US Dollar", symbol: "$", decimals: 2, locale: "en-US" },
  { code: "AED", name: "UAE Dirham", symbol: "AED", decimals: 2, locale: "ar-AE" },
  { code: "SAR", name: "Saudi Riyal", symbol: "SAR", decimals: 2, locale: "ar-SA" },
  { code: "AFN", name: "Afghan Afghani", symbol: "؋", decimals: 2, locale: "ps-AF" },
  { code: "EUR", name: "Euro", symbol: "€", decimals: 2, locale: "de-DE" },
  { code: "GBP", name: "British Pound", symbol: "£", decimals: 2, locale: "en-GB" },
  { code: "CAD", name: "Canadian Dollar", symbol: "CA$", decimals: 2, locale: "en-CA" },
  { code: "AUD", name: "Australian Dollar", symbol: "AU$", decimals: 2, locale: "en-AU" },
  { code: "QAR", name: "Qatari Riyal", symbol: "QAR", decimals: 2, locale: "ar-QA" },
  { code: "OMR", name: "Omani Rial", symbol: "OMR", decimals: 3, locale: "ar-OM" },
  { code: "KWD", name: "Kuwaiti Dinar", symbol: "KWD", decimals: 3, locale: "ar-KW" },
  { code: "BHD", name: "Bahraini Dinar", symbol: "BHD", decimals: 3, locale: "ar-BH" },
  { code: "TRY", name: "Turkish Lira", symbol: "₺", decimals: 2, locale: "tr-TR" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥", decimals: 2, locale: "zh-CN" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", decimals: 0, locale: "ja-JP" },
  { code: "INR", name: "Indian Rupee", symbol: "₹", decimals: 2, locale: "en-IN" },
  { code: "BDT", name: "Bangladeshi Taka", symbol: "৳", decimals: 2, locale: "bn-BD" },
  { code: "MYR", name: "Malaysian Ringgit", symbol: "RM", decimals: 2, locale: "ms-MY" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$", decimals: 2, locale: "en-SG" },
  { code: "THB", name: "Thai Baht", symbol: "฿", decimals: 2, locale: "th-TH" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF", decimals: 2, locale: "de-CH" },
  { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$", decimals: 2, locale: "en-NZ" },
  { code: "ZAR", name: "South African Rand", symbol: "R", decimals: 2, locale: "en-ZA" },
  { code: "RUB", name: "Russian Ruble", symbol: "₽", decimals: 2, locale: "ru-RU" },
  { code: "IRR", name: "Iranian Rial", symbol: "IRR", decimals: 0, locale: "fa-IR" },
  { code: "EGP", name: "Egyptian Pound", symbol: "E£", decimals: 2, locale: "ar-EG" },
  { code: "UZS", name: "Uzbekistani Som", symbol: "UZS", decimals: 2, locale: "uz-UZ" },
  { code: "KZT", name: "Kazakhstani Tenge", symbol: "₸", decimals: 2, locale: "kk-KZ" },
  { code: "AZN", name: "Azerbaijani Manat", symbol: "₼", decimals: 2, locale: "az-AZ" },
  { code: "GEL", name: "Georgian Lari", symbol: "₾", decimals: 2, locale: "ka-GE" },
];

export const DEFAULT_CURRENCY = "PKR";

export function getCurrencyInfo(currencyCode?: string | null): CurrencyInfo {
  if (!currencyCode) {
    return SUPPORTED_CURRENCIES[0];
  }
  const upper = currencyCode.trim().toUpperCase();
  const found = SUPPORTED_CURRENCIES.find((c) => c.code === upper);
  if (found) return found;

  return {
    code: upper,
    name: upper,
    symbol: upper,
    decimals: 2,
    locale: "en-US",
  };
}

export function formatCurrencyAmount(
  amount: number | null | undefined,
  currencyCode?: string | null,
  options?: { showSymbol?: boolean; showCode?: boolean }
): string {
  const num = typeof amount === "number" && !isNaN(amount) ? amount : 0;
  const curr = getCurrencyInfo(currencyCode);
  const showSymbol = options?.showSymbol !== false;
  const showCode = options?.showCode === true;

  try {
    const formatted = new Intl.NumberFormat(curr.locale, {
      minimumFractionDigits: curr.decimals,
      maximumFractionDigits: curr.decimals,
    }).format(num);

    if (showCode) {
      return `${curr.code} ${formatted}`;
    }
    if (showSymbol) {
      return `${curr.symbol} ${formatted}`;
    }
    return formatted;
  } catch {
    const fallback = num.toFixed(curr.decimals);
    if (showCode) return `${curr.code} ${fallback}`;
    if (showSymbol) return `${curr.symbol} ${fallback}`;
    return fallback;
  }
}
