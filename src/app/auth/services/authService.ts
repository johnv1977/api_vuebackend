/**
 * AuthService
 * Arquitectura ABCC - App/Auth/Services Layer
 *
 * Servicio para manejar la autenticación con el backend .NET API
 */

import type { AuthRegisterRequest, AuthResponse, LoginCredentials, User } from '@/app/auth/interfaces/interfaces'
import { API_BASE_URL, API_ENDPOINTS } from '@/config/const/api_endpoints'

class AuthService {
  constructor () {
    // Constructor - configuraciones iniciales
  }

  /**
   * Iniciar sesión con email y contraseña
   */
  async login (credentials: LoginCredentials): Promise<AuthResponse> {
    // console.log('Logging in with credentials:', credentials)
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al iniciar sesión')
      }

      const data: AuthResponse = await response.json()
      return data
    } catch (error: any) {
      throw this.handleApiError(error)
    }
  }

  /**
   * Registrar nuevo usuario
   */
  async register (credentials: AuthRegisterRequest): Promise<AuthResponse> {
    console.log('Registering user with credentials:', credentials)

    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.REGISTER}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al registrar usuario')
      }

      const data: AuthResponse = await response.json()
      return data
    } catch (error: any) {
      throw this.handleApiError(error)
    }
  }

  /**
   * Obtener información del usuario autenticado
   */
  async getCurrentUser (): Promise<User> {
    try {
      const token = localStorage.getItem('auth_token')

      if (!token) {
        throw new Error('No hay token de autenticación')
      }

      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ME}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          // Token expirado o inválido
          localStorage.removeItem('auth_token')
          localStorage.removeItem('user')
          throw new Error('Token expirado. Inicia sesión nuevamente.')
        }
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al obtener usuario')
      }

      const data: User = await response.json()
      return data
    } catch (error: any) {
      throw this.handleApiError(error)
    }
  }

  /**
   * Verificar si el token es válido
   */
  async verifyToken (): Promise<boolean> {
    try {
      await this.getCurrentUser()
      return true
    } catch {
      return false
    }
  }

  /**
   * Manejar errores de la API
   */
  private handleApiError (error: any): Error {
    // Si ya es un Error, lo retornamos
    if (error instanceof Error) {
      return error
    }

    // Error de red o timeout
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return new Error('Error de red. Verifica tu conexión a internet.')
    }

    // Error genérico
    return new Error('Ocurrió un error inesperado. Intenta nuevamente.')
  }
}

// Exportar una instancia singleton
export const authService = new AuthService()
export default authService
