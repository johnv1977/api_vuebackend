<template>
  <v-container class="fill-height d-flex justify-center align-center" max-width="900">
    <div class="text-center">
      <v-img
        class="mb-0"
        height="150"
        src="/assets/logo.png"
      />

      <div class="mb-6">
        <h1 class="text-h3 font-weight-bold">ABBC</h1>
        <div class="text-body-1 font-weight-light mb-n1">Games</div>
      </div>

      <!-- Mostrar contenido según estado de autenticación -->
      <div v-if="authStore.isAuthenticated" class="user-section">
        <v-card class="pa-4 mb-4" color="success" variant="tonal">
          <v-card-title class="text-h6">
            <v-icon start>mdi-account-circle</v-icon>
            ¡Bienvenido, {{ authStore.userName }}!
          </v-card-title>
          <v-card-text>
            Estás conectado y listo para jugar
          </v-card-text>
        </v-card>

        <div class="d-flex gap-3 justify-center flex-wrap">
          <v-btn
            color="primary"
            prepend-icon="mdi-gamepad-variant"
            size="large"
            variant="flat"
          >
            Jugar Ahora
          </v-btn>

          <v-btn
            color="secondary"
            prepend-icon="mdi-trophy"
            size="large"
            variant="outlined"
          >
            Ver Ranking
          </v-btn>

          <v-btn
            color="error"
            prepend-icon="mdi-logout"
            size="large"
            variant="text"
            @click="handleLogout"
          >
            Cerrar Sesión
          </v-btn>
        </div>
      </div>

      <div v-else class="auth-section">
        <v-card class="pa-4 mb-4" color="primary" variant="tonal">
          <v-card-title class="text-h6">
            <v-icon start>mdi-rocket-launch</v-icon>
            ¡Únete a la diversión!
          </v-card-title>
          <v-card-text>
            Inicia sesión o regístrate para comenzar a jugar
          </v-card-text>
        </v-card>

        <div class="d-flex gap-3 justify-center flex-wrap">
          <v-btn
            color="primary"
            prepend-icon="mdi-login"
            size="large"
            variant="flat"
            @click="goToAuth"
          >
            Iniciar Sesión
          </v-btn>

          <v-btn
            color="secondary"
            prepend-icon="mdi-account-plus"
            size="large"
            variant="outlined"
            @click="goToAuth"
          >
            Registrarse
          </v-btn>
        </div>
      </div>

      <!-- Loading state -->
      <div v-if="authStore.isLoading" class="mt-4">
        <v-progress-circular
          color="primary"
          indeterminate
          size="32"
        />
        <p class="text-body-2 mt-2">Verificando sesión...</p>
      </div>
    </div>
  </v-container>
</template>

<script setup lang="ts">
  import { useRouter } from 'vue-router'
  import { useAuthStore } from '@/app/auth/stores/authStore'

  // Composables
  const router = useRouter()
  const authStore = useAuthStore()

  // Methods
  function goToAuth () {
    router.push('/auth')
  }

  function handleLogout () {
    authStore.logout()
  }
</script>

<style scoped>
.user-section,
.auth-section {
  max-width: 500px;
  margin: 0 auto;
}

.v-btn {
  border-radius: 12px;
}

.gap-3 {
  gap: 12px;
}
</style>
