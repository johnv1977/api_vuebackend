/**
 * RoomsService
 * Arquitectura ABCC - App/Rooms/Services Layer
 *
 * Servicio para manejar la comunicación con el backend API de salas (Rooms)
 * Implementa exactamente los endpoints del swagger.json
 */

import type { ErrorResponse, VoidResponse } from '../../../common/types/swagger.types'
import type {
  CreateRoomDto,
  DeleteRoomParams,
  GetRoomParams,
  RoomListDtoPaginatedResult,
  RoomResponseDto,
  UpdateRoomDto,
  UpdateRoomParams,
} from '@/app/rooms/types'
import { API_BASE_URL, API_ENDPOINTS } from '../../../config/const/api_endpoints'

class RoomsService {
  /**
   * GET /api/rooms - Obtener lista paginada de salas
   */
  async getRooms (params: {
    page?: number
    pageSize?: number
    isOpen?: boolean
  } = {}): Promise<RoomListDtoPaginatedResult> {
    try {
      const url = new URL(`${API_BASE_URL}${API_ENDPOINTS.ROOMS}`)

      // Agregar parámetros de query
      if (params.page !== undefined) {
        url.searchParams.append('page', params.page.toString())
      }
      if (params.pageSize !== undefined) {
        url.searchParams.append('pageSize', params.pageSize.toString())
      }
      if (params.isOpen !== undefined) {
        url.searchParams.append('isOpen', params.isOpen.toString())
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: this.getHeaders(),
      })

      return await this.handleResponse<RoomListDtoPaginatedResult>(response)
    } catch (error: any) {
      throw this.handleApiError(error)
    }
  }

  /**
   * GET /api/rooms/{slug} - Obtener sala por slug
   */
  async getRoomBySlug (params: GetRoomParams): Promise<RoomResponseDto> {
    try {
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.ROOM_BY_SLUG(params.slug)}`,
        {
          method: 'GET',
          headers: this.getHeaders(),
        },
      )

      return await this.handleResponse<RoomResponseDto>(response)
    } catch (error: any) {
      throw this.handleApiError(error)
    }
  }

  /**
   * POST /api/rooms - Crear nueva sala (requiere admin)
   */
  async createRoom (dto: CreateRoomDto): Promise<RoomResponseDto> {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ROOMS}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(dto),
      })

      return await this.handleResponse<RoomResponseDto>(response)
    } catch (error: any) {
      throw this.handleApiError(error)
    }
  }

  /**
   * PUT /api/rooms/{slug} - Actualizar sala (requiere admin)
   */
  async updateRoom (params: UpdateRoomParams, dto: UpdateRoomDto): Promise<RoomResponseDto> {
    try {
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.ROOM_BY_SLUG(params.slug)}`,
        {
          method: 'PUT',
          headers: this.getHeaders(),
          body: JSON.stringify(dto),
        },
      )

      return await this.handleResponse<RoomResponseDto>(response)
    } catch (error: any) {
      throw this.handleApiError(error)
    }
  }

  /**
   * DELETE /api/rooms/{id} - Eliminar sala (requiere admin)
   */
  async deleteRoom (params: DeleteRoomParams): Promise<VoidResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.ROOM_BY_ID(params.id)}`,
        {
          method: 'DELETE',
          headers: this.getHeaders(),
        },
      )

      return await this.handleResponse<VoidResponse>(response)
    } catch (error: any) {
      throw this.handleApiError(error)
    }
  }

  /**
   * Verificar si el usuario actual tiene permisos de admin
   * Integra con authStore para verificación real de rol
   */
  hasAdminPermissions (): boolean {
    // TODO: Implementar verificación real cuando el backend tenga roles
    // Por ahora, verificar si hay token de autenticación
    const token = this.getAuthToken()
    return !!token

    // Implementación futura con roles:
    // import { useAuthStore } from '@/app/auth/stores/authStore'
    // const authStore = useAuthStore()
    // return authStore.hasRole('admin') || authStore.hasPermission('manage_rooms')
  }

  /**
   * Obtener token de autorización desde localStorage
   */
  private getAuthToken (): string | null {
    return localStorage.getItem('auth_token')
  }

  /**
   * Construir headers para las peticiones HTTP
   */
  private getHeaders (includeAuth = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (includeAuth) {
      const token = this.getAuthToken()
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }
    }

    return headers
  }

  /**
   * Manejar respuestas HTTP y errores
   */
  private async handleResponse<T> (response: Response): Promise<T> {
    if (response.ok) {
      // Para status 204 (No Content), no hay body que parsear
      if (response.status === 204) {
        return { success: true } as T
      }
      return await response.json()
    }

    // Manejar errores basados en el swagger.json
    let errorData: ErrorResponse
    try {
      errorData = await response.json()
    } catch {
      // Fallback si no se puede parsear el error
      errorData = {
        type: 'UnknownError',
        title: 'Error desconocido',
        detail: `Error HTTP ${response.status}`,
        status: response.status,
      }
    }

    const error = new Error(errorData.detail || errorData.title || 'Error en la operación')
    ;(error as any).response = errorData
    ;(error as any).status = response.status
    throw error
  }

  /**
   * Manejar errores de la API de manera uniforme
   */
  private handleApiError (error: any): Error {
    // Si ya es un Error con información de response, lo retornamos
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
export const roomsService = new RoomsService()
export default roomsService
