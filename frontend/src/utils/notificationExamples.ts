/**
 * Beispiele für die Verwendung des verbesserten Notification-Systems
 * 
 * Dieses File zeigt Best Practices und häufige Verwendungsszenarien
 */

import { useNotification } from '../contexts/NotificationContext'
import { createEntry, updateEntry, deleteEntry } from '../api'

/**
 * BEISPIEL 1: API-Fehler mit Kontext abfangen
 * =============================================
 * Die empfohlene Methode für alle API-Aufrufe
 */
function Example1_CreateEntry() {
  const { showSuccess, showErrorWithContext } = useNotification()
  
  const handleCreateEntry = async (data: any) => {
    try {
      const newEntry = await createEntry(1, data)
      showSuccess('Eintrag erfolgreich erstellt')
      return newEntry
    } catch (error) {
      // ✅ RICHTIG: Fehler wird automatisch analysiert und kontextualisiert
      showErrorWithContext(error, {
        action: 'create',
        entityType: 'entry',
      })
    }
  }
  
  return { handleCreateEntry }
}

/**
 * BEISPIEL 2: API-Fehler mit Namen der Entität
 * =============================================
 * Für personalisierte Fehlermeldungen
 */
function Example2_UpdateCategory() {
  const { showSuccess, showErrorWithContext } = useNotification()
  
  const handleUpdateCategory = async (categoryId: number, categoryName: string, data: any) => {
    try {
      await updateEntry(categoryId, 123, data)
      showSuccess(`"${categoryName}" erfolgreich aktualisiert`)
    } catch (error) {
      // ✅ RICHTIG: Mit Namen für personalisierte Meldung
      showErrorWithContext(error, {
        action: 'update',
        entityType: 'category',
        entityName: categoryName,
      })
    }
  }
  
  return { handleUpdateCategory }
}

/**
 * BEISPIEL 3: Frontend-Validierung
 * ================================
 * Verwende vordefinierte Validierungsfehler
 */
function Example3_FormValidation() {
  const { showValidationError } = useNotification()
  
  const validateForm = (value: string, deposit: string) => {
    // Prüfe ob Wert leer ist
    if (!value || value.trim() === '') {
      showValidationError('REQUIRED_FIELD')
      return false
    }
    
    // Prüfe ob Wert eine Zahl ist
    const numValue = parseFloat(value.replace(',', '.'))
    if (isNaN(numValue)) {
      showValidationError('INVALID_NUMBER')
      return false
    }
    
    // Prüfe ob Wert null ist
    if (numValue === 0) {
      showValidationError('ZERO_VALUE')
      return false
    }
    
    return true
  }
  
  return { validateForm }
}

/**
 * BEISPIEL 4: Kombinierte Validierung + API-Call
 * ==============================================
 * Zeigt die Kombination von Frontend- und Backend-Fehlerbehandlung
 */
function Example4_CompleteFlow() {
  const { showSuccess, showValidationError, showErrorWithContext } = useNotification()
  
  const handleSaveEntry = async (categoryId: number, formData: { date: string; value: string }) => {
    // Frontend-Validierung
    if (!formData.value || formData.value.trim() === '') {
      showValidationError('REQUIRED_FIELD')
      return
    }
    
    const numValue = parseFloat(formData.value.replace(',', '.'))
    if (isNaN(numValue)) {
      showValidationError('INVALID_NUMBER')
      return
    }
    
    if (numValue === 0) {
      showValidationError('ZERO_VALUE')
      return
    }
    
    // API-Call mit Backend-Fehlerbehandlung
    try {
      const entryData = {
        category_id: categoryId,
        date: formData.date,
        value: numValue,
      }
      
      await createEntry(categoryId, entryData)
      showSuccess('Eintrag erfolgreich erstellt')
    } catch (error) {
      // Backend-Fehler (z.B. Duplikat, Validierung, Server-Fehler)
      showErrorWithContext(error, {
        action: 'create',
        entityType: 'entry',
      })
    }
  }
  
  return { handleSaveEntry }
}

/**
 * BEISPIEL 5: Alte vs. Neue Methode im Vergleich
 * ==============================================
 */
function Example5_Comparison() {
  const { showError, showErrorWithContext } = useNotification()
  
  // ❌ ALT: Unspezifische Meldung
  const oldWay = async () => {
    try {
      await deleteEntry(1, 123)
    } catch (error) {
      showError('Fehler beim Löschen') // Zu allgemein, keine Hilfe
    }
  }
  
  // ✅ NEU: Kontextualisierte Meldung mit automatischer Fehleranalyse
  const newWay = async () => {
    try {
      await deleteEntry(1, 123)
    } catch (error) {
      showErrorWithContext(error, {
        action: 'delete',
        entityType: 'entry',
      })
      // Zeigt z.B.:
      // - "Dieser Eintrag wurde nicht gefunden. Er wurde möglicherweise bereits gelöscht."
      // - "Keine Verbindung zum Server. Bitte überprüfe deine Internetverbindung."
      // - Backend-spezifische Meldung mit Lösungsvorschlag
    }
  }
  
  return { oldWay, newWay }
}

/**
 * BEST PRACTICES
 * ==============
 * 
 * 1. Verwende `showErrorWithContext` für ALLE API-Fehler
 *    - Gibt automatisch spezifische, hilfreiche Meldungen
 *    - Erkennt Backend vs. Frontend vs. Netzwerk-Fehler
 *    - Mapped bekannte Backend-Fehler auf benutzerfreundliche Texte
 * 
 * 2. Verwende `showValidationError` für Frontend-Validierung
 *    - Konsistente Meldungen im ganzen Frontend
 *    - Vordefinierte Texte für häufige Szenarien
 * 
 * 3. Verwende `showError` nur für sehr spezielle Fälle
 *    - Wenn du eine eigene, sehr spezifische Meldung brauchst
 * 
 * 4. Gib immer den Kontext an (action, entityType)
 *    - Hilft bei der Generierung präziser Meldungen
 * 
 * 5. Erfolgreiche Aktionen bestätigen
 *    - Nutzer wollen Feedback, dass etwas funktioniert hat
 */

// Migration Checklist:
// [ ] Alle `catch (error) { showError('...') }` durch `showErrorWithContext(error, { ... })` ersetzen
// [ ] Alle manuellen Validierungs-Meldungen durch `showValidationError(...)` ersetzen
// [ ] Kontext-Objekte für alle API-Calls hinzufügen
// [ ] Testen, ob alle bekannten Backend-Fehler richtig gemappt werden
