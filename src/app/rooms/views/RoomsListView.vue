<template>
  <v-container fluid>
    <!-- Header de la página -->
    <v-row>
      <v-col>
        <div class="d-flex justify-space-between align-center mb-6">
          <div>
            <h1 class="text-h4 font-weight-bold">
              Salas de juego
            </h1>
            <p class="text-body-1 text-medium-emphasis mt-2">
              Explora y únete a las salas disponibles
            </p>
          </div>

          <!-- Botón crear sala (solo admin) -->
          <v-btn
            v-if="hasAdminPermissions"
            color="primary"
            prepend-icon="mdi-plus"
            size="large"
            @click="goToCreateRoom"
          >
            Crear sala
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Filtros -->
    <v-row>
      <v-col>
        <RoomFilters
          v-model="filters"
          @apply="applyFilters"
          @reset="resetFilters"
        />
      </v-col>
    </v-row>

    <!-- Estado de carga -->
    <v-row v-if="isLoading">
      <v-col>
        <div class="text-center py-8">
          <v-progress-circular
            color="primary"
            indeterminate
            size="64"
          />
          <p class="text-body-1 mt-4">
            Cargando salas...
          </p>
        </div>
      </v-col>
    </v-row>

    <!-- Error -->
    <v-row v-else-if="error">
      <v-col>
        <v-alert
          class="mb-4"
          type="error"
          variant="tonal"
        >
          <v-alert-title>Error al cargar salas</v-alert-title>
          {{ error }}
        </v-alert>

        <div class="text-center">
          <v-btn
            color="primary"
            variant="outlined"
            @click="fetchRooms"
          >
            Reintentar
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Lista vacía -->
    <v-row v-else-if="!hasRooms">
      <v-col>
        <v-empty-state
          headline="No hay salas disponibles"
          image="/empty-rooms.svg"
          text="Sé el primero en crear una sala para comenzar a jugar"
          title="Aún no se han creado salas"
        >
          <template #actions>
            <v-btn
              v-if="hasAdminPermissions"
              color="primary"
              variant="flat"
              @click="goToCreateRoom"
            >
              Crear primera sala
            </v-btn>
          </template>
        </v-empty-state>
      </v-col>
    </v-row>

    <!-- Lista de salas -->
    <template v-else>
      <!-- Estadísticas rápidas -->
      <v-row class="mb-4">
        <v-col>
          <v-sheet class="pa-4" color="surface-variant" rounded>
            <div class="d-flex justify-space-around text-center">
              <div>
                <div class="text-h5 font-weight-bold">{{ totalCount }}</div>
                <div class="text-caption">Total salas</div>
              </div>
              <v-divider vertical />
              <div>
                <div class="text-h5 font-weight-bold text-success">{{ openRooms }}</div>
                <div class="text-caption">Abiertas</div>
              </div>
              <v-divider vertical />
              <div>
                <div class="text-h5 font-weight-bold text-error">{{ closedRooms }}</div>
                <div class="text-caption">Cerradas</div>
              </div>
            </div>
          </v-sheet>
        </v-col>
      </v-row>

      <!-- Grid de salas -->
      <v-row>
        <v-col
          v-for="room in filteredRooms"
          :key="room.id"
          cols="12"
          lg="3"
          md="4"
          sm="6"
        >
          <RoomCard
            :room="room"
            :show-actions="hasAdminPermissions"
            @click="goToRoomDetail"
            @delete="confirmDeleteRoom"
            @edit="goToEditRoom"
          />
        </v-col>
      </v-row>

      <!-- Paginación -->
      <v-row v-if="totalPages > 1">
        <v-col>
          <RoomPagination
            :current-page="currentPage"
            :page-size="pageSize"
            show-quick-navigation
            :total-count="totalCount"
            :total-pages="totalPages"
            @update:page="changePage"
          />
        </v-col>
      </v-row>
    </template>

    <!-- Diálogo de confirmación para eliminar -->
    <v-dialog
      v-model="showDeleteDialog"
      max-width="500"
      persistent
    >
      <v-card>
        <v-card-title>Eliminar sala</v-card-title>

        <v-card-text>
          ¿Estás seguro de que quieres eliminar la sala
          <strong>{{ roomToDelete?.name }}</strong>?
          Esta acción no se puede deshacer.
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
            :loading="isDeleting"
            variant="flat"
            @click="executeDelete"
          >
            Eliminar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
  import type { RoomListDto } from '@/app/rooms/types'
  import { computed, onMounted, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import RoomCard from '@/app/rooms/components/RoomCard.vue'
  import RoomFilters from '@/app/rooms/components/RoomFilters.vue'
  import RoomPagination from '@/app/rooms/components/RoomPagination.vue'
  import { useRoomsStore } from '@/app/rooms/stores/roomsStore'

  // Composables
  const router = useRouter()
  const roomsStore = useRoomsStore()

  // State local
  const showDeleteDialog = ref(false)
  const roomToDelete = ref<RoomListDto | null>(null)

  // Computed del store
  const rooms = computed(() => roomsStore.rooms)
  const filteredRooms = computed(() => roomsStore.filteredRooms)
  const totalCount = computed(() => roomsStore.totalCount)
  const totalPages = computed(() => roomsStore.totalPages)
  const currentPage = computed(() => roomsStore.currentPage)
  const pageSize = computed(() => roomsStore.pageSize)
  const hasRooms = computed(() => roomsStore.hasRooms)
  const isLoading = computed(() => roomsStore.loadingStates.list)
  const error = computed(() => roomsStore.errorStates.list)
  const filters = computed({
    get: () => roomsStore.filters,
    set: value => roomsStore.updateFilters(value),
  })

  // Estados derivados
  const openRooms = computed(() => rooms.value.filter(room => room.isOpen).length)
  const closedRooms = computed(() => rooms.value.filter(room => !room.isOpen).length)
  const isDeleting = computed(() => roomsStore.loadingStates.delete)
  const hasAdminPermissions = computed(() => roomsStore.hasAdminPermissions())

  // Métodos
  async function fetchRooms () {
    try {
      await roomsStore.fetchRooms()
    } catch (error) {
      console.error('Error fetching rooms:', error)
    }
  }

  async function applyFilters () {
    await fetchRooms()
  }

  async function resetFilters () {
    roomsStore.resetFilters()
    await fetchRooms()
  }

  async function changePage (page: number) {
    roomsStore.setPage(page)
    await fetchRooms()
  }

  // Navegación
  function goToCreateRoom () {
    router.push('/rooms/create')
  }

  function goToRoomDetail (room: RoomListDto) {
    router.push(`/rooms/${room.slug}`)
  }

  function goToEditRoom (room: RoomListDto) {
    router.push(`/rooms/${room.slug}/edit`)
  }

  // Eliminar sala
  function confirmDeleteRoom (room: RoomListDto) {
    roomToDelete.value = room
    showDeleteDialog.value = true
  }

  function cancelDelete () {
    roomToDelete.value = null
    showDeleteDialog.value = false
  }

  async function executeDelete () {
    if (!roomToDelete.value) return

    try {
      await roomsStore.deleteRoom(roomToDelete.value.id)

      // Mostrar notificación de éxito
      console.log('Sala eliminada exitosamente')

      // Cerrar diálogo
      cancelDelete()
    } catch (error) {
      console.error('Error deleting room:', error)
    }
  }

  // Lifecycle
  onMounted(() => {
    fetchRooms()
  })
</script>

<style scoped>
  .v-container {
    max-width: 1200px;
  }

  @media (max-width: 960px) {
    .text-h4 {
      font-size: 1.5rem !important;
    }
  }
</style>
