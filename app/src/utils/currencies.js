
export const SUPPORTED_CURRENCIES = [
    { value: 'BRL', label: 'Real (R$)', symbol: 'R$', flag: '🇧🇷' },
    { value: 'SGD', label: 'Dólar de Singapura', symbol: 'S$', flag: '🇸🇬' },
    { value: 'THB', label: 'Baht Tailandês', symbol: '฿', flag: '🇹🇭' },
    { value: 'PHP', label: 'Peso Filipino', symbol: '₱', flag: '🇵🇭' },
    { value: 'HKD', label: 'Dólar de Hong Kong', symbol: 'HK$', flag: '🇭🇰' },
    { value: 'MOP', label: 'Pataca de Macau', symbol: 'MOP$', flag: '🇲🇴' },
    { value: 'CNY', label: 'Yuan Chinês', symbol: '¥', flag: '🇨🇳' },
    { value: 'KRW', label: 'Won Sul-Coreano', symbol: '₩', flag: '🇰🇷' },
    { value: 'JPY', label: 'Iene Japonês', symbol: '¥', flag: '🇯🇵' },
    { value: 'AED', label: 'Dirham dos EAU', symbol: 'AED', flag: '🇦🇪' },
    { value: 'QAR', label: 'Riyal do Catar', symbol: 'QR', flag: '🇶🇦' },
];

let cachedRates = null;
let lastFetchTime = 0;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

export async function fetchExchangeRates() {
    const now = Date.now();
    if (cachedRates && (now - lastFetchTime < CACHE_DURATION)) {
        return cachedRates;
    }

    try {
        const response = await fetch('https://open.er-api.com/v6/latest/BRL');
        if (!response.ok) throw new Error('Failed to fetch exchange rates');
        const data = await response.json();
        if (data.result === 'success') {
            cachedRates = data.rates;
            lastFetchTime = now;
            return cachedRates;
        }
        throw new Error('API returned error');
    } catch (error) {
        console.error('Exchange rate fetch error:', error);
        // Return null or a basic fallback if necessary
        return null;
    }
}

/**
 * Converts a value from a foreign currency to BRL.
 * @param {number} value - The amount in the foreign currency.
 * @param {string} fromCurrency - The currency code (e.g., 'SGD').
 * @param {object} rates - The rates object from fetchExchangeRates.
 * @returns {number} The converted value in BRL.
 */
export function convertToBRL(value, fromCurrency, rates) {
    if (!value || fromCurrency === 'BRL') return value;
    if (!rates || !rates[fromCurrency]) return 0;

    // API returns 1 BRL = X Currency
    // So BRL value = Value / X
    return value / rates[fromCurrency];
}

/**
 * Gets the value of 1 unit of foreign currency in BRL.
 * @param {string} fromCurrency - The currency code (e.g., 'SGD').
 * @param {object} rates - The rates object.
 * @returns {number} The value of 1 unit in BRL.
 */
export function getBRLRate(fromCurrency, rates) {
    if (fromCurrency === 'BRL') return 1;
    if (!rates || !rates[fromCurrency]) return 0;
    return 1 / rates[fromCurrency];
}
