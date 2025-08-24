/**
 * Store de ejemplo para demostrar el uso de Pinia
 * Arquitectura ABCC - App/Ejemplo/Stores Layer
 *
 * Este archivo muestra cómo crear stores siguiendo las mejores prácticas
 * y la estructura ABCC.
 */

import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

/**
 * Store de ejemplo usando Composition API
 */
export const useExampleStore = defineStore('example', () => {
  // State (reactive data)
  const count = ref(0)
  const name = ref('Ejemplo Store')

  // Getters (computed properties)
  const doubleCount = computed(() => count.value * 2)
  const upperName = computed(() => name.value.toUpperCase())

  // Actions (methods)
  function increment () {
    count.value++
  }

  function decrement () {
    count.value--
  }

  function reset () {
    count.value = 0
  }

  function setName (newName: string) {
    name.value = newName
  }

  // Return state, getters y actions
  return {
    // State
    count,
    name,
    // Getters
    doubleCount,
    upperName,
    // Actions
    increment,
    decrement,
    reset,
    setName,
  }
})

/**
 * Store de ejemplo usando Options API (alternativa)
 */
export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0,
    title: 'Counter Store',
  }),

  getters: {
    doubleCount: state => state.count * 2,
    countPlusOne (): number {
      return this.count + 1
    },
  },

  actions: {
    increment () {
      this.count++
    },

    async incrementAsync () {
      // Simular operación asíncrona
      await new Promise(resolve => setTimeout(resolve, 1000))
      this.increment()
    },
  },
})
