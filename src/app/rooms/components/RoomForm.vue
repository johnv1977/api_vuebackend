<template>
  <v-form ref="formRef" @submit.prevent="submitForm">
    <v-card>
      <v-card-title class="text-h5">
        {{ isEditing ? 'Editar sala' : 'Crear nueva sala' }}
      </v-card-title>

      <v-card-text>
        <v-row>
          <!-- Nombre de la sala -->
          <v-col cols="12" md="6">
            <v-text-field
              v-model="formData.name"
              counter
              :error-messages="errors.name"
              label="Nombre de la sala *"
              maxlength="100"
              placeholder="Ej: Sala Principal"
              required
              variant="outlined"
            />
          </v-col>

          <!-- Slug de la sala -->
          <v-col cols="12" md="6">
            <v-text-field
              v-model="formData.slug"
              counter
              :error-messages="errors.slug"
              label="Slug (URL) *"
              maxlength="50"
              placeholder="ej-sala-principal"
              required
              variant="outlined"
              @input="formatSlug"
            />
          </v-col>

          <!-- Color de la sala -->
          <v-col cols="12" md="6">
            <v-text-field
              v-model="formData.color"
              :error-messages="errors.color"
              label="Color *"
              maxlength="7"
              placeholder="#1976d2"
              required
              variant="outlined"
            >
              <template #append-inner>
                <v-menu>
                  <template #activator="{ props: menuProps }">
                    <v-btn
                      :color="formData.color || 'primary'"
                      size="small"
                      variant="flat"
                      v-bind="menuProps"
                    >
                      <v-icon>mdi-palette</v-icon>
                    </v-btn>
                  </template>

                  <v-color-picker
                    v-model="formData.color"
                    hide-inputs
                    mode="hex"
                  />
                </v-menu>
              </template>
            </v-text-field>
          </v-col>

          <!-- Icono de la sala -->
          <v-col cols="12" md="6">
            <v-text-field
              v-model="formData.icon"
              :error-messages="errors.icon"
              label="Icono *"
              maxlength="100"
              placeholder="mdi-gamepad-variant"
              required
              variant="outlined"
            >
              <template #append-inner>
                <v-icon :icon="formData.icon || 'mdi-help'" />
              </template>
            </v-text-field>
          </v-col>

          <!-- Límite de usuarios -->
          <v-col cols="12" md="6">
            <v-text-field
              v-model.number="formData.userLimit"
              :error-messages="errors.userLimit"
              label="Límite de usuarios *"
              max="50"
              min="2"
              required
              type="number"
              variant="outlined"
            />
          </v-col>

          <!-- Estado de la sala -->
          <v-col cols="12" md="6">
            <v-switch
              v-model="formData.isOpen"
              color="success"
              hide-details
              label="Sala abierta"
            />
            <div class="text-caption text-medium-emphasis mt-1">
              {{ formData.isOpen ? 'Los usuarios pueden unirse' : 'Sala cerrada para nuevos usuarios' }}
            </div>
          </v-col>
        </v-row>

        <!-- Preview de la sala -->
        <v-row v-if="showPreview" class="mt-4">
          <v-col cols="12">
            <v-divider class="mb-4" />
            <h4 class="text-h6 mb-3">Vista previa</h4>

            <RoomCard
              class="mx-auto"
              :room="previewRoom"
              :show-actions="false"
              style="max-width: 400px;"
            />
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions>
        <v-spacer />

        <v-btn
          variant="text"
          @click="$emit('cancel')"
        >
          Cancelar
        </v-btn>

        <v-btn
          color="primary"
          :disabled="!isFormValid"
          :loading="loading"
          type="submit"
          variant="flat"
        >
          {{ isEditing ? 'Actualizar' : 'Crear' }} sala
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-form>
</template>

