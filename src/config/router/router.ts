/**
 * router/index.ts
 *
 * Manual routes configuration
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router'
// Importamos las vistas
import AuthView from '@/app/auth/views/AuthView.vue'
import RegisterView from '@/app/auth/views/RegisterView.vue'
import RoomDetailView from '@/app/rooms/views/RoomDetailView.vue'
import RoomFormView from '@/app/rooms/views/RoomFormView.vue'
import RoomsListView from '@/app/rooms/views/RoomsListView.vue'
import IndexPage from '@/common/pages/index.vue'

// Definimos las rutas manualmente
const routes = [
  {
    path: '/',
    name: 'home',
    component: IndexPage,
  },
  {
    path: '/auth',
    name: 'auth',
    component: AuthView,
    meta: {
      requiresGuest: true, // Solo accesible si no está autenticado
      title: 'Autenticación',
    },
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: {
      requiresGuest: true, // Solo accesible si no está autenticado
      title: 'Autenticación',
    },
  },
  // Rutas del módulo Rooms
  {
    path: '/rooms',
    name: 'rooms',
    component: RoomsListView,
    meta: {
      requiresAuth: true, // Requiere autenticación
      title: 'Salas de juego',
    },
  },
  {
    path: '/rooms/create',
    name: 'rooms-create',
    component: RoomFormView,
    meta: {
      requiresAuth: true,
      requiresAdmin: true, // Solo administradores
      title: 'Crear sala',
    },
  },
  {
    path: '/rooms/:slug',
    name: 'room-detail',
    component: RoomDetailView,
    meta: {
      requiresAuth: true,
      title: 'Detalle de sala',
    },
    props: true, // Pasar parámetros de ruta como props
  },
  {
    path: '/rooms/:slug/edit',
    name: 'room-edit',
    component: RoomFormView,
    meta: {
      requiresAuth: true,
      requiresAdmin: true, // Solo administradores
      title: 'Editar sala',
    },
    props: true, // Pasar parámetros de ruta como props
  },
  // Redirigir cualquier ruta no encontrada a la página de inicio
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Guards de navegación
router.beforeEach(async (to, from, next) => {
  // TODO: Integrar con authStore cuando se complete el task 8
  // Por ahora, permitir todas las navegaciones para desarrollo

  // Obtener meta información de la ruta
  const requiresAuth = to.meta.requiresAuth
  const requiresGuest = to.meta.requiresGuest
  const requiresAdmin = to.meta.requiresAdmin

  // Simular estado de autenticación (se integrará completamente con authStore)
  const isAuthenticated = localStorage.getItem('auth_token') !== null
  // TODO: Implementar verificación real cuando el backend tenga roles
  // import { useAuthStore } from '@/app/auth/stores/authStore'
  // const authStore = useAuthStore()
  // const isAdmin = authStore.hasRole('admin') || authStore.hasPermission('manage_rooms')
  const isAdmin = isAuthenticated // Por ahora cualquier usuario autenticado puede ser admin

  // Lógica de guards (será completada en el task 8)
  if (requiresGuest && isAuthenticated) {
    // Si la ruta requiere ser guest y está autenticado, redirigir al home
    next('/')
    return
  }

  if (requiresAuth && !isAuthenticated) {
    // Si la ruta requiere autenticación y no está autenticado, redirigir al login
    next('/auth')
    return
  }

  if (requiresAdmin && !isAdmin) {
    // Si la ruta requiere admin y no es admin, redirigir al home
    next('/')
    return
  }

  // Permitir navegación
  next()
})

// Guard para actualizar el título de la página
router.afterEach(to => {
  const title = to.meta.title as string
  document.title = title ? `${title} - DnuGame` : 'DnuGame'
})

export default router
