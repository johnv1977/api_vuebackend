/**
 * Responses específicos de la API de Rooms
 * Estos tipos corresponden exactamente a las respuestas del swagger.json
 */

/**
 * Respuesta completa de una sala individual
 * Retornada en GET /api/rooms/{slug}, POST /api/rooms, PUT /api/rooms/{slug}
 */
export interface RoomResponseDto {
  id: string // UUID format
  slug: string | null
  name: string | null
  color: string | null
  icon: string | null
  userLimit: number
  isOpen: boolean
  currentUserCount: number
  createdAt: string // DateTime format
  updatedAt: string // DateTime format
}

/**
 * Item de sala para listados (versión simplificada sin timestamps)
 * Usado en arrays de items dentro de RoomListDtoPaginatedResult
 */
export interface RoomListDto {
  id: string // UUID format
  slug: string | null
  name: string | null
  color: string | null
  icon: string | null
  userLimit: number
  isOpen: boolean
  currentUserCount: number
}

/**
 * Respuesta paginada de lista de salas
 * Retornada en GET /api/rooms
 */
export interface RoomListDtoPaginatedResult {
  items: RoomListDto[] | null
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

/**
 * Estados de carga para operaciones asíncronas
 */
export interface RoomLoadingStates {
  list: boolean
  detail: boolean
  create: boolean
  update: boolean
  delete: boolean
}

/**
 * Estados de error para operaciones
 */
export interface RoomErrorStates {
  list: string | null
  detail: string | null
  create: string | null
  update: string | null
  delete: string | null
}

/**
 * Parámetros para obtención de sala individual
 */
export interface GetRoomParams {
  slug: string
}

/**
 * Parámetros para eliminación de sala
 */
export interface DeleteRoomParams {
  id: string // UUID format
}

/**
 * Parámetros para actualización de sala
 */
export interface UpdateRoomParams {
  slug: string
}

/**
 * Respuesta para operaciones exitosas sin contenido
 */
export interface VoidResponse {
  success: boolean
  message?: string
}
