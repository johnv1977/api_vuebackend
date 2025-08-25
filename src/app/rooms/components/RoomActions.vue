<template>
  <div class="room-actions">
    <!-- Acciones principales -->
    <v-btn-group density="comfortable" variant="outlined">
      <v-btn
        color="primary"
        prepend-icon="mdi-pencil"
        @click="$emit('edit')"
      >
        Editar
      </v-btn>

      <v-btn
        color="error"
        prepend-icon="mdi-delete"
        @click="confirmDelete"
      >
        Eliminar
      </v-btn>
    </v-btn-group>

    <!-- Acciones secundarias -->
    <v-btn-group v-if="showSecondaryActions" class="ms-2" density="comfortable" variant="text">
      <v-btn
        :color="room?.isOpen ? 'warning' : 'success'"
        :prepend-icon="room?.isOpen ? 'mdi-lock' : 'mdi-lock-open'"
        @click="toggleRoomStatus"
      >
        {{ room?.isOpen ? 'Cerrar' : 'Abrir' }}
      </v-btn>

      <v-btn
        color="info"
        prepend-icon="mdi-eye"
        @click="$emit('view')"
      >
        Ver detalles
      </v-btn>
    </v-btn-group>

    <!-- Diálogo de confirmación de eliminación -->
    <v-dialog
      v-model="showDeleteDialog"
      max-width="500"
      persistent
    >
      <v-card>
        <v-card-title class="text-h5">
          Confirmar eliminación
        </v-card-title>

        <v-card-text>
          <v-alert
            class="mb-4"
            type="warning"
            variant="tonal"
          >
            Esta acción no se puede deshacer
          </v-alert>

          <p>
            ¿Estás seguro de que quieres eliminar la sala
            <strong>{{ room?.name || 'sin nombre' }}</strong>?
          </p>

          <p class="text-body-2 text-medium-emphasis">
            Se perderán todos los datos asociados a esta sala, incluyendo
            el historial de partidas y usuarios conectados.
          </p>
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn
            variant="text"
            @click="cancelDelete"
          >
            Cancelar
          </v-btn>

          <v-btn
            color="error"
            :loading="loading"
            variant="flat"
            @click="executeDelete"
          >
            Eliminar sala
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Diálogo de confirmación de cambio de estado -->
    <v-dialog
      v-model="showStatusDialog"
      max-width="400"
    >
      <v-card>
        <v-card-title>
          {{ room?.isOpen ? 'Cerrar sala' : 'Abrir sala' }}
        </v-card-title>

        <v-card-text>
          ¿Confirmas que quieres {{ room?.isOpen ? 'cerrar' : 'abrir' }}
          la sala <strong>{{ room?.name }}</strong>?
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn
            variant="text"
            @click="cancelStatusChange"
          >
            Cancelar
          </v-btn>

          <v-btn
            :color="room?.isOpen ? 'warning' : 'success'"
            :loading="loading"
            variant="flat"
            @click="executeStatusChange"
          >
            {{ room?.isOpen ? 'Cerrar' : 'Abrir' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
  import type { RoomResponseDto } from '@/app/rooms/types'
  import { ref } from 'vue'

  interface Props {
    room?: RoomResponseDto | null
    loading?: boolean
    showSecondaryActions?: boolean
  }

  interface Emits {
    'edit': []
    'delete': []
    'view': []
    'toggle-status': []
  }

  const props = withDefaults(defineProps<Props>(), {
    loading: false,
    showSecondaryActions: true,
  })

  const emit = defineEmits<Emits>()

  // State para diálogos
  const showDeleteDialog = ref(false)
  const showStatusDialog = ref(false)

  // Métodos para manejo de eliminación
  function confirmDelete () {
    showDeleteDialog.value = true
  }

  function cancelDelete () {
    showDeleteDialog.value = false
  }

  function executeDelete () {
    emit('delete')
    showDeleteDialog.value = false
  }

  // Métodos para cambio de estado
  function toggleRoomStatus () {
    showStatusDialog.value = true
  }

  function cancelStatusChange () {
    showStatusDialog.value = false
  }

  function executeStatusChange () {
    emit('toggle-status')
    showStatusDialog.value = false
  }
</script>

<style scoped>
  .room-actions {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  @media (max-width: 600px) {
    .room-actions {
      flex-direction: column;
      align-items: stretch;
    }

    .room-actions .v-btn-group {
      width: 100%;
    }
  }
</style>
