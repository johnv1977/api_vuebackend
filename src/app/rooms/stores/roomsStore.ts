/**
 * Store de Rooms
 * Arquitectura ABCC - App/Rooms/Stores Layer
 *
 * Maneja el estado de gestión de salas usando roomsService como fuente de datos
 */

import type {
  CreateRoomDto,
  RoomErrorStates,
  RoomFilters,
  RoomListDtoPaginatedResult,
  RoomLoadingStates,
  RoomResponseDto,
  UpdateRoomDto,
} from '../types'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import roomsService from '../services/roomsService'

export const useRoomsStore = defineStore('rooms', () => {
  // State - Lista de salas
  const roomsList = ref<RoomListDtoPaginatedResult | null>(null)
  const currentRoom = ref<RoomResponseDto | null>(null)

  // State - Filtros y paginación
  const filters = ref<RoomFilters>({
    page: 1,
    pageSize: 10,
    isOpen: undefined,
    search: '',
  })

  // State - Estados de carga
  const loadingStates = ref<RoomLoadingStates>({
    list: false,
    detail: false,
    create: false,
    update: false,
    delete: false,
  })

  // State - Estados de error
  const errorStates = ref<RoomErrorStates>({
    list: null,
    detail: null,
    create: null,
    update: null,
    delete: null,
  })

  // Getters
  const rooms = computed(() => roomsList.value?.items || [])
  const totalPages = computed(() => roomsList.value?.totalPages || 0)
  const totalCount = computed(() => roomsList.value?.totalCount || 0)
  const currentPage = computed(() => roomsList.value?.page || 1)
  const pageSize = computed(() => roomsList.value?.pageSize || 10)

  const hasRooms = computed(() => rooms.value.length > 0)
  const isLoading = computed(() => Object.values(loadingStates.value).some(Boolean))
  const hasErrors = computed(() => Object.values(errorStates.value).some(error => error !== null))

  // Filtros aplicados
  const filteredRooms = computed(() => {
    let filtered = rooms.value

    // Filtro por búsqueda local (nombre)
    if (filters.value.search && filters.value.search.trim()) {
      const searchTerm = filters.value.search.toLowerCase().trim()
      filtered = filtered.filter(room =>
        room.name?.toLowerCase().includes(searchTerm)
        || room.slug?.toLowerCase().includes(searchTerm),
      )
    }

    return filtered
  })

  // Actions - Gestión de salas
  async function fetchRooms (newFilters?: Partial<RoomFilters>) {
    console.log('RoomsStore: fetchRooms action called', newFilters)

    // Actualizar filtros si se proporcionan
    if (newFilters) {
      filters.value = { ...filters.value, ...newFilters }
    }

    loadingStates.value.list = true
    errorStates.value.list = null

    try {
      const params = {
        page: filters.value.page,
        pageSize: filters.value.pageSize,
        isOpen: filters.value.isOpen,
      }

      const response = await roomsService.getRooms(params)
      roomsList.value = response

      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar salas'
      errorStates.value.list = errorMessage
      throw error
    } finally {
      loadingStates.value.list = false
    }
  }

  async function fetchRoomBySlug (slug: string) {
    console.log('RoomsStore: fetchRoomBySlug action called', slug)

    loadingStates.value.detail = true
    errorStates.value.detail = null

    try {
      const response = await roomsService.getRoomBySlug({ slug })
      currentRoom.value = response

      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar sala'
      errorStates.value.detail = errorMessage
      throw error
    } finally {
      loadingStates.value.detail = false
    }
  }

  async function createRoom (dto: CreateRoomDto) {
    console.log('RoomsStore: createRoom action called', dto)

    loadingStates.value.create = true
    errorStates.value.create = null

    try {
      const response = await roomsService.createRoom(dto)

      // Actualizar lista después de crear
      await fetchRooms()

      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear sala'
      errorStates.value.create = errorMessage
      throw error
    } finally {
      loadingStates.value.create = false
    }
  }

  async function updateRoom (slug: string, dto: UpdateRoomDto) {
    console.log('RoomsStore: updateRoom action called', slug, dto)

    loadingStates.value.update = true
    errorStates.value.update = null

    try {
      const response = await roomsService.updateRoom({ slug }, dto)

      // Actualizar sala actual si es la misma
      if (currentRoom.value?.slug === slug) {
        currentRoom.value = response
      }

      // Actualizar lista
      await fetchRooms()

      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar sala'
      errorStates.value.update = errorMessage
      throw error
    } finally {
      loadingStates.value.update = false
    }
  }

  async function deleteRoom (id: string) {
    console.log('RoomsStore: deleteRoom action called', id)

    loadingStates.value.delete = true
    errorStates.value.delete = null

    try {
      await roomsService.deleteRoom({ id })

      // Limpiar sala actual si es la misma
      if (currentRoom.value?.id === id) {
        currentRoom.value = null
      }

      // Actualizar lista
      await fetchRooms()

      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar sala'
      errorStates.value.delete = errorMessage
      throw error
    } finally {
      loadingStates.value.delete = false
    }
  }

  // Actions - Gestión de filtros y paginación
  function updateFilters (newFilters: Partial<RoomFilters>) {
    filters.value = { ...filters.value, ...newFilters }
  }

  function resetFilters () {
    filters.value = {
      page: 1,
      pageSize: 10,
      isOpen: undefined,
      search: '',
    }
  }

  function setPage (page: number) {
    filters.value.page = page
  }

  function setPageSize (pageSize: number) {
    filters.value.pageSize = pageSize
    filters.value.page = 1 // Reset to first page when changing page size
  }

  function setSearch (search: string) {
    filters.value.search = search
    // No se resetea la página para búsqueda local
  }

  function setIsOpenFilter (isOpen: boolean | undefined) {
    filters.value.isOpen = isOpen
    filters.value.page = 1 // Reset to first page when changing filter
  }

  // Actions - Gestión de estado
  function clearCurrentRoom () {
    currentRoom.value = null
  }

  function clearErrors () {
    errorStates.value = {
      list: null,
      detail: null,
      create: null,
      update: null,
      delete: null,
    }
  }

  function clearError (operation: keyof RoomErrorStates) {
    errorStates.value[operation] = null
  }

  // Actions - Utilidades
  function getRoomBySlug (slug: string) {
    return rooms.value.find(room => room.slug === slug)
  }

  function getRoomById (id: string) {
    return rooms.value.find(room => room.id === id)
  }

  // Función para verificar permisos de admin (integrado con authStore a través del service)
  function hasAdminPermissions (): boolean {
    // Delega la verificación al service que integra con authStore
    return roomsService.hasAdminPermissions()
  }

  return {
    // State
    roomsList,
    currentRoom,
    filters,
    loadingStates,
    errorStates,

    // Getters
    rooms,
    totalPages,
    totalCount,
    currentPage,
    pageSize,
    hasRooms,
    isLoading,
    hasErrors,
    filteredRooms,

    // Actions - CRUD
    fetchRooms,
    fetchRoomBySlug,
    createRoom,
    updateRoom,
    deleteRoom,

    // Actions - Filtros
    updateFilters,
    resetFilters,
    setPage,
    setPageSize,
    setSearch,
    setIsOpenFilter,

    // Actions - Estado
    clearCurrentRoom,
    clearErrors,
    clearError,

    // Actions - Utilidades
    getRoomBySlug,
    getRoomById,
    hasAdminPermissions,
  }
})
