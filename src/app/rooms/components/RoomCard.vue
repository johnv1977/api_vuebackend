<template>
  <v-card
    class="room-card"
    :class="{ 'room-card--closed': !room.isOpen }"
    :color="room.color || 'primary'"
    variant="outlined"
    @click="$emit('click', room)"
  >
    <!-- Header de la sala -->
    <v-card-title class="d-flex align-center">
      <v-icon
        v-if="room.icon"
        class="me-3"
        :icon="room.icon"
        size="large"
      />

      <div class="flex-grow-1">
        <h3 class="text-h6 mb-1">
          {{ room.name || 'Sala sin nombre' }}
        </h3>
        <div class="text-caption text-medium-emphasis">
          {{ room.slug }}
        </div>
      </div>

      <!-- Badge de estado -->
      <v-chip
        class="ms-2"
        :color="room.isOpen ? 'success' : 'error'"
        size="small"
        variant="flat"
      >
        {{ room.isOpen ? 'Abierta' : 'Cerrada' }}
      </v-chip>
    </v-card-title>

    <!-- Contenido principal -->
    <v-card-text>
      <!-- Información de usuarios -->
      <div class="d-flex align-center mb-2">
        <v-icon
          class="me-2"
          icon="mdi-account-group"
          size="small"
        />
        <span class="text-body-2">
          {{ room.currentUserCount }}/{{ room.userLimit }} usuarios
        </span>
      </div>

      <!-- Barra de progreso de ocupación -->
      <v-progress-linear
        class="mb-3"
        :color="occupancyColor"
        height="6"
        :model-value="occupancyPercentage"
        rounded
      />

      <!-- Información adicional -->
      <div class="text-caption text-medium-emphasis">
        <div v-if="showAdditionalInfo">
          Límite: {{ room.userLimit }} usuarios
        </div>
      </div>
    </v-card-text>

    <!-- Acciones (solo para admin) -->
    <v-card-actions v-if="showActions">
      <v-spacer />

      <v-btn
        color="primary"
        icon="mdi-pencil"
        size="small"
        variant="text"
        @click.stop="$emit('edit', room)"
      />

      <v-btn
        color="error"
        icon="mdi-delete"
        size="small"
        variant="text"
        @click.stop="$emit('delete', room)"
      />
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
  import type { RoomListDto } from '@/app/rooms/types'
  import { computed } from 'vue'

  interface Props {
    room: RoomListDto
    showActions?: boolean
    showAdditionalInfo?: boolean
  }

  interface Emits {
    click: [room: RoomListDto]
    edit: [room: RoomListDto]
    delete: [room: RoomListDto]
  }

  const props = withDefaults(defineProps<Props>(), {
    showActions: false,
    showAdditionalInfo: true,
  })

  defineEmits<Emits>()

  // Computed para calcular porcentaje de ocupación
  const occupancyPercentage = computed(() => {
    if (props.room.userLimit === 0) return 0
    return (props.room.currentUserCount / props.room.userLimit) * 100
  })

  // Color de la barra basado en ocupación
  const occupancyColor = computed(() => {
    const percentage = occupancyPercentage.value
    if (percentage >= 90) return 'error'
    if (percentage >= 70) return 'warning'
    return 'success'
  })
</script>

<style scoped>
.room-card {
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  border-radius: 12px;
}

.room-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.room-card--closed {
  opacity: 0.7;
}

.room-card--closed:hover {
  opacity: 0.9;
}
</style>
