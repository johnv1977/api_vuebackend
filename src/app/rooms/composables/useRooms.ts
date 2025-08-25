/**
 * useRooms Composable
 * Arquitectura ABCC - App/Rooms/Composables Layer
 *
 * Composable principal para gestión de salas - proporciona una interfaz
 * simplificada sobre el store de rooms con lógica de negocio específica
 */

import type { CreateRoomDto, RoomFilters, UpdateRoomDto } from '@/app/rooms/types'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useRoomsStore } from '@/app/rooms/stores/roomsStore'

export function useRooms () {
  const roomsStore = useRoomsStore()
  const router = useRouter()

  // Estado local del composable
  const isInitialized = ref(false)

  // Computed del store
  const rooms = computed(() => roomsStore.rooms)
  const filteredRooms = computed(() => roomsStore.filteredRooms)
  const currentRoom = computed(() => roomsStore.currentRoom)
  const filters = computed(() => roomsStore.filters)
  const totalCount = computed(() => roomsStore.totalCount)
  const totalPages = computed(() => roomsStore.totalPages)
  const currentPage = computed(() => roomsStore.currentPage)
  const pageSize = computed(() => roomsStore.pageSize)
  const hasRooms = computed(() => roomsStore.hasRooms)
  const isLoading = computed(() => roomsStore.isLoading)
  const hasErrors = computed(() => roomsStore.hasErrors)

  // Estados de carga específicos
  const isLoadingList = computed(() => roomsStore.loadingStates.list)
  const isLoadingDetail = computed(() => roomsStore.loadingStates.detail)
  const isCreating = computed(() => roomsStore.loadingStates.create)
  const isUpdating = computed(() => roomsStore.loadingStates.update)
  const isDeleting = computed(() => roomsStore.loadingStates.delete)

  // Errores específicos
  const listError = computed(() => roomsStore.errorStates.list)
  const detailError = computed(() => roomsStore.errorStates.detail)
  const createError = computed(() => roomsStore.errorStates.create)
  const updateError = computed(() => roomsStore.errorStates.update)
  const deleteError = computed(() => roomsStore.errorStates.delete)

  // Estadísticas derivadas
  const openRooms = computed(() => rooms.value.filter(room => room.isOpen))
  const closedRooms = computed(() => rooms.value.filter(room => !room.isOpen))
  const openRoomsCount = computed(() => openRooms.value.length)
  const closedRoomsCount = computed(() => closedRooms.value.length)

  // Métricas de ocupación
  const totalUsers = computed(() =>
    rooms.value.reduce((total, room) => total + room.currentUserCount, 0),
  )
  const totalCapacity = computed(() =>
    rooms.value.reduce((total, room) => total + room.userLimit, 0),
  )
  const averageOccupancy = computed(() => {
    if (totalCapacity.value === 0) {
      return 0
    }
    return Math.round((totalUsers.value / totalCapacity.value) * 100)
  })

  // Métodos principales de gestión
  async function initialize () {
    if (isInitialized.value) {
      return
    }

    try {
      await loadRooms()
      isInitialized.value = true
    } catch (error) {
      console.error('Error initializing rooms:', error)
      throw error
    }
  }

  async function loadRooms (newFilters?: Partial<RoomFilters>) {
    try {
      return await roomsStore.fetchRooms(newFilters)
    } catch (error) {
      console.error('Error loading rooms:', error)
      throw error
    }
  }

  async function loadRoom (slug: string) {
    try {
      return await roomsStore.fetchRoomBySlug(slug)
    } catch (error) {
      console.error('Error loading room:', error)
      throw error
    }
  }

  async function createRoom (data: CreateRoomDto) {
    try {
      const result = await roomsStore.createRoom(data)

      // Navegar automáticamente al detalle de la nueva sala
      if (result.slug) {
        router.push(`/rooms/${result.slug}`)
      }

      return result
    } catch (error) {
      console.error('Error creating room:', error)
      throw error
    }
  }

  async function updateRoom (slug: string, data: UpdateRoomDto) {
    try {
      const result = await roomsStore.updateRoom(slug, data)

      // Actualizar la sala actual si es la misma
      if (currentRoom.value?.slug === slug) {
        await loadRoom(slug)
      }

      return result
    } catch (error) {
      console.error('Error updating room:', error)
      throw error
    }
  }

  async function deleteRoom (id: string) {
    try {
      await roomsStore.deleteRoom(id)

      // Si estamos viendo el detalle de la sala eliminada, redirigir
      if (currentRoom.value?.id === id) {
        router.push('/rooms')
      }

      return true
    } catch (error) {
      console.error('Error deleting room:', error)
      throw error
    }
  }

  // Métodos de filtrado y paginación
  function updateFilters (newFilters: Partial<RoomFilters>) {
    roomsStore.updateFilters(newFilters)
  }

  function resetFilters () {
    roomsStore.resetFilters()
  }

  async function changePage (page: number) {
    roomsStore.setPage(page)
    await loadRooms()
  }

  async function changePageSize (pageSize: number) {
    roomsStore.setPageSize(pageSize)
    await loadRooms()
  }

  function searchRooms (searchTerm: string) {
    roomsStore.setSearch(searchTerm)
    // No se recarga automáticamente para búsqueda local
  }

  async function filterByStatus (isOpen?: boolean) {
    roomsStore.setIsOpenFilter(isOpen)
    await loadRooms()
  }

  // Métodos de navegación
  function goToRoom (slugOrRoom: string | { slug: string | null }) {
    const slug = typeof slugOrRoom === 'string' ? slugOrRoom : slugOrRoom.slug
    if (slug) {
      router.push(`/rooms/${slug}`)
    }
  }

  function goToEditRoom (slugOrRoom: string | { slug: string | null }) {
    const slug = typeof slugOrRoom === 'string' ? slugOrRoom : slugOrRoom.slug
    if (slug) {
      router.push(`/rooms/${slug}/edit`)
    }
  }

  function goToCreateRoom () {
    router.push('/rooms/create')
  }

  function goToRoomsList () {
    router.push('/rooms')
  }

  // Métodos de utilidad
  function findRoomBySlug (slug: string) {
    return roomsStore.getRoomBySlug(slug)
  }

  function findRoomById (id: string) {
    return roomsStore.getRoomById(id)
  }

  function clearCurrentRoom () {
    roomsStore.clearCurrentRoom()
  }

  function clearErrors () {
    roomsStore.clearErrors()
  }

  function clearError (operation: 'list' | 'detail' | 'create' | 'update' | 'delete') {
    roomsStore.clearError(operation)
  }

  // Verificación de permisos
  function hasAdminPermissions (): boolean {
    return roomsStore.hasAdminPermissions()
  }

  // Métodos de refresh
  async function refreshRooms () {
    try {
      await loadRooms()
    } catch (error) {
      console.error('Error refreshing rooms:', error)
    }
  }

  async function refreshCurrentRoom () {
    if (currentRoom.value?.slug) {
      try {
        await loadRoom(currentRoom.value.slug)
      } catch (error) {
        console.error('Error refreshing current room:', error)
      }
    }
  }

  return {
    // Estado
    isInitialized,

    // Datos
    rooms,
    filteredRooms,
    currentRoom,
    filters,
    totalCount,
    totalPages,
    currentPage,
    pageSize,
    hasRooms,

    // Estados de carga
    isLoading,
    isLoadingList,
    isLoadingDetail,
    isCreating,
    isUpdating,
    isDeleting,

    // Errores
    hasErrors,
    listError,
    detailError,
    createError,
    updateError,
    deleteError,

    // Estadísticas
    openRooms,
    closedRooms,
    openRoomsCount,
    closedRoomsCount,
    totalUsers,
    totalCapacity,
    averageOccupancy,

    // Métodos principales
    initialize,
    loadRooms,
    loadRoom,
    createRoom,
    updateRoom,
    deleteRoom,

    // Filtrado y paginación
    updateFilters,
    resetFilters,
    changePage,
    changePageSize,
    searchRooms,
    filterByStatus,

    // Navegación
    goToRoom,
    goToEditRoom,
    goToCreateRoom,
    goToRoomsList,

    // Utilidades
    findRoomBySlug,
    findRoomById,
    clearCurrentRoom,
    clearErrors,
    clearError,
    hasAdminPermissions,
    refreshRooms,
    refreshCurrentRoom,
  }
}
