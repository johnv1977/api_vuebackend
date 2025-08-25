<template>
  <div class="room-pagination">
    <!-- Información de resultados -->
    <div class="d-flex justify-space-between align-center mb-4">
      <div class="text-body-2 text-medium-emphasis">
        Mostrando {{ startItem }}-{{ endItem }} de {{ totalCount }} salas
      </div>

      <div class="text-body-2 text-medium-emphasis">
        Página {{ currentPage }} de {{ totalPages }}
      </div>
    </div>

    <!-- Controles de paginación -->
    <div class="d-flex justify-center">
      <v-pagination
        class="room-pagination__controls"
        color="primary"
        :length="totalPages"
        :model-value="currentPage"
        :total-visible="visiblePages"
        variant="elevated"
        @update:model-value="goToPage"
      />
    </div>

    <!-- Controles adicionales en móvil -->
    <div class="d-flex justify-space-between align-center mt-4 d-sm-none">
      <v-btn
        :disabled="currentPage <= 1"
        size="small"
        variant="outlined"
        @click="previousPage"
      >
        <v-icon>mdi-chevron-left</v-icon>
        Anterior
      </v-btn>

      <v-btn
        :disabled="currentPage >= totalPages"
        size="small"
        variant="outlined"
        @click="nextPage"
      >
        Siguiente
        <v-icon>mdi-chevron-right</v-icon>
      </v-btn>
    </div>

    <!-- Navegación rápida -->
    <div v-if="showQuickNavigation" class="d-flex justify-center mt-4">
      <v-btn-group density="compact" variant="outlined">
        <v-btn
          :disabled="currentPage <= 1"
          @click="goToFirstPage"
        >
          <v-icon>mdi-page-first</v-icon>
        </v-btn>

        <v-btn
          :disabled="currentPage <= 1"
          @click="previousPage"
        >
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>

        <v-btn
          :disabled="currentPage >= totalPages"
          @click="nextPage"
        >
          <v-icon>mdi-chevron-right</v-icon>
        </v-btn>

        <v-btn
          :disabled="currentPage >= totalPages"
          @click="goToLastPage"
        >
          <v-icon>mdi-page-last</v-icon>
        </v-btn>
      </v-btn-group>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useDisplay } from 'vuetify'

  interface Props {
    currentPage: number
    totalPages: number
    totalCount: number
    pageSize: number
    showQuickNavigation?: boolean
  }

  interface Emits {
    'update:page': [page: number]
  }

  const props = withDefaults(defineProps<Props>(), {
    showQuickNavigation: false,
  })

  const emit = defineEmits<Emits>()
  const { mobile } = useDisplay()

  // Computed properties
  const startItem = computed(() => {
    if (props.totalCount === 0) return 0
    return (props.currentPage - 1) * props.pageSize + 1
  })

  const endItem = computed(() => {
    const calculated = props.currentPage * props.pageSize
    return Math.min(calculated, props.totalCount)
  })

  const visiblePages = computed(() => {
    return mobile.value ? 5 : 7
  })

  // Navigation methods
  function goToPage (page: number) {
    if (page >= 1 && page <= props.totalPages) {
      emit('update:page', page)
    }
  }

  function previousPage () {
    if (props.currentPage > 1) {
      goToPage(props.currentPage - 1)
    }
  }

  function nextPage () {
    if (props.currentPage < props.totalPages) {
      goToPage(props.currentPage + 1)
    }
  }

  function goToFirstPage () {
    goToPage(1)
  }

  function goToLastPage () {
    goToPage(props.totalPages)
  }
</script>

<style scoped>
  .room-pagination {
    padding: 1rem 0;
  }

  .room-pagination__controls {
    max-width: 100%;
  }

  @media (max-width: 600px) {
    .room-pagination__controls {
      transform: scale(0.9);
    }
  }
</style>
