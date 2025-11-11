/**
 * Number Formatting Utilities
 * Zentralisierte Funktionen für Zahlenformatierung
 */

/**
 * Formatiert eine Zahl als Währung (Deutsch)
 * @param value - Zahlenwert
 * @param currency - Währungssymbol (Standard: "€")
 * @returns Formatierter String (z.B. "1.234,56 €")
 */
export function formatCurrency(value: number, currency: string = '€'): string {
  return new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value) + ` ${currency}`
}

/**
 * Formatiert eine Zahl mit deutschen Trennzeichen
 * @param value - Zahlenwert
 * @param decimals - Anzahl Dezimalstellen (Standard: 2)
 * @returns Formatierter String (z.B. "1.234,56")
 */
export function formatNumber(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

/**
 * Formatiert eine Zahl als Prozentsatz
 * @param value - Zahlenwert (z.B. 0.1523 für 15,23%)
 * @param decimals - Anzahl Dezimalstellen (Standard: 2)
 * @returns Formatierter String (z.B. "15,23%")
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

/**
 * Formatiert eine Zahl mit Vorzeichen (+/-)
 * @param value - Zahlenwert
 * @param decimals - Anzahl Dezimalstellen (Standard: 2)
 * @returns Formatierter String mit Vorzeichen (z.B. "+1.234,56" oder "-1.234,56")
 */
export function formatNumberWithSign(value: number, decimals: number = 2): string {
  const sign = value >= 0 ? '+' : ''
  return sign + formatNumber(value, decimals)
}

/**
 * Formatiert eine Währung mit Vorzeichen
 * @param value - Zahlenwert
 * @param currency - Währungssymbol (Standard: "€")
 * @returns Formatierter String mit Vorzeichen (z.B. "+1.234,56 €")
 */
export function formatCurrencyWithSign(value: number, currency: string = '€'): string {
  const sign = value >= 0 ? '+' : ''
  return sign + formatCurrency(value, currency)
}

/**
 * Formatiert eine große Zahl in kompakter Form
 * @param value - Zahlenwert
 * @returns Kompakter String (z.B. "1,2K", "3,4M")
 */
export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat('de-DE', {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(value)
}

/**
 * Rundet eine Zahl auf n Dezimalstellen
 * @param value - Zahlenwert
 * @param decimals - Anzahl Dezimalstellen
 * @returns Gerundete Zahl
 */
export function roundToDecimals(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals)
  return Math.round(value * factor) / factor
}

/**
 * Formatiert eine Zahl mit Einheit
 * @param value - Zahlenwert
 * @param unit - Einheit (z.B. "€", "kg", "%")
 * @param decimals - Anzahl Dezimalstellen
 * @returns Formatierter String (z.B. "1.234,56 €")
 */
export function formatValueWithUnit(value: number, unit: string, decimals: number = 2): string {
  const formattedValue = formatNumber(value, decimals)
  return `${formattedValue} ${unit}`
}

/**
 * Parsed einen deutschen Zahlenstring zu number
 * @param value - String mit deutscher Formatierung (z.B. "1.234,56")
 * @returns Zahlenwert
 */
export function parseGermanNumber(value: string): number {
  // Entfernt Tausender-Trennzeichen und ersetzt Komma durch Punkt
  const normalized = value.replace(/\./g, '').replace(',', '.')
  return parseFloat(normalized)
}
