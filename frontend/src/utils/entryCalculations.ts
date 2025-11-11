import { Entry } from '../types/category'

/**
 * Entry Calculation Utilities
 * Zentralisierte Berechnungslogik für Entries
 */

/**
 * Berechnet die Summe für eine Liste von Entries basierend auf dem Kategorietyp
 * 
 * Für "sparen"-Kategorien: Letzter nicht-null Wert
 * Für "normal"-Kategorien: Summe aller Werte
 * 
 * @param entries - Liste der Entries
 * @param categoryType - Typ der Kategorie ('normal' oder 'sparen')
 * @returns Berechnete Summe
 */
export function calculateEntriesSum(entries: Entry[], categoryType: string): number {
  if (entries.length === 0) return 0

  if (categoryType === 'sparen') {
    // Sortiere nach Datum absteigend und nimm den ersten nicht-null Wert
    const sortedEntries = [...entries].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    
    const latestEntry = sortedEntries.find(e => e.value !== null && e.value !== 0)
    return latestEntry?.value ?? 0
  } else {
    // Normale Kategorie: Summe aller Werte
    return entries.reduce((sum, entry) => sum + (entry.value ?? 0), 0)
  }
}

/**
 * Berechnet die Gesamteinzahlungen für Sparen-Kategorien
 * @param entries - Liste der Entries
 * @returns Summe aller Deposits
 */
export function calculateTotalDeposits(entries: Entry[]): number {
  return entries.reduce((sum, entry) => sum + (entry.deposit ?? 0), 0)
}

/**
 * Berechnet den Gewinn/Verlust für Sparen-Kategorien
 * Gewinn = Aktueller Wert - Einzahlungen
 * 
 * @param entries - Liste der Entries
 * @returns Gewinn (positiv) oder Verlust (negativ)
 */
export function calculateProfit(entries: Entry[]): number {
  if (entries.length === 0) return 0
  
  const currentValue = calculateEntriesSum(entries, 'sparen')
  const totalDeposits = calculateTotalDeposits(entries)
  
  return currentValue - totalDeposits
}

/**
 * Berechnet die Performance in Prozent
 * Performance = (Gewinn / Einzahlungen) * 100
 * 
 * @param entries - Liste der Entries
 * @returns Performance in Prozent (z.B. 15.5 für 15,5%)
 */
export function calculatePerformance(entries: Entry[]): number {
  const totalDeposits = calculateTotalDeposits(entries)
  if (totalDeposits === 0) return 0
  
  const profit = calculateProfit(entries)
  return (profit / totalDeposits) * 100
}

/**
 * Berechnet den Durchschnittswert aller Entries
 * @param entries - Liste der Entries
 * @returns Durchschnittswert
 */
export function calculateAverage(entries: Entry[]): number {
  if (entries.length === 0) return 0
  const sum = entries.reduce((acc, entry) => acc + (entry.value ?? 0), 0)
  return sum / entries.length
}

/**
 * Findet den minimalen Wert in den Entries
 * @param entries - Liste der Entries
 * @returns Minimalwert
 */
export function findMinValue(entries: Entry[]): number {
  if (entries.length === 0) return 0
  return Math.min(...entries.map(e => e.value ?? 0))
}

/**
 * Findet den maximalen Wert in den Entries
 * @param entries - Liste der Entries
 * @returns Maximalwert
 */
export function findMaxValue(entries: Entry[]): number {
  if (entries.length === 0) return 0
  return Math.max(...entries.map(e => e.value ?? 0))
}

/**
 * Gruppiert Entries nach Monat
 * @param entries - Liste der Entries
 * @returns Map mit Monat (YYYY-MM) als Key und Entries als Value
 */
export function groupEntriesByMonth(entries: Entry[]): Map<string, Entry[]> {
  const grouped = new Map<string, Entry[]>()
  
  entries.forEach(entry => {
    const month = entry.date.substring(0, 7) // YYYY-MM
    if (!grouped.has(month)) {
      grouped.set(month, [])
    }
    grouped.get(month)!.push(entry)
  })
  
  return grouped
}

/**
 * Berechnet die monatlichen Summen
 * @param entries - Liste der Entries
 * @param categoryType - Typ der Kategorie
 * @returns Array mit { month: string, sum: number }
 */
export function calculateMonthlySums(entries: Entry[], categoryType: string): Array<{ month: string; sum: number }> {
  const grouped = groupEntriesByMonth(entries)
  const result: Array<{ month: string; sum: number }> = []
  
  grouped.forEach((monthEntries, month) => {
    const sum = calculateEntriesSum(monthEntries, categoryType)
    result.push({ month, sum })
  })
  
  // Sortiere nach Monat aufsteigend
  return result.sort((a, b) => a.month.localeCompare(b.month))
}

/**
 * Filtert Entries nach Datumsbereich
 * @param entries - Liste der Entries
 * @param startDate - Startdatum (YYYY-MM-DD) - optional
 * @param endDate - Enddatum (YYYY-MM-DD) - optional
 * @returns Gefilterte Entries
 */
export function filterEntriesByDateRange(
  entries: Entry[], 
  startDate?: string, 
  endDate?: string
): Entry[] {
  return entries.filter(entry => {
    if (startDate && entry.date < startDate) return false
    if (endDate && entry.date > endDate) return false
    return true
  })
}
