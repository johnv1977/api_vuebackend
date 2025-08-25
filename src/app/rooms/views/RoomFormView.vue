<template>
  <v-container fluid>
    <!-- Breadcrumbs -->
    <v-breadcrumbs
      class="px-0 mb-4"
      :items="breadcrumbs"
    >
      <template #item="{ item }">
        <v-breadcrumbs-item
          :disabled="item.disabled"
          :to="item.to"
        >
          {{ item.title }}
        </v-breadcrumbs-item>
      </template>
    </v-breadcrumbs>

    <!-- Loading state para obtener datos de edición -->
    <div v-if="isLoadingRoom" class="text-center py-12">
      <v-progress-circular
        color="primary"
        indeterminate
        size="64"
      />
      <p class="text-body-1 mt-4">
        Cargando datos de la sala...
      </p>
    </div>

    <!-- Error al cargar sala para edición -->
    <v-alert
      v-else-if="loadError"
      class="mb-6"
      type="error"
      variant="tonal"
    >
      <v-alert-title>Error al cargar sala</v-alert-title>
      {{ loadError }}

      <template #append>
        <v-btn
          color="error"
          variant="text"
          @click="retryLoad"
        >
          Reintentar
        </v-btn>
      </template>
    </v-alert>

    <!-- Formulario principal -->
    <v-row v-else>
      <v-col class="mx-auto" cols="12" lg="8" xl="6">
        <RoomForm
          :initial-data="initialData"
          :loading="isSubmitting"
          :show-preview="true"
          @cancel="handleCancel"
          @submit="handleSubmit"
        />
      </v-col>
    </v-row>

    <!-- Snackbar para notificaciones -->
    <v-snackbar
      v-model="showNotification"
      :color="notificationType"
      location="top"
      :timeout="5000"
    >
      {{ notificationMessage }}

      <template #actions>
        <v-btn
          variant="text"
          @click="showNotification = false"
        >
          Cerrar
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
  import type { CreateRoomDto, RoomResponseDto, UpdateRoomDto } from '@/app/rooms/types'
  import { computed, onMounted, ref, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import RoomForm from '@/app/rooms/components/RoomForm.vue'
  import { useRoomsStore } from '@/app/rooms/stores/roomsStore'

  // Composables
  const route = useRoute()
  const router = useRouter()
  const roomsStore = useRoomsStore()

  // State local
  const showNotification = ref(false)
  const notificationMessage = ref('')
  const notificationType = ref<'success' | 'error' | 'warning' | 'info'>('success')

  // Computed
  const isEditing = computed(() => !!route.params.slug)
  const roomSlug = computed(() => route.params.slug as string)

  const initialData = computed(() => {
    return isEditing.value ? roomsStore.currentRoom : null
  })

  const isLoadingRoom = computed(() =>
    isEditing.value && roomsStore.loadingStates.detail,
  )

  const loadError = computed(() =>
    isEditing.value ? roomsStore.errorStates.detail : null,
  )

  const isSubmitting = computed(() =>
    roomsStore.loadingStates.create || roomsStore.loadingStates.update,
  )

  const breadcrumbs = computed(() => {
    const items = [
      {
        title: 'Salas',
        to: '/rooms',
        disabled: false,
      },
    ]

    if (isEditing.value && initialData.value) {
      items.push(
        {
          title: initialData.value.name || 'Sala',
          to: `/rooms/${initialData.value.slug}`,
          disabled: false,
        },
        {
          title: 'Editar',
          to: '',
          disabled: true,
        },
      )
    } else {
      items.push({
        title: 'Crear sala',
        to: '',
        disabled: true,
      })
    }

    return items
  })

  // Métodos
  async function loadRoomForEdit () {
    if (!isEditing.value || !roomSlug.value) return

    try {
      await roomsStore.fetchRoomBySlug(roomSlug.value)
    } catch (error) {
      console.error('Error loading room for edit:', error)
    }
  }

  function retryLoad () {
    loadRoomForEdit()
  }

  async function handleSubmit (data: CreateRoomDto | UpdateRoomDto) {
    try {
      let result: RoomResponseDto

      if (isEditing.value && roomSlug.value) {
        // Actualizar sala existente
        result = await roomsStore.updateRoom(roomSlug.value, data as UpdateRoomDto)

        showSuccess('Sala actualizada exitosamente')

        // Redirigir al detalle de la sala
        router.push(`/rooms/${result.slug}`)
      } else {
        // Crear nueva sala
        result = await roomsStore.createRoom(data as CreateRoomDto)

        showSuccess('Sala creada exitosamente')

        // Redirigir al detalle de la nueva sala
        router.push(`/rooms/${result.slug}`)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error inesperado'
      showError(message)
    }
  }

  function handleCancel () {
    // Preguntar si quiere descartar cambios si hay datos
    const confirmDiscard = window.confirm(
      '¿Estás seguro de que quieres cancelar? Se perderán los cambios no guardados.',
    )

    if (confirmDiscard) {
      if (isEditing.value && initialData.value) {
        // Volver al detalle de la sala
        router.push(`/rooms/${initialData.value.slug}`)
      } else {
        // Volver a la lista de salas
        router.push('/rooms')
      }
    }
  }

  // Utilidades para notificaciones
  function showSuccess (message: string) {
    notificationMessage.value = message
    notificationType.value = 'success'
    showNotification.value = true
  }

  function showError (message: string) {
    notificationMessage.value = message
    notificationType.value = 'error'
    showNotification.value = true
  }

  function showWarning (message: string) {
    notificationMessage.value = message
    notificationType.value = 'warning'
    showNotification.value = true
  }

  // Verificar permisos de administrador
  function checkAdminPermissions (): boolean {
    const hasPermissions = roomsStore.hasAdminPermissions()

    if (!hasPermissions) {
      showError('No tienes permisos para realizar esta acción')
      router.push('/rooms')
      return false
    }

    return true
  }

  // Lifecycle hooks
  onMounted(() => {
    // Verificar permisos antes de cargar
    if (!checkAdminPermissions()) return

    // Cargar datos de la sala si estamos editando
    if (isEditing.value) {
      loadRoomForEdit()
    }
  })

  // Watchers
  watch(() => route.params.slug, newSlug => {
    if (newSlug && isEditing.value) {
      loadRoomForEdit()
    }
  })

  // Limpiar estado al salir del componente
  watch(() => route.path, newPath => {
    if (!newPath.includes('/rooms/')) {
      roomsStore.clearCurrentRoom()
      roomsStore.clearErrors()
    }
  })
</script>

<style scoped>
  .v-container {
    max-width: 1200px;
  }

  @media (max-width: 960px) {
    .v-col {
      padding: 0 16px;
    }
  }
</style>
