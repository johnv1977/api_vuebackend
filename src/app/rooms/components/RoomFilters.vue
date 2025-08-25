<template>
  <v-card class="room-filters" variant="outlined">
    <v-card-title class="text-h6">
      Filtros
    </v-card-title>

    <v-card-text>
      <v-row>
        <!-- Búsqueda por nombre -->
        <v-col cols="12" md="6">
          <v-text-field
            clearable
            density="compact"
            label="Buscar sala"
            :model-value="modelValue.search"
            placeholder="Nombre o slug de la sala"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            @click:clear="clearSearch"
            @update:model-value="updateSearch"
          />
        </v-col>

        <!-- Filtro por estado -->
        <v-col cols="12" md="3">
          <v-select
            clearable
            density="compact"
            :items="statusOptions"
            label="Estado"
            :model-value="modelValue.isOpen"
            variant="outlined"
            @update:model-value="updateStatus"
          />
        </v-col>

        <!-- Tamaño de página -->
        <v-col cols="12" md="3">
          <v-select
            density="compact"
            :items="pageSizeOptions"
            label="Por página"
            :model-value="modelValue.pageSize"
            variant="outlined"
            @update:model-value="updatePageSize"
          />
        </v-col>
      </v-row>

      <!-- Acciones -->
      <v-row class="mt-2">
        <v-col class="d-flex justify-end">
          <v-btn
            class="me-2"
            color="secondary"
            variant="outlined"
            @click="resetFilters"
          >
            Limpiar filtros
          </v-btn>

          <v-btn
            color="primary"
            @click="applyFilters"
          >
            Aplicar
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
  import type { RoomFilters } from '@/app/rooms/types'
  import { computed } from 'vue'

  interface Props {
    modelValue: RoomFilters
  }

  interface Emits {
    'update:modelValue': [value: RoomFilters]
    'apply': [filters: RoomFilters]
    'reset': []
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  // Opciones para el select de estado
  const statusOptions = [
    { title: 'Todas las salas', value: undefined },
    { title: 'Solo abiertas', value: true },
    { title: 'Solo cerradas', value: false },
  ]

  // Opciones para el tamaño de página
  const pageSizeOptions = [
    { title: '5 por página', value: 5 },
    { title: '10 por página', value: 10 },
    { title: '20 por página', value: 20 },
    { title: '50 por página', value: 50 },
  ]

  // Computed para facilitar la actualización
  const filters = computed({
    get: () => props.modelValue,
    set: (value: RoomFilters) => emit('update:modelValue', value),
  })

  // Métodos para actualizar filtros individuales
  function updateSearch (value: string | null) {
    filters.value = {
      ...filters.value,
      search: value || '',
    }
  }

  function updateStatus (value: boolean | undefined) {
    filters.value = {
      ...filters.value,
      isOpen: value,
      page: 1, // Reset page when changing filter
    }
  }

  function updatePageSize (value: number) {
    filters.value = {
      ...filters.value,
      pageSize: value,
      page: 1, // Reset page when changing page size
    }
  }

  function clearSearch () {
    updateSearch('')
  }

  function resetFilters () {
    const defaultFilters: RoomFilters = {
      page: 1,
      pageSize: 10,
      isOpen: undefined,
      search: '',
    }

    filters.value = defaultFilters
    emit('reset')
  }

  function applyFilters () {
    emit('apply', filters.value)
  }
</script>

<style scoped>
  .room-filters {
    margin-bottom: 1rem;
  }
</style>
