/**
 * Date Formatting Utilities
 * Zentralisierte Funktionen für Datumsformatierung
 */

/**
 * Formatiert ein ISO-Datum (YYYY-MM-DD) zu DD.MM.YYYY
 * @param dateString - ISO Date String (z.B. "2024-01-15")
 * @returns Formatiertes Datum (z.B. "15.01.2024")
 */
export function formatDateGerman(dateString: string): string {
  const date = new Date(dateString)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}.${month}.${year}`
}

/**
 * Formatiert ein Datum zu YYYY-MM-DD für Input-Felder
 * @param date - Date Objekt
 * @returns ISO Date String (YYYY-MM-DD)
 */
export function formatDateISO(date: Date = new Date()): string {
  return date.toISOString().split('T')[0]
}

/**
 * Gibt das heutige Datum im Format YYYY-MM-DD zurück
 * @returns Heutiges Datum (YYYY-MM-DD)
 */
export function getTodayISO(): string {
  return formatDateISO(new Date())
}

/**
 * Formatiert ein Datum zu YYYY-MM für Monats-Auswahl
 * @param date - Date Objekt
 * @returns Month String (YYYY-MM)
 */
export function formatMonth(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

/**
 * Parsed ein deutsches Datum (DD.MM.YYYY) zu Date
 * @param dateString - Deutsches Datum (z.B. "15.01.2024")
 * @returns Date Objekt
 */
export function parseGermanDate(dateString: string): Date {
  const [day, month, year] = dateString.split('.')
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
}

/**
 * Gibt den ersten Tag des aktuellen Monats zurück (YYYY-MM-DD)
 */
export function getFirstDayOfMonth(date: Date = new Date()): string {
  return formatDateISO(new Date(date.getFullYear(), date.getMonth(), 1))
}

/**
 * Gibt den letzten Tag des aktuellen Monats zurück (YYYY-MM-DD)
 */
export function getLastDayOfMonth(date: Date = new Date()): string {
  return formatDateISO(new Date(date.getFullYear(), date.getMonth() + 1, 0))
}

/**
 * Gibt den Monatsnamen auf Deutsch zurück
 * @param monthIndex - Monat (0-11)
 * @returns Monatsname (z.B. "Januar")
 */
export function getMonthNameGerman(monthIndex: number): string {
  const months = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ]
  return months[monthIndex]
}

/**
 * Berechnet die Differenz zwischen zwei Daten in Tagen
 * @param date1 - Erstes Datum
 * @param date2 - Zweites Datum
 * @returns Anzahl der Tage
 */
export function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  const diffTime = Math.abs(d2.getTime() - d1.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}
