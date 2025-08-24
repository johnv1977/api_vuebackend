/**
 * Configuración principal de Pinia
 * Arquitectura ABCC - Config Layer
 *
 * Este archivo centraliza la configuración de Pinia y exporta
 * la instancia del store para ser utilizada en la aplicación.
 */

import type { App } from 'vue'
import { createPinia } from 'pinia'

// Crear instancia de Pinia
export const pinia = createPinia()

/**
 * Plugin para instalar Pinia en la aplicación Vue
 * @param app - Instancia de la aplicación Vue
 */
export function installPinia (app: App): void {
  app.use(pinia)
}

/**
 * Configuración por defecto de Pinia
 */
export const piniaConfig = {
  // Configuraciones adicionales se pueden agregar aquí
  // Por ejemplo: plugins, devtools, etc.
}

// Re-exportar tipos y utilidades de Pinia para fácil acceso
export { defineStore, storeToRefs } from 'pinia'
export type { Store, StoreDefinition } from 'pinia'
