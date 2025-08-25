/**
 * router/index.ts
 *
 * Manual routes configuration
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router'
// Importamos las vistas
import AuthView from '@/app/auth/views/AuthView.vue'
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
    component: AuthView,
    meta: {
      requiresGuest: true, // Solo accesible si no está autenticado
      title: 'Autenticación',
    },
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

export default router
