<template>
  <v-container fluid>
    <!-- Loading state -->
    <div v-if="isLoading" class="text-center py-12">
      <v-progress-circular
        color="primary"
        indeterminate
        size="64"
      />
      <p class="text-body-1 mt-4">
        Cargando sala...
      </p>
    </div>

    <!-- Error state -->
    <v-alert
      v-else-if="error"
      class="mb-6"
      type="error"
      variant="tonal"
    >
      <v-alert-title>Error al cargar sala</v-alert-title>
      {{ error }}

      <template #append>
        <v-btn
          color="error"
          variant="text"
          @click="retry"
        >
          Reintentar
        </v-btn>
      </template>
    </v-alert>

    <!-- Contenido principal -->
    <template v-else-if="room">
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

      <!-- Header de la sala -->
      <v-row class="mb-6">
        <v-col>
          <v-card
            class="pa-6"
            :color="room.color || 'primary'"
            variant="flat"
          >
            <div class="d-flex align-center">
              <v-icon
                v-if="room.icon"
                class="me-4"
                :icon="room.icon"
                size="x-large"
              />

              <div class="flex-grow-1">
                <h1 class="text-h3 font-weight-bold text-white">
                  {{ room.name || 'Sala sin nombre' }}
                </h1>
                <p class="text-h6 text-white opacity-90 mt-2">
                  {{ room.slug }}
                </p>

                <!-- Estado y estadísticas -->
                <div class="d-flex align-center mt-4">
                  <v-chip
                    class="me-3"
                    :color="room.isOpen ? 'success' : 'error'"
                    variant="elevated"
                  >
                    <v-icon
                      :icon="room.isOpen ? 'mdi-check-circle' : 'mdi-close-circle'"
                      start
                    />
                    {{ room.isOpen ? 'Abierta' : 'Cerrada' }}
                  </v-chip>

                  <v-chip
                    class="me-3"
                    color="white"
                    variant="elevated"
                  >
                    <v-icon icon="mdi-account-group" start />
                    {{ room.currentUserCount }}/{{ room.userLimit }}
                  </v-chip>

                  <v-chip
                    :color="occupancyColor"
                    variant="elevated"
                  >
                    {{ occupancyPercentage }}% ocupada
                  </v-chip>
                </div>
              </div>

              <!-- Acciones admin -->
              <div v-if="hasAdminPermissions" class="ms-4">
                <RoomActions
                  :loading="isActionLoading"
                  :room="room"
                  @delete="confirmDelete"
                  @edit="goToEdit"
                  @toggle-status="toggleStatus"
                  @view="scrollToDetails"
                />
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Información detallada -->
      <v-row>
        <!-- Información general -->
        <v-col cols="12" md="8">
          <v-card variant="outlined">
            <v-card-title>
              <v-icon class="me-2" icon="mdi-information" />
              Información de la sala
            </v-card-title>

            <v-card-text>
              <v-row>
                <v-col cols="12" sm="6">
                  <div class="mb-4">
                    <h4 class="text-h6 mb-2">Detalles básicos</h4>
                    <v-list density="compact">
                      <v-list-item>
                        <template #prepend>
                          <v-icon icon="mdi-identifier" />
                        </template>
                        <v-list-item-title>ID</v-list-item-title>
                        <v-list-item-subtitle>{{ room.id }}</v-list-item-subtitle>
                      </v-list-item>

                      <v-list-item>
                        <template #prepend>
                          <v-icon icon="mdi-link" />
                        </template>
                        <v-list-item-title>Slug</v-list-item-title>
                        <v-list-item-subtitle>{{ room.slug }}</v-list-item-subtitle>
                      </v-list-item>

                      <v-list-item>
                        <template #prepend>
                          <v-icon icon="mdi-palette" />
                        </template>
                        <v-list-item-title>Color</v-list-item-title>
                        <v-list-item-subtitle>
                          <v-chip
                            class="me-2"
                            :color="room.color || 'primary'"
                            size="small"
                          />
                          {{ room.color }}
                        </v-list-item-subtitle>
                      </v-list-item>
                    </v-list>
                  </div>
                </v-col>

                <v-col cols="12" sm="6">
                  <div class="mb-4">
                    <h4 class="text-h6 mb-2">Configuración</h4>
                    <v-list density="compact">
                      <v-list-item>
                        <template #prepend>
                          <v-icon icon="mdi-account-group" />
                        </template>
                        <v-list-item-title>Límite de usuarios</v-list-item-title>
                        <v-list-item-subtitle>{{ room.userLimit }} usuarios máximo</v-list-item-subtitle>
                      </v-list-item>

                      <v-list-item>
                        <template #prepend>
                          <v-icon :icon="room.isOpen ? 'mdi-lock-open' : 'mdi-lock'" />
                        </template>
                        <v-list-item-title>Estado</v-list-item-title>
                        <v-list-item-subtitle>
                          {{ room.isOpen ? 'Abierta para nuevos usuarios' : 'Cerrada' }}
                        </v-list-item-subtitle>
                      </v-list-item>

                      <v-list-item>
                        <template #prepend>
                          <v-icon icon="mdi-calendar-clock" />
                        </template>
                        <v-list-item-title>Creada</v-list-item-title>
                        <v-list-item-subtitle>{{ formattedCreatedAt }}</v-list-item-subtitle>
                      </v-list-item>
                    </v-list>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Panel lateral -->
        <v-col cols="12" md="4">
          <!-- Ocupación actual -->
          <v-card class="mb-4" variant="outlined">
            <v-card-title>
              <v-icon class="me-2" icon="mdi-chart-arc" />
              Ocupación actual
            </v-card-title>

            <v-card-text>
              <div class="text-center">
                <v-progress-circular
                  class="mb-4"
                  :color="occupancyColor"
                  :model-value="occupancyPercentage"
                  size="120"
                  width="8"
                >
                  <span class="text-h4 font-weight-bold">
                    {{ occupancyPercentage }}%
                  </span>
                </v-progress-circular>

                <p class="text-body-1">
                  {{ room.currentUserCount }} de {{ room.userLimit }} usuarios
                </p>

                <v-chip
                  class="mt-2"
                  :color="occupancyColor"
                  variant="tonal"
                >
                  {{ occupancyStatus }}
                </v-chip>
              </div>
            </v-card-text>
          </v-card>

          <!-- Acciones rápidas -->
          <v-card variant="outlined">
            <v-card-title>
              <v-icon class="me-2" icon="mdi-lightning-bolt" />
              Acciones rápidas
            </v-card-title>

            <v-card-text>
              <div class="d-flex flex-column ga-2">
                <v-btn
                  v-if="room.isOpen"
                  block
                  color="success"
                  prepend-icon="mdi-play"
                  variant="flat"
                  @click="joinRoom"
                >
                  Unirse a la sala
                </v-btn>

                <v-btn
                  v-else
                  block
                  color="secondary"
                  disabled
                  prepend-icon="mdi-lock"
                  variant="outlined"
                >
                  Sala cerrada
                </v-btn>

                <v-btn
                  block
                  color="primary"
                  prepend-icon="mdi-share"
                  variant="outlined"
                  @click="shareRoom"
                >
                  Compartir sala
                </v-btn>

                <v-btn
                  block
                  color="info"
                  prepend-icon="mdi-arrow-left"
                  variant="text"
                  @click="goBack"
                >
                  Volver a la lista
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <!-- Estado no encontrado -->
    <v-empty-state
      v-else
      headline="Sala no encontrada"
      text="Es posible que la sala haya sido eliminada o el enlace sea incorrecto"
      title="La sala que buscas no existe"
    >
      <template #actions>
        <v-btn
          color="primary"
          variant="flat"
          @click="goToRoomsList"
        >
          Ver todas las salas
        </v-btn>
      </template>
    </v-empty-state>
  </v-container>
