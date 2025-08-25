/**
 * useRoomForm Composable
 * Arquitectura ABCC - App/Rooms/Composables Layer
 *
 * Composable para manejar la lógica de formularios de salas
 * Incluye validaciones, formateo y estado del formulario
 */

import type { CreateRoomDto, RoomFormData, RoomFormValidation, RoomResponseDto, UpdateRoomDto } from '@/app/rooms/types'
import { reactive, ref, watch } from 'vue'

export function useRoomForm (initialData?: RoomResponseDto | null) {
  // Estado del formulario
  const formData = reactive<RoomFormData>({
    name: '',
    slug: '',
    color: '#1976d2',
    icon: 'mdi-gamepad-variant',
    userLimit: 10,
    isOpen: true,
  })

  // Estado de validación
  const validation = reactive<RoomFormValidation>({
    name: { valid: true, errors: [] },
    slug: { valid: true, errors: [] },
    color: { valid: true, errors: [] },
    icon: { valid: true, errors: [] },
    userLimit: { valid: true, errors: [] },
  })

  // Estados del formulario
  const isDirty = ref(false)
  const hasBeenSubmitted = ref(false)

  // Inicializar con datos existentes si se proporcionan
  function initializeForm (data?: RoomResponseDto | null) {
    if (data) {
      formData.name = data.name || ''
      formData.slug = data.slug || ''
      formData.color = data.color || '#1976d2'
      formData.icon = data.icon || 'mdi-gamepad-variant'
      formData.userLimit = data.userLimit
      formData.isOpen = data.isOpen
    } else {
      resetForm()
    }

    isDirty.value = false
    hasBeenSubmitted.value = false
    clearValidationErrors()
  }

  // Reset del formulario
  function resetForm () {
    formData.name = ''
    formData.slug = ''
    formData.color = '#1976d2'
    formData.icon = 'mdi-gamepad-variant'
    formData.userLimit = 10
    formData.isOpen = true

    isDirty.value = false
    hasBeenSubmitted.value = false
    clearValidationErrors()
  }

  // Limpiar errores de validación
  function clearValidationErrors () {
    for (const key of Object.keys(validation)) {
      const field = key as keyof RoomFormValidation
      validation[field].valid = true
      validation[field].errors = []
    }
  }

  // Validaciones individuales
  function validateName (): boolean {
    validation.name.errors = []

    if (!formData.name.trim()) {
      validation.name.errors.push('El nombre es obligatorio')
    } else if (formData.name.length > 100) {
      validation.name.errors.push('El nombre no puede tener más de 100 caracteres')
    } else if (formData.name.length < 3) {
      validation.name.errors.push('El nombre debe tener al menos 3 caracteres')
    }

    validation.name.valid = validation.name.errors.length === 0
    return validation.name.valid
  }

  function validateSlug (): boolean {
    validation.slug.errors = []

    if (!formData.slug.trim()) {
      validation.slug.errors.push('El slug es obligatorio')
    } else if (formData.slug.length > 50) {
      validation.slug.errors.push('El slug no puede tener más de 50 caracteres')
    } else if (formData.slug.length < 3) {
      validation.slug.errors.push('El slug debe tener al menos 3 caracteres')
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      validation.slug.errors.push('El slug solo puede contener letras minúsculas, números y guiones')
    } else if (formData.slug.startsWith('-') || formData.slug.endsWith('-')) {
      validation.slug.errors.push('El slug no puede empezar o terminar con guiones')
    } else if (formData.slug.includes('--')) {
      validation.slug.errors.push('El slug no puede contener guiones consecutivos')
    }

    validation.slug.valid = validation.slug.errors.length === 0
    return validation.slug.valid
  }

  function validateColor (): boolean {
    validation.color.errors = []

    if (!formData.color.trim()) {
      validation.color.errors.push('El color es obligatorio')
    } else if (!/^#[0-9A-Fa-f]{6}$/.test(formData.color)) {
      validation.color.errors.push('El color debe estar en formato hexadecimal (#RRGGBB)')
    }

    validation.color.valid = validation.color.errors.length === 0
    return validation.color.valid
  }

  function validateIcon (): boolean {
    validation.icon.errors = []

    if (!formData.icon.trim()) {
      validation.icon.errors.push('El icono es obligatorio')
    } else if (formData.icon.length > 100) {
      validation.icon.errors.push('El icono no puede tener más de 100 caracteres')
    } else if (!formData.icon.startsWith('mdi-')) {
      validation.icon.errors.push('El icono debe empezar con "mdi-"')
    }

    validation.icon.valid = validation.icon.errors.length === 0
    return validation.icon.valid
  }

  function validateUserLimit (): boolean {
    validation.userLimit.errors = []

    if (formData.userLimit < 2) {
      validation.userLimit.errors.push('El límite mínimo es 2 usuarios')
    } else if (formData.userLimit > 50) {
      validation.userLimit.errors.push('El límite máximo es 50 usuarios')
    } else if (!Number.isInteger(formData.userLimit)) {
      validation.userLimit.errors.push('El límite debe ser un número entero')
    }

    validation.userLimit.valid = validation.userLimit.errors.length === 0
    return validation.userLimit.valid
  }

  // Validación completa del formulario
  function validateForm (): boolean {
    const nameValid = validateName()
    const slugValid = validateSlug()
    const colorValid = validateColor()
    const iconValid = validateIcon()
    const userLimitValid = validateUserLimit()

    return nameValid && slugValid && colorValid && iconValid && userLimitValid
  }

  // Formateo automático del slug
  function formatSlug (fromName = false) {
    // Usar expresión ternaria para asignar el slug
    formData.slug = (fromName && formData.name ? formData.name : formData.slug)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  // Sugerencias para colores comunes
  const colorSuggestions = [
    { name: 'Azul', value: '#1976d2' },
    { name: 'Verde', value: '#388e3c' },
    { name: 'Rojo', value: '#d32f2f' },
    { name: 'Naranja', value: '#f57c00' },
    { name: 'Púrpura', value: '#7b1fa2' },
    { name: 'Teal', value: '#00796b' },
    { name: 'Índigo', value: '#303f9f' },
    { name: 'Rosa', value: '#c2185b' },
  ]

  // Sugerencias para iconos comunes
  const iconSuggestions = [
    { name: 'Gamepad', value: 'mdi-gamepad-variant' },
    { name: 'Cartas', value: 'mdi-cards' },
    { name: 'Dados', value: 'mdi-dice-multiple' },
    { name: 'Ajedrez', value: 'mdi-chess-pawn' },
    { name: 'Puzzle', value: 'mdi-puzzle' },
    { name: 'Corona', value: 'mdi-crown' },
    { name: 'Espada', value: 'mdi-sword' },
    { name: 'Estrella', value: 'mdi-star' },
    { name: 'Fuego', value: 'mdi-fire' },
    { name: 'Rayo', value: 'mdi-lightning-bolt' },
  ]

  // Obtener datos para envío
  function getFormData (): CreateRoomDto | UpdateRoomDto {
    return {
      name: formData.name.trim(),
      slug: formData.slug.trim(),
      color: formData.color.trim(),
      icon: formData.icon.trim(),
      userLimit: formData.userLimit,
      isOpen: formData.isOpen,
    }
  }

  // Verificar si el formulario está listo para envío
  function canSubmit (): boolean {
    return validateForm() && isDirty.value
  }

  // Marcar como enviado
  function markAsSubmitted () {
    hasBeenSubmitted.value = true
  }

  // Watchers para validación en tiempo real
  watch(() => formData.name, () => {
    isDirty.value = true
    if (hasBeenSubmitted.value) {
      validateName()
    }
  })

  watch(() => formData.slug, () => {
    isDirty.value = true
    if (hasBeenSubmitted.value) {
      validateSlug()
    }
  })

  watch(() => formData.color, () => {
    isDirty.value = true
    if (hasBeenSubmitted.value) {
      validateColor()
    }
  })

  watch(() => formData.icon, () => {
    isDirty.value = true
    if (hasBeenSubmitted.value) {
      validateIcon()
    }
  })

  watch(() => formData.userLimit, () => {
    isDirty.value = true
    if (hasBeenSubmitted.value) {
      validateUserLimit()
    }
  })

  watch(() => formData.isOpen, () => {
    isDirty.value = true
  })

  // Inicializar con datos si se proporcionan
  if (initialData) {
    initializeForm(initialData)
  }

  return {
    // Estado del formulario
    formData,
    validation,
    isDirty,
    hasBeenSubmitted,

    // Métodos de inicialización
    initializeForm,
    resetForm,
    clearValidationErrors,

    // Validaciones
    validateName,
    validateSlug,
    validateColor,
    validateIcon,
    validateUserLimit,
    validateForm,

    // Utilidades
    formatSlug,
    getFormData,
    canSubmit,
    markAsSubmitted,

    // Sugerencias
    colorSuggestions,
    iconSuggestions,
  }
}
