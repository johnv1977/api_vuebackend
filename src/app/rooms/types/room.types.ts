/**
 * DTOs específicos para operaciones de Room
 * Estos tipos corresponden exactamente a los request bodies del swagger.json
 */

/**
 * DTO para crear una nueva sala
 * Usado en POST /api/rooms
 */
export interface CreateRoomDto {
  name: string | null
  slug: string | null
  color: string | null
  icon: string | null
  userLimit: number
  isOpen: boolean
}

/**
 * DTO para actualizar una sala existente
 * Usado en PUT /api/rooms/{slug}
 * Todos los campos son opcionales para actualizaciones parciales
 */
export interface UpdateRoomDto {
  name?: string | null
  color?: string | null
  icon?: string | null
  userLimit?: number | null
  isOpen?: boolean | null
}

/**
 * Datos para formularios del cliente (versión strict para validaciones)
 * Usado en componentes de formulario para validaciones client-side
 */
export interface RoomFormData {
  name: string
  slug: string
  color: string
  icon: string
  userLimit: number
  isOpen: boolean
}

/**
 * Estados de validación para formularios
 */
export interface RoomFormValidation {
  name: {
    valid: boolean
    errors: string[]
  }
  slug: {
    valid: boolean
    errors: string[]
  }
  color: {
    valid: boolean
    errors: string[]
  }
  icon: {
    valid: boolean
    errors: string[]
  }
  userLimit: {
    valid: boolean
    errors: string[]
  }
}