</template>

<script setup lang="ts">
  import { computed, onMounted, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import RoomActions from '@/app/rooms/components/RoomActions.vue'
  import { useRoomsStore } from '@/app/rooms/stores/roomsStore'

  // Composables
  const route = useRoute()
  const router = useRouter()
  const roomsStore = useRoomsStore()

  // Computed del store
  const room = computed(() => roomsStore.currentRoom)
  const isLoading = computed(() => roomsStore.loadingStates.detail)
  const error = computed(() => roomsStore.errorStates.detail)
  const isActionLoading = computed(() =>
    roomsStore.loadingStates.update || roomsStore.loadingStates.delete,
  )
  const hasAdminPermissions = computed(() => roomsStore.hasAdminPermissions())

  // Computed para datos de la sala
  const occupancyPercentage = computed(() => {
    if (!room.value || room.value.userLimit === 0) return 0
    return Math.round((room.value.currentUserCount / room.value.userLimit) * 100)
  })

  const occupancyColor = computed(() => {
    const percentage = occupancyPercentage.value
    if (percentage >= 90) return 'error'
    if (percentage >= 70) return 'warning'
    return 'success'
  })

  const occupancyStatus = computed(() => {
    const percentage = occupancyPercentage.value
    if (percentage >= 100) return 'Completa'
    if (percentage >= 90) return 'Casi llena'
    if (percentage >= 70) return 'Muy ocupada'
    if (percentage >= 30) return 'Moderadamente ocupada'
    return 'Disponible'
  })

  const formattedCreatedAt = computed(() => {
    if (!room.value?.createdAt) return 'No disponible'
    return new Date(room.value.createdAt).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  })

  const breadcrumbs = computed(() => [
    {
      title: 'Salas',
      to: '/rooms',
      disabled: false,
    },
    {
      title: room.value?.name || 'Sala',
      to: undefined,
      disabled: true,
    },
  ])

  // Métodos
  async function fetchRoom () {
    const slug = route.params.slug as string
    if (!slug) return

    try {
      await roomsStore.fetchRoomBySlug(slug)
    } catch (error) {
      console.error('Error fetching room:', error)
    }
  }

  function retry () {
    fetchRoom()
  }

  function goToEdit () {
    if (room.value?.slug) {
      router.push(`/rooms/${room.value.slug}/edit`)
    }
  }

  function confirmDelete () {
    // Esta funcionalidad se maneja en el componente RoomActions
    console.log('Delete confirmed')
  }

  async function toggleStatus () {
    if (!room.value) return

    try {
      await roomsStore.updateRoom(room.value.slug!, {
        isOpen: !room.value.isOpen,
      })
    } catch (error) {
      console.error('Error toggling room status:', error)
    }
  }

  function scrollToDetails () {
    // Scroll suave a la sección de detalles
    const element = document.querySelector('[data-details]')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  function joinRoom () {
    // TODO: Implementar lógica para unirse a la sala
    console.log('Joining room:', room.value?.slug)
  }

  function shareRoom () {
    // Compartir URL de la sala
    if (navigator.share && room.value) {
      navigator.share({
        title: `Sala ${room.value.name}`,
        text: `Únete a la sala ${room.value.name}`,
        url: window.location.href,
      })
    } else {
      // Fallback: copiar al portapapeles
      navigator.clipboard.writeText(window.location.href)
      console.log('URL copiada al portapapeles')
    }
  }

  function goBack () {
    router.go(-1)
  }

  function goToRoomsList () {
    router.push('/rooms')
  }

  // Watchers
  watch(() => route.params.slug, fetchRoom, { immediate: true })

  // Lifecycle
  onMounted(() => {
    if (route.params.slug) {
      fetchRoom()
    }
  })
</script>

<style scoped>
  .v-container {
    max-width: 1200px;
  }

  @media (max-width: 960px) {
    .text-h3 {
      font-size: 2rem !important;
    }
  }
</style>
