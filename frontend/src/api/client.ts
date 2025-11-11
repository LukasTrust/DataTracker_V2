import axios, { AxiosError, AxiosInstance } from 'axios'

const API_BASE_URL = '/api'

/**
 * Zentralisierte Axios-Instanz mit Error Handling
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 Sekunden Timeout
})

/**
 * Request Interceptor
 * Kann erweitert werden für Auth-Token, etc.
 */
apiClient.interceptors.request.use(
  (config) => {
    // Hier könnte man z.B. einen Auth-Token hinzufügen:
    // const token = localStorage.getItem('authToken')
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`
    // }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

/**
 * Response Interceptor
 * Zentralisiertes Error Handling
 */
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error: AxiosError) => {
    // Strukturiertes Error Handling
    const errorResponse = {
      message: 'Ein unbekannter Fehler ist aufgetreten',
      status: error.response?.status,
      data: error.response?.data,
    }

    if (error.response) {
      // Server hat mit Fehler geantwortet
      switch (error.response.status) {
        case 400:
          errorResponse.message = 'Ungültige Anfrage'
          break
        case 401:
          errorResponse.message = 'Nicht autorisiert'
          break
        case 403:
          errorResponse.message = 'Zugriff verweigert'
          break
        case 404:
          errorResponse.message = 'Ressource nicht gefunden'
          break
        case 500:
          errorResponse.message = 'Serverfehler'
          break
        default:
          errorResponse.message = `Fehler ${error.response.status}`
      }

      // Backend-spezifische Fehlermeldung überschreiben
      if (error.response.data && typeof error.response.data === 'object') {
        const data = error.response.data as { detail?: string; message?: string }
        if (data.detail) {
          errorResponse.message = data.detail
        } else if (data.message) {
          errorResponse.message = data.message
        }
      }
    } else if (error.request) {
      // Request wurde gesendet, aber keine Response erhalten
      errorResponse.message = 'Keine Antwort vom Server. Bitte prüfe deine Internetverbindung.'
    } else {
      // Fehler beim Setup der Request
      errorResponse.message = error.message
    }

    console.error('API Error:', errorResponse)
    return Promise.reject(errorResponse)
  }
)

export default apiClient