<script setup lang="ts">
  import type { CreateRoomDto, RoomFormData, RoomResponseDto, UpdateRoomDto } from '@/app/rooms/types'
  import { computed, reactive, ref, watch } from 'vue'
  import RoomCard from './RoomCard.vue'

  interface Props {
    initialData?: RoomResponseDto | null
    loading?: boolean
    showPreview?: boolean
  }

  interface Emits {
    submit: [data: CreateRoomDto | UpdateRoomDto]
    cancel: []
  }

  const props = withDefaults(defineProps<Props>(), {
    loading: false,
    showPreview: true,
  })

  const emit = defineEmits<Emits>()

  // Refs
  const formRef = ref()

  // Estado del formulario
  const formData = reactive<RoomFormData>({
    name: '',
    slug: '',
    color: '#1976d2',
    icon: 'mdi-gamepad-variant',
    userLimit: 10,
    isOpen: true,
  })

  // Errores de validación
  const errors = reactive({
    name: [] as string[],
    slug: [] as string[],
    color: [] as string[],
    icon: [] as string[],
    userLimit: [] as string[],
  })

  // Computed
  const isEditing = computed(() => !!props.initialData)

  const isFormValid = computed(() => {
    return Object.values(errors).every(errorList => errorList.length === 0)
      && formData.name.trim() !== ''
      && formData.slug.trim() !== ''
      && formData.color.trim() !== ''
      && formData.icon.trim() !== ''
      && formData.userLimit >= 2
      && formData.userLimit <= 50
  })

  const previewRoom = computed(() => ({
    id: 'preview',
    slug: formData.slug || 'preview-slug',
    name: formData.name || 'Nombre de ejemplo',
    color: formData.color,
    icon: formData.icon,
    userLimit: formData.userLimit,
    isOpen: formData.isOpen,
    currentUserCount: Math.floor(formData.userLimit * 0.6), // 60% de ocupación para preview
  }))

  // Watchers para inicializar datos
  watch(() => props.initialData, data => {
    if (data) {
      formData.name = data.name || ''
      formData.slug = data.slug || ''
      formData.color = data.color || '#1976d2'
      formData.icon = data.icon || 'mdi-gamepad-variant'
      formData.userLimit = data.userLimit
      formData.isOpen = data.isOpen
    }
  }, { immediate: true })

  // Watchers para validación
  watch(() => formData.name, validateName)
  watch(() => formData.slug, validateSlug)
  watch(() => formData.color, validateColor)
  watch(() => formData.icon, validateIcon)
  watch(() => formData.userLimit, validateUserLimit)

  // Métodos de validación
  function validateName () {
    errors.name = []

    if (!formData.name.trim()) {
      errors.name.push('El nombre es obligatorio')
    } else if (formData.name.length > 100) {
      errors.name.push('El nombre no puede tener más de 100 caracteres')
    }
  }

  function validateSlug () {
    errors.slug = []

    if (!formData.slug.trim()) {
      errors.slug.push('El slug es obligatorio')
    } else if (formData.slug.length > 50) {
      errors.slug.push('El slug no puede tener más de 50 caracteres')
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      errors.slug.push('El slug solo puede contener letras minúsculas, números y guiones')
    }
  }

  function validateColor () {
    errors.color = []

    if (!formData.color.trim()) {
      errors.color.push('El color es obligatorio')
    } else if (!/^#[0-9A-Fa-f]{6}$/.test(formData.color)) {
      errors.color.push('El color debe estar en formato hexadecimal (#RRGGBB)')
    }
  }

  function validateIcon () {
    errors.icon = []

    if (!formData.icon.trim()) {
      errors.icon.push('El icono es obligatorio')
    } else if (formData.icon.length > 100) {
      errors.icon.push('El icono no puede tener más de 100 caracteres')
    }
  }

  function validateUserLimit () {
    errors.userLimit = []

    if (formData.userLimit < 2) {
      errors.userLimit.push('El límite mínimo es 2 usuarios')
    } else if (formData.userLimit > 50) {
      errors.userLimit.push('El límite máximo es 50 usuarios')
    }
  }

  // Formatear slug automáticamente
  function formatSlug () {
    formData.slug = formData.slug
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  // Envío del formulario
  function submitForm () {
    // Validar todo el formulario
    validateName()
    validateSlug()
    validateColor()
    validateIcon()
    validateUserLimit()

    if (!isFormValid.value) {
      return
    }

    const submitData: CreateRoomDto | UpdateRoomDto = {
      name: formData.name.trim(),
      slug: formData.slug.trim(),
      color: formData.color.trim(),
      icon: formData.icon.trim(),
      userLimit: formData.userLimit,
      isOpen: formData.isOpen,
    }

    emit('submit', submitData)
  }
</script>

<style scoped>
  .v-card {
    max-width: 100%;
  }
</style>
