/**
 * Barrel exports de todos los tipos del módulo Rooms
 * Facilita la importación de tipos desde otros módulos
 */

// Respuestas de la API
export type {
  DeleteRoomParams,
  GetRoomParams,
  RoomErrorStates,
  RoomListDto,
  RoomListDtoPaginatedResult,
  RoomLoadingStates,
  RoomResponseDto,
  UpdateRoomParams,
  VoidResponse,
} from './api.types'

// DTOs para operaciones
export type {
  CreateRoomDto,
  RoomFormData,
  RoomFormValidation,
  UpdateRoomDto,
} from './room.types'

// Tipos base del swagger
export type {
  ErrorResponse,
  PaginatedResult,
  PaginationParams,
  RoomFilters,
} from './swagger.types'
