/**
 * useRoomFilters Composable
 * Arquitectura ABCC - App/Rooms/Composables Layer
 *
 * Composable para manejar filtros y búsqueda de salas
 * Incluye lógica de debounce, historial de filtros y persistencia
 */

import type { RoomFilters, RoomListDto } from '@/app/rooms/types'
import { computed, reactive, ref, watch } from 'vue'

export function useRoomFilters (initialFilters?: Partial<RoomFilters>) {
  // Estado de filtros
  const filters = reactive<RoomFilters>({
    page: 1,
    pageSize: 10,
    isOpen: undefined,
    search: '',
    ...initialFilters,
  })

  // Estado de búsqueda con debounce
  const searchInput = ref(filters.search)
  const searchDebounceTimeout = ref<number | null>(null)
  const isSearching = ref(false)

  // Historial de filtros para navegación
  const filtersHistory = ref<RoomFilters[]>([{ ...filters }])
  const currentHistoryIndex = ref(0)

  // Estado de aplicación de filtros
  const hasActiveFilters = computed(() => {
    return filters.isOpen !== undefined
      || filters.search !== ''
      || filters.pageSize !== 10
  })

  const filtersCount = computed(() => {
    let count = 0
    if (filters.isOpen !== undefined) {
      count++
    }
    if (filters.search !== '') {
      count++
    }
    if (filters.pageSize !== 10) {
      count++
    }
    return count
  })

  // Opciones predefinidas para filtros
  const statusOptions = [
    { title: 'Todas las salas', value: undefined },
    { title: 'Solo abiertas', value: true },
    { title: 'Solo cerradas', value: false },
  ]

  const pageSizeOptions = [
    { title: '5 por página', value: 5 },
    { title: '10 por página', value: 10 },
    { title: '20 por página', value: 20 },
    { title: '50 por página', value: 50 },
  ]

  // Filtros rápidos predefinidos
  const quickFilters = [
    {
      name: 'Todas',
      filters: { isOpen: undefined, search: '' },
      icon: 'mdi-all-inclusive',
    },
    {
      name: 'Abiertas',
      filters: { isOpen: true, search: '' },
      icon: 'mdi-lock-open',
    },
    {
      name: 'Cerradas',
      filters: { isOpen: false, search: '' },
      icon: 'mdi-lock',
    },
    {
      name: 'Disponibles',
      filters: { isOpen: true, search: '' },
      icon: 'mdi-check-circle',
      description: 'Salas abiertas con espacio disponible',
    },
  ]

  // Métodos para actualizar filtros
  function updateFilters (newFilters: Partial<RoomFilters>) {
    Object.assign(filters, newFilters)
    addToHistory()
  }

  function setSearch (search: string) {
    filters.search = search
    searchInput.value = search
    addToHistory()
  }

  function setStatus (isOpen: boolean | undefined) {
    filters.isOpen = isOpen
    filters.page = 1 // Reset page when changing filter
    addToHistory()
  }

  function setPageSize (pageSize: number) {
    filters.pageSize = pageSize
    filters.page = 1 // Reset page when changing page size
    addToHistory()
  }

  function setPage (page: number) {
    filters.page = page
    // No añadir al historial para cambios de página
  }

  // Búsqueda con debounce
  function debouncedSearch (searchTerm: string, delay = 300) {
    if (searchDebounceTimeout.value) {
      clearTimeout(searchDebounceTimeout.value)
    }

    isSearching.value = true

    searchDebounceTimeout.value = setTimeout(() => {
      setSearch(searchTerm)
      isSearching.value = false
    }, delay)
  }

  // Aplicar filtro rápido
  function applyQuickFilter (quickFilter: typeof quickFilters[0]) {
    updateFilters({
      ...quickFilter.filters,
      page: 1,
    })
  }

  // Reset de filtros
  function resetFilters () {
    const defaultFilters: RoomFilters = {
      page: 1,
      pageSize: 10,
      isOpen: undefined,
      search: '',
    }

    Object.assign(filters, defaultFilters)
    searchInput.value = ''
    addToHistory()
  }

  // Historial de filtros
  function addToHistory () {
    const newFilters = { ...filters }

    // No añadir al historial si es igual al último
    const lastFilters = filtersHistory.value[currentHistoryIndex.value]
    if (JSON.stringify(newFilters) === JSON.stringify(lastFilters)) {
      return
    }

    // Eliminar filtros posteriores si estamos en el medio del historial
    if (currentHistoryIndex.value < filtersHistory.value.length - 1) {
      filtersHistory.value = filtersHistory.value.slice(0, currentHistoryIndex.value + 1)
    }

    filtersHistory.value.push(newFilters)
    currentHistoryIndex.value = filtersHistory.value.length - 1

    // Limitar el historial a 10 entradas
    if (filtersHistory.value.length > 10) {
      filtersHistory.value.shift()
      currentHistoryIndex.value--
    }
  }

  function canGoBack () {
    return currentHistoryIndex.value > 0
  }

  function canGoForward () {
    return currentHistoryIndex.value < filtersHistory.value.length - 1
  }

  function goBackInHistory () {
    if (canGoBack()) {
      currentHistoryIndex.value--
      const previousFilters = filtersHistory.value[currentHistoryIndex.value]
      Object.assign(filters, previousFilters)
      searchInput.value = filters.search
    }
  }

  function goForwardInHistory () {
    if (canGoForward()) {
      currentHistoryIndex.value++
      const nextFilters = filtersHistory.value[currentHistoryIndex.value]
      Object.assign(filters, nextFilters)
      searchInput.value = filters.search
    }
  }

  // Filtrado local de salas (para búsqueda en cliente)
  function filterRoomsLocally (rooms: RoomListDto[]): RoomListDto[] {
    let filtered = [...rooms]

    // Filtro por búsqueda (nombre o slug)
    if (filters.search && filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase().trim()
      filtered = filtered.filter(room =>
        room.name?.toLowerCase().includes(searchTerm)
        || room.slug?.toLowerCase().includes(searchTerm),
      )
    }

    return filtered
  }

  // Persistencia en localStorage
  function saveFiltersToStorage (key = 'roomFilters') {
    try {
      localStorage.setItem(key, JSON.stringify(filters))
    } catch (error) {
      console.warn('No se pudieron guardar los filtros:', error)
    }
  }

  function loadFiltersFromStorage (key = 'roomFilters') {
    try {
      const saved = localStorage.getItem(key)
      if (saved) {
        const savedFilters = JSON.parse(saved)
        Object.assign(filters, savedFilters)
        searchInput.value = filters.search
        return true
      }
    } catch (error) {
      console.warn('No se pudieron cargar los filtros:', error)
    }
    return false
  }

  function clearFiltersFromStorage (key = 'roomFilters') {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.warn('No se pudieron limpiar los filtros:', error)
    }
  }

  // Obtener resumen de filtros activos
  function getActiveFiltersDescription (): string {
    const descriptions: string[] = []

    if (filters.isOpen === true) {
      descriptions.push('solo abiertas')
    } else if (filters.isOpen === false) {
      descriptions.push('solo cerradas')
    }

    if (filters.search) {
      descriptions.push(`búsqueda: "${filters.search}"`)
    }

    if (filters.pageSize !== 10) {
      descriptions.push(`${filters.pageSize} por página`)
    }

    return descriptions.length > 0
      ? descriptions.join(', ')
      : 'Sin filtros activos'
  }

  // Watcher para búsqueda con input
  watch(searchInput, newValue => {
    debouncedSearch(newValue ?? '')
  })

  return {
    // Estado
    filters,
    searchInput,
    isSearching,
    hasActiveFilters,
    filtersCount,
    filtersHistory,
    currentHistoryIndex,

    // Opciones
    statusOptions,
    pageSizeOptions,
    quickFilters,

    // Métodos de filtros
    updateFilters,
    setSearch,
    setStatus,
    setPageSize,
    setPage,
    debouncedSearch,
    applyQuickFilter,
    resetFilters,

    // Historial
    canGoBack,
    canGoForward,
    goBackInHistory,
    goForwardInHistory,

    // Filtrado local
    filterRoomsLocally,

    // Persistencia
    saveFiltersToStorage,
    loadFiltersFromStorage,
    clearFiltersFromStorage,

    // Utilidades
    getActiveFiltersDescription,
  }
}
