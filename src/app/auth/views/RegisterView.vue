<!-- eslint-disable vue/attributes-order -->
<template>
  <v-container
    class="fill-height d-flex justify-center align-center"
    max-width="450"
  >
    <v-card class="pa-6 elevation-8" width="100%">
      <!-- Header con logo -->
      <header-logo>
        <p class="text-body-2 text-medium-emphasis">Crea tu cuenta nueva</p>
      </header-logo>

      <!-- Mostrar errores -->
      <v-alert
        v-if="authStore.error"
        class="mb-4"
        closable
        type="error"
        variant="tonal"
        @click:close="authStore.clearError()"
      >
        {{ authStore.error }}
      </v-alert>

      <v-form ref="formRef" @submit.prevent="handleSubmit">
        <v-text-field
          v-model="registerForm.name"
          class="my-3"
          label="Nombre completo"
          prepend-inner-icon="mdi-account"
          required
          :rules="nameRules"
          variant="outlined"
        />

        <v-text-field
          v-model="registerForm.email"
          class="mb-3"
          label="Correo electrónico"
          prepend-inner-icon="mdi-email"
          required
          :rules="emailRules"
          type="email"
          variant="outlined"
        />

        <v-text-field
          v-model="registerForm.password"
          :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
          class="mb-3"
          label="Contraseña"
          prepend-inner-icon="mdi-lock"
          required
          :rules="passwordRules"
          :type="showPassword ? 'text' : 'password'"
          variant="outlined"
          @click:append-inner="showPassword = !showPassword"
        />

        <v-text-field
          v-model="registerForm.confirmPassword"
          label="Confirmar contraseña"
          :type="showConfirmPassword ? 'text' : 'password'"
          variant="outlined"
          prepend-inner-icon="mdi-lock-check"
          :append-inner-icon="
            showConfirmPassword ? 'mdi-eye' : 'mdi-eye-off'
          "
          :rules="confirmPasswordRules"
          required
          @click:append-inner="showConfirmPassword = !showConfirmPassword"
        />

        <!-- Botones de acción -->
        <div class="mt-6">
          <v-btn
            type="submit"
            color="primary"
            size="large"
            variant="flat"
            block
            :loading="authStore.isLoading"
            :disabled="authStore.isLoading"
            @click="handleSubmit"
          >
            <v-icon start>mdi-account-plus</v-icon>
            Crear Cuenta
          </v-btn>
        </div>
      </v-form>

      <!-- Botones en dos columnas -->
      <div class="d-flex justify-space-between mt-4">
        <v-btn
          variant="text"
          color="primary"
          class="flex-grow-1 ml-2"
          @click="$router.push('/')"
        >
          <v-icon start>mdi-arrow-left</v-icon>
          Inicio
        </v-btn>
        <v-btn
          variant="text"
          color="primary"
          class="flex-grow-1 mr-2"
          @click="goToAuth"
        >
          <v-icon start>mdi-login</v-icon>
          Iniciar Sesión
        </v-btn>
      </div>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
  import { computed, reactive, ref, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuthStore } from '../stores/authStore'

  // Composables
  const router = useRouter()
  const authStore = useAuthStore()

  // State reactivo
  const showPassword = ref(false)
  const showConfirmPassword = ref(false)
  const formRef = ref()

  const registerForm = reactive({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  // Reglas de validación
  const emailRules = [
    (v: string) => !!v || 'El correo electrónico es requerido',
    (v: string) => /.+@.+\..+/.test(v) || 'El correo electrónico debe ser válido',
  ]

  const passwordRules = [
    (v: string) => !!v || 'La contraseña es requerida',
    (v: string) =>
      (v && v.length >= 6) || 'La contraseña debe tener al menos 6 caracteres',
  ]

  const nameRules = [
    (v: string) => !!v || 'El nombre es requerido',
    (v: string) =>
      (v && v.length >= 2) || 'El nombre debe tener al menos 2 caracteres',
  ]

  const confirmPasswordRules = [
    (v: string) => !!v || 'Confirma tu contraseña',
    (v: string) => v === registerForm.password || 'Las contraseñas no coinciden',
  ]

  // Methods
  function goToAuth () {
    router.push('/auth')
  }
  async function handleSubmit () {
    const { valid } = await formRef.value?.validate()

    if (!valid) {
      return
    }

    try {
      await (authStore.register({
        username: registerForm.name,
        displayName: '',
        email: registerForm.email,
        password: registerForm.password,
      }))

      // Si llegamos aquí, el registro fue exitoso
      // Redirigir al dashboard o página principal
      await router.push('/login')
    } catch (error) {
      // El error ya se maneja en el store
      console.error('Error en autenticación:', error)
    }
  }
</script>

<style scoped>
.v-card {
  border-radius: 16px;
}

.v-tabs {
  margin-bottom: 0;
}

/* Estilos para mejorar la apariencia */
.v-text-field {
  margin-bottom: 8px;
}

.v-btn {
  border-radius: 12px;
}
</style>
