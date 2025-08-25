/**
 * Store de autenticación
 * Arquitectura ABCC - App/Auth/Stores Layer
 *
 * Maneja el estado de autenticación del usuario usando authService como única fuente de verdad
 */

import type { AuthRegisterRequest, LoginCredentials, User } from '../types/types'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import authService from '../services/authService'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const token = ref<string | null>(localStorage.getItem('auth_token'))

  // Getters
  const isAuthenticated = computed(() => !!user.value && !!token.value)
  const userRole = computed(() => user.value?.displayName || 'guest')
  const userName = computed(() => user.value?.userName || '')

  // Actions
  async function login (credentials: LoginCredentials) {
    console.log('AuthStore: login action called', credentials)
    isLoading.value = true
    error.value = null

    try {
      const response = await authService.login(credentials)

      // Actualizar estado con la respuesta del servicio
      token.value = response.accessToken ?? ''
      user.value = response.user

      // Persistir en localStorage
      localStorage.setItem('auth_token', response.accessToken ?? '')

      return response
    } catch (error_) {
      error.value = error_ instanceof Error ? error_.message : 'Error al iniciar sesión'
      throw error_
    } finally {
      isLoading.value = false
    }
  }

  async function register (credentials: AuthRegisterRequest) {
    isLoading.value = true
    error.value = null

    try {
      const response = await authService.register(credentials)

      // Actualizar estado con la respuesta del servicio
      token.value = response.accessToken ?? ''

      // Persistir en localStorage
      localStorage.setItem('auth_token', response.accessToken ?? '')

      return response
    } catch (error_) {
      error.value = error_ instanceof Error ? error_.message : 'Error al registrar usuario'
      throw error_
    } finally {
      isLoading.value = false
    }
  }

  async function getCurrentUser () {
    if (!token.value) {
      throw new Error('No hay token de autenticación')
    }

    isLoading.value = true
    error.value = null

    try {
      const userData = await authService.getCurrentUser()
      user.value = userData

      // Actualizar localStorage
      localStorage.setItem('user', JSON.stringify(userData))

      return userData
    } catch (error_) {
      error.value = error_ instanceof Error ? error_.message : 'Error al obtener usuario'
      // Si hay error al obtener el usuario, probablemente el token expiró
      logout()
      throw error_
    } finally {
      isLoading.value = false
    }
  }

  async function verifyToken () {
    if (!token.value) {
      return false
    }

    try {
      const isValid = await authService.verifyToken()
      if (!isValid) {
        logout()
      }
      return isValid
    } catch {
      logout()
      return false
    }
  }

  function logout () {
    user.value = null
    token.value = null
    error.value = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
  }

  function clearError () {
    error.value = null
  }

  async function loadUserFromStorage () {
    const storedUser = localStorage.getItem('user')
    const storedToken = localStorage.getItem('auth_token')

    if (storedUser && storedToken) {
      try {
        user.value = JSON.parse(storedUser)
        token.value = storedToken

        // Verificar que el token sigue siendo válido
        const isValid = await verifyToken()
        if (!isValid) {
          // Token inválido, limpiar todo
          logout()
        }
      } catch {
        // Si hay error al parsear, limpiar storage
        logout()
      }
    }
  }

  // Inicializar al crear el store
  loadUserFromStorage()

  return {
    // State
    user,
    isLoading,
    error,
    token,
    // Getters
    isAuthenticated,
    userRole,
    userName,
    // Actions
    login,
    register,
    getCurrentUser,
    verifyToken,
    logout,
    clearError,
    loadUserFromStorage,
  }
})
