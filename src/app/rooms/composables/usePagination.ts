/**
 * usePagination Composable
 * Arquitectura ABCC - App/Rooms/Composables Layer
 *
 * Composable reutilizable para manejar lógica de paginación
 * Incluye navegación, cálculos y estado de paginación
 */

import { computed, ref, watch } from 'vue'

interface PaginationOptions {
  initialPage?: number
  initialPageSize?: number
  maxPageSize?: number
  showQuickNavigation?: boolean
}

export function usePagination (options: PaginationOptions = {}) {
  const {
    initialPage = 1,
    initialPageSize = 10,
    maxPageSize = 100,
    showQuickNavigation = false,
  } = options

  // Estado de paginación
  const currentPage = ref(initialPage)
  const pageSize = ref(initialPageSize)
  const totalCount = ref(0)
  const isLoading = ref(false)

  // Computed para cálculos de paginación
  const totalPages = computed(() => {
    if (totalCount.value === 0) {
      return 0
    }
    return Math.ceil(totalCount.value / pageSize.value)
  })

  const startItem = computed(() => {
    if (totalCount.value === 0) {
      return 0
    }
    return (currentPage.value - 1) * pageSize.value + 1
  })

  const endItem = computed(() => {
    const calculated = currentPage.value * pageSize.value
    return Math.min(calculated, totalCount.value)
  })

  const hasItems = computed(() => totalCount.value > 0)
  const hasPreviousPage = computed(() => currentPage.value > 1)
  const hasNextPage = computed(() => currentPage.value < totalPages.value)

  // Información de páginas visibles para el componente de paginación
  const visiblePageRange = computed(() => {
    const delta = 2 // Páginas a mostrar a cada lado de la actual
    const range = []
    const rangeWithDots = []

    for (
      let i = Math.max(2, currentPage.value - delta);
      i <= Math.min(totalPages.value - 1, currentPage.value + delta);
      i++
    ) {
      range.push(i)
    }

    if (currentPage.value - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage.value + delta < totalPages.value - 1) {
      rangeWithDots.push('...', totalPages.value)
    } else {
      rangeWithDots.push(totalPages.value)
    }

    return rangeWithDots.filter((item, index, array) => {
      // Remover duplicados y puntos suspensivos innecesarios
      return array.indexOf(item) === index
    })
  })

  // Opciones de tamaño de página
  const pageSizeOptions = computed(() => [
    { title: '5 por página', value: 5 },
    { title: '10 por página', value: 10 },
    { title: '20 por página', value: 20 },
    { title: '50 por página', value: 50 },
    ...(maxPageSize > 50 ? [{ title: `${maxPageSize} por página`, value: maxPageSize }] : []),
  ])

  // Métodos de navegación
  function goToPage (page: number): boolean {
    if (page < 1 || page > totalPages.value) {
      return false
    }

    currentPage.value = page
    return true
  }

  function goToFirstPage (): boolean {
    return goToPage(1)
  }

  function goToLastPage (): boolean {
    return goToPage(totalPages.value)
  }

  function goToPreviousPage (): boolean {
    return goToPage(currentPage.value - 1)
  }

  function goToNextPage (): boolean {
    return goToPage(currentPage.value + 1)
  }

  // Métodos para cambiar tamaño de página
  function setPageSize (newPageSize: number): boolean {
    if (newPageSize < 1 || newPageSize > maxPageSize) {
      return false
    }

    const currentStartItem = startItem.value
    pageSize.value = newPageSize

    // Calcular nueva página para mantener aproximadamente los mismos elementos
    const newPage = Math.ceil(currentStartItem / newPageSize)
    currentPage.value = Math.max(1, Math.min(newPage, totalPages.value))

    return true
  }

  // Métodos para actualizar datos
  function updateTotalCount (count: number): void {
    totalCount.value = count

    // Ajustar página actual si está fuera del rango
    if (currentPage.value > totalPages.value && totalPages.value > 0) {
      currentPage.value = totalPages.value
    }
  }

  function setLoading (loading: boolean): void {
    isLoading.value = loading
  }

  // Reset de paginación
  function reset (): void {
    currentPage.value = initialPage
    pageSize.value = initialPageSize
    totalCount.value = 0
    isLoading.value = false
  }

  // Información de estado para mostrar al usuario
  const statusText = computed(() => {
    if (totalCount.value === 0) {
      return 'No hay elementos'
    }

    return `Mostrando ${startItem.value}-${endItem.value} de ${totalCount.value} elementos`
  })

  const pageInfo = computed(() => {
    if (totalPages.value === 0) {
      return 'Página 0 de 0'
    }

    return `Página ${currentPage.value} de ${totalPages.value}`
  })

  // Obtener rango de elementos para la página actual
  function getItemsForCurrentPage<T> (items: T[]): T[] {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return items.slice(start, end)
  }

  // Navegar con teclas de teclado
  function handleKeyNavigation (event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowLeft': {
        event.preventDefault()
        goToPreviousPage()
        break
      }
      case 'ArrowRight': {
        event.preventDefault()
        goToNextPage()
        break
      }
      case 'Home': {
        event.preventDefault()
        goToFirstPage()
        break
      }
      case 'End': {
        event.preventDefault()
        goToLastPage()
        break
      }
    }
  }

  // Validar y sanitizar entrada de página
  function validatePageInput (input: string | number): number | null {
    const page = typeof input === 'string' ? Number.parseInt(input, 10) : input

    if (Number.isNaN(page) || page < 1 || page > totalPages.value) {
      return null
    }

    return page
  }

  // Watcher para mantener la página dentro del rango válido
  watch(totalPages, newTotalPages => {
    if (newTotalPages > 0 && currentPage.value > newTotalPages) {
      currentPage.value = newTotalPages
    }
  })

  return {
    // Estado
    currentPage,
    pageSize,
    totalCount,
    isLoading,

    // Computed
    totalPages,
    startItem,
    endItem,
    hasItems,
    hasPreviousPage,
    hasNextPage,
    visiblePageRange,
    pageSizeOptions,
    statusText,
    pageInfo,

    // Métodos de navegación
    goToPage,
    goToFirstPage,
    goToLastPage,
    goToPreviousPage,
    goToNextPage,

    // Métodos de configuración
    setPageSize,
    updateTotalCount,
    setLoading,
    reset,

    // Utilidades
    getItemsForCurrentPage,
    handleKeyNavigation,
    validatePageInput,

    // Opciones
    showQuickNavigation,
    maxPageSize,
  }
}
