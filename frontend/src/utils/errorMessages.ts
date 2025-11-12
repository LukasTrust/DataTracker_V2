/**
 * Error Message Utility
 * 
 * Dieses Modul transformiert technische Fehlermeldungen in benutzerfreundliche,
 * kontextbezogene Texte. Es unterscheidet zwischen:
 * - Backend-Fehlern (API-Responses mit spezifischen Error Codes)
 * - Frontend-Fehlern (Validierung, Netzwerk, etc.)
 * - Allgemeinen Fehlern
 */

// ============================================================================
// Typen & Interfaces
// ============================================================================

export interface ErrorContext {
  /** Aktion die fehlgeschlagen ist (z.B. 'create', 'update', 'delete') */
  action?: 'create' | 'update' | 'delete' | 'fetch' | 'export' | 'duplicate'
  /** Typ der Entität (z.B. 'category', 'entry') */
  entityType?: 'category' | 'entry' | 'data'
  /** Name der Entität für personalisierte Meldungen */
  entityName?: string
}

export interface ParsedError {
  /** Benutzerfreundliche Hauptmeldung */
  message: string
  /** Optionale detaillierte Erklärung */
  details?: string
  /** Vorschlag zur Lösung */
  suggestion?: string
  /** Fehlertyp für weitere Verarbeitung */
  type: 'backend' | 'frontend' | 'network' | 'unknown'
}

// ============================================================================
// Backend Error Mappings
// ============================================================================

/**
 * Mapping von Backend-Fehlermeldungen zu benutzerfreundlichen Texten
 * Key = Backend-Error-String oder Teil davon
 */
const BACKEND_ERROR_MESSAGES: Record<string, { message: string; suggestion?: string }> = {
  // Duplikat-Fehler
  'already exists': {
    message: 'Dieser Eintrag existiert bereits.',
    suggestion: 'Bitte wähle ein anderes Datum oder aktualisiere den bestehenden Eintrag.',
  },
  'duplicate': {
    message: 'Dieser Eintrag existiert bereits für dieses Datum.',
    suggestion: 'Du kannst den bestehenden Eintrag bearbeiten oder ein anderes Datum wählen.',
  },
  'UNIQUE constraint failed': {
    message: 'Ein Eintrag für dieses Datum existiert bereits.',
    suggestion: 'Bitte wähle einen anderen Monat oder bearbeite den vorhandenen Eintrag.',
  },
  
  // Validierungsfehler
  'Invalid date format': {
    message: 'Das Datumsformat ist ungültig.',
    suggestion: 'Bitte verwende das Format JJJJ-MM (z.B. 2024-03).',
  },
  'date must be in YYYY-MM format': {
    message: 'Das Datum muss im Format JJJJ-MM sein.',
    suggestion: 'Beispiel: 2024-03 für März 2024.',
  },
  'Invalid value format': {
    message: 'Der eingegebene Wert ist ungültig.',
    suggestion: 'Bitte gib eine Zahl ein (z.B. 42 oder 42.50).',
  },
  'Invalid deposit format': {
    message: 'Die eingegebene Einzahlung ist ungültig.',
    suggestion: 'Bitte gib einen gültigen Betrag ein (z.B. 100 oder 100.50).',
  },
  
  // Nicht gefunden
  'not found': {
    message: 'Der gesuchte Eintrag wurde nicht gefunden.',
    suggestion: 'Möglicherweise wurde er bereits gelöscht. Bitte aktualisiere die Seite.',
  },
  'Category not found': {
    message: 'Diese Kategorie existiert nicht mehr.',
    suggestion: 'Bitte aktualisiere die Seite oder kehre zur Übersicht zurück.',
  },
  'Entry not found': {
    message: 'Dieser Eintrag wurde nicht gefunden.',
    suggestion: 'Er wurde möglicherweise bereits gelöscht. Bitte aktualisiere die Seite.',
  },
  
  // Berechtigungen
  'does not belong to category': {
    message: 'Dieser Eintrag gehört nicht zu dieser Kategorie.',
    suggestion: 'Bitte überprüfe deine Auswahl.',
  },
  'category_id mismatch': {
    message: 'Die Kategorie-Zuordnung stimmt nicht überein.',
    suggestion: 'Bitte versuche es erneut oder lade die Seite neu.',
  },
  
  // Server-Fehler
  'Internal Server Error': {
    message: 'Es ist ein interner Serverfehler aufgetreten.',
    suggestion: 'Bitte versuche es später erneut oder kontaktiere den Support.',
  },
  'Failed to create': {
    message: 'Das Erstellen ist fehlgeschlagen.',
    suggestion: 'Bitte überprüfe deine Eingaben und versuche es erneut.',
  },
  'Failed to update': {
    message: 'Das Aktualisieren ist fehlgeschlagen.',
    suggestion: 'Bitte überprüfe deine Eingaben und versuche es erneut.',
  },
  'Failed to delete': {
    message: 'Das Löschen ist fehlgeschlagen.',
    suggestion: 'Bitte versuche es erneut.',
  },
}

