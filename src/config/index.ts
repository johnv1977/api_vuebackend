/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.ts`
 */

// Types
import type { App } from 'vue'

// Plugins
import router from './router/router'
import { installPinia } from './stores'
import vuetify from './vuetify/vuetify'

export function registerPlugins (app: App) {
  app
    .use(vuetify)
    .use(router)

  // Instalar Pinia
  installPinia(app)
}
