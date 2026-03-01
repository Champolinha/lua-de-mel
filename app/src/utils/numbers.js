/**
 * Extrai um número de string (aceita "600", "600,00", "R$ 600,00", etc.) ou retorna o número.
 */
export function extractFloat(str) {
    if (str == null) return 0;
    if (typeof str === 'number' && !Number.isNaN(str)) return str;
    if (typeof str !== 'string') return 0;
    const cleaned = str.replace(/[^\d,-]/g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
}