// ============================================================================
// Frontend Error Messages
// ============================================================================

/**
 * Vordefinierte Frontend-Fehlermeldungen für häufige Validierungsszenarien
 */
export const FRONTEND_ERRORS = {
  REQUIRED_FIELD: {
    message: 'Bitte fülle alle Pflichtfelder aus.',
    suggestion: 'Felder mit einem * sind erforderlich.',
  },
  INVALID_NUMBER: {
    message: 'Bitte gib eine gültige Zahl ein.',
    suggestion: 'Du kannst sowohl Komma als auch Punkt verwenden (z.B. 42,5 oder 42.5).',
  },
  ZERO_VALUE: {
    message: 'Der Wert darf nicht 0 sein.',
    suggestion: 'Bitte gib einen Wert größer oder kleiner als 0 ein.',
  },
  EMPTY_NAME: {
    message: 'Bitte gib einen Namen ein.',
    suggestion: 'Der Name darf nicht leer sein.',
  },
  INVALID_DATE: {
    message: 'Das gewählte Datum ist ungültig.',
    suggestion: 'Bitte wähle ein gültiges Datum aus.',
  },
  NO_CHANGES: {
    message: 'Es wurden keine Änderungen vorgenommen.',
    suggestion: 'Bitte bearbeite mindestens ein Feld, bevor du speicherst.',
  },
  NETWORK_ERROR: {
    message: 'Keine Verbindung zum Server.',
    suggestion: 'Bitte überprüfe deine Internetverbindung und versuche es erneut.',
  },
} as const

// ============================================================================
// Error Parsing Functions
// ============================================================================

/**
 * Prüft ob ein Fehler vom Backend stammt
 * Backend-Fehler haben typischerweise eine response-Eigenschaft
 */
function isBackendError(error: any): boolean {
  return !!(error?.response || error?.status || error?.data)
}

/**
 * Prüft ob ein Fehler ein Netzwerkfehler ist
 */
function isNetworkError(error: any): boolean {
  return (
    error?.message?.toLowerCase().includes('network') ||
    error?.message?.toLowerCase().includes('timeout') ||
    error?.code === 'ECONNABORTED' ||
    error?.code === 'ERR_NETWORK' ||
    !error?.response
  )
}

/**
 * Extrahiert die Backend-Fehlermeldung aus verschiedenen Fehlerformaten
 */
function extractBackendMessage(error: any): string | null {
  // Axios Response Format
  if (error.response?.data) {
    const data = error.response.data
    return data.detail || data.message || data.error || null
  }
  
  // Direktes Error-Objekt mit message
  if (error.message) {
    return error.message
  }
  
  // String als data
  if (typeof error.data === 'string') {
    return error.data
  }
  
  return null
}

/**
 * Findet die beste Übereinstimmung im Error-Mapping
 */
function findBestErrorMatch(errorMessage: string): { message: string; suggestion?: string } | null {
  const lowerMessage = errorMessage.toLowerCase()
  
  // Suche nach exakter oder teilweiser Übereinstimmung
  for (const [key, value] of Object.entries(BACKEND_ERROR_MESSAGES)) {
    if (lowerMessage.includes(key.toLowerCase())) {
      return value
    }
  }
  
  return null
}

/**
 * Generiert eine kontextbezogene Fehlermeldung basierend auf der Aktion
 */
function generateContextualMessage(
  action?: ErrorContext['action'],
  entityType?: ErrorContext['entityType'],
  entityName?: string
): string {
  switch (action) {
    case 'create':
      return `Beim Erstellen ${entityType === 'entry' ? 'des Eintrags' : entityType === 'category' ? 'der Kategorie' : 'der Daten'} ist ein Fehler aufgetreten.`
    case 'update':
      return `Beim Aktualisieren ${entityType === 'entry' ? 'des Eintrags' : entityType === 'category' ? 'der Kategorie' : 'der Daten'} ist ein Fehler aufgetreten.`
    case 'delete':
      return `Beim Löschen ${entityType === 'entry' ? 'des Eintrags' : entityType === 'category' ? 'der Kategorie' : 'der Daten'} ist ein Fehler aufgetreten.`
    case 'fetch':
      return `Beim Laden ${entityType === 'entry' ? 'der Einträge' : entityType === 'category' ? 'der Kategorien' : 'der Daten'} ist ein Fehler aufgetreten.`
    case 'export':
      return `Beim Exportieren ${entityName ? `von "${entityName}"` : 'der Daten'} ist ein Fehler aufgetreten.`
    case 'duplicate':
      return `Beim Duplizieren ${entityType === 'category' ? 'der Kategorie' : 'der Daten'} ist ein Fehler aufgetreten.`
    default:
      return 'Es ist ein Fehler aufgetreten.'
  }
}

// ============================================================================
// Main Parse Function
// ============================================================================

/**
 * Hauptfunktion: Parst einen Fehler und gibt benutzerfreundliche Meldungen zurück
 * 
 * @param error - Der zu parsende Fehler (kann verschiedene Formate haben)
 * @param context - Optionaler Kontext für spezifischere Meldungen
 * @returns ParsedError-Objekt mit message, details und suggestion
 * 
 * @example
 * ```ts
 * try {
 *   await createEntry(data)
 * } catch (error) {
 *   const parsed = parseError(error, { action: 'create', entityType: 'entry' })
 *   showError(parsed.message, parsed.suggestion)
 * }
 * ```
 */
export function parseError(error: any, context?: ErrorContext): ParsedError {
  // Netzwerkfehler haben höchste Priorität
  if (isNetworkError(error)) {
    return {
      message: FRONTEND_ERRORS.NETWORK_ERROR.message,
      suggestion: FRONTEND_ERRORS.NETWORK_ERROR.suggestion,
      type: 'network',
    }
  }
  
  // Backend-Fehler
  if (isBackendError(error)) {
    const backendMessage = extractBackendMessage(error)
    
    if (backendMessage) {
      // Suche nach bekanntem Fehler im Mapping
      const match = findBestErrorMatch(backendMessage)
      
      if (match) {
        return {
          message: match.message,
          suggestion: match.suggestion,
          details: context ? generateContextualMessage(context.action, context.entityType, context.entityName) : undefined,
          type: 'backend',
        }
      }
      
      // Backend-Fehler ohne Match: Zeige Backend-Meldung mit Kontext
      return {
        message: backendMessage,
        details: context ? generateContextualMessage(context.action, context.entityType, context.entityName) : undefined,
        type: 'backend',
      }
    }
  }
  
  // Frontend-Fehler oder unbekannt
  const fallbackMessage = context 
    ? generateContextualMessage(context.action, context.entityType, context.entityName)
    : 'Es ist ein unerwarteter Fehler aufgetreten.'
  
  return {
    message: fallbackMessage,
    suggestion: 'Bitte versuche es erneut oder lade die Seite neu.',
    type: error?.response ? 'backend' : 'frontend',
  }
}

/**
 * Hilfsfunktion: Erstellt eine vollständige Fehlermeldung aus ParsedError
 * Kombiniert message und suggestion zu einem einzigen String
 */
export function formatErrorMessage(parsed: ParsedError): string {
  if (parsed.suggestion) {
    return `${parsed.message} ${parsed.suggestion}`
  }
  return parsed.message
}

/**
 * Hilfsfunktion: Erstellt eine mehrzeilige Fehlermeldung
 * Für Notifications die längere Texte unterstützen
 */
export function formatDetailedErrorMessage(parsed: ParsedError): string {
  const parts: string[] = [parsed.message]
  
  if (parsed.details) {
    parts.push(parsed.details)
  }
  
  if (parsed.suggestion) {
    parts.push(`💡 ${parsed.suggestion}`)
  }
  
  return parts.join('\n')
}
