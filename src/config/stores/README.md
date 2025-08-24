# Config/Stores - Configuración de Pinia

Esta carpeta contiene **ÚNICAMENTE la configuración de Pinia** siguiendo la arquitectura ABCC (App-Base-Common-Config).

## ⚠️ IMPORTANTE: Ubicación de Stores

**Los stores NO van en esta carpeta.** Esta carpeta es solo para configuración.

### ✅ Ubicación CORRECTA de stores:
```
app/
├── auth/
│   └── stores/
│       └── authStore.ts          # Store de autenticación
├── usuario/
│   └── stores/
│       └── usuarioStore.ts       # Store de usuarios  
├── productos/
│   └── stores/
│       └── productosStore.ts     # Store de productos
└── ejemplo/
    └── stores/
        └── ejemploStore.ts       # Store de ejemplo
```

### ❌ Ubicación INCORRECTA:
```
config/stores/
├── authStore.ts         # ❌ NO aquí
├── userStore.ts         # ❌ NO aquí  
└── productStore.ts      # ❌ NO aquí
```

## Estructura de esta carpeta

```
config/stores/
├── index.ts          # ✅ Configuración principal de Pinia ÚNICAMENTE
└── README.md         # ✅ Esta documentación
```

## Contenido de config/stores/

### `index.ts` - Configuración de Pinia
- Instancia de Pinia configurada
- Función `installPinia` para registrar en la app
- Re-exportación de utilidades de Pinia
- **NO contiene stores de lógica de negocio**

## Arquitectura ABCC para Stores

### `config/stores/` (Esta carpeta)
- **Propósito**: Solo configuración e inicialización de Pinia
- **Contiene**: Configuración, plugins, utilidades de Pinia
- **NO contiene**: Lógica de negocio, stores específicos

### `app/[modulo]/stores/`
- **Propósito**: Stores específicos de cada módulo de la aplicación
- **Contiene**: Lógica de negocio, estado del módulo
- **Nomenclatura**: `[modulo]Store.ts` (ej: `authStore.ts`, `usuarioStore.ts`)

## Cómo crear un nuevo store

### 1. Determinar el módulo
Identifica a qué módulo pertenece tu store:
- Autenticación → `app/auth/stores/authStore.ts`
- Usuarios → `app/usuario/stores/usuarioStore.ts`
- Productos → `app/productos/stores/productosStore.ts`

### 2. Crear la estructura
```bash
mkdir -p src/app/[modulo]/stores
```

### 3. Crear el store
```typescript
// src/app/[modulo]/stores/[modulo]Store.ts
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const use[Modulo]Store = defineStore('[modulo]', () => {
  // State
  const state = ref('initial value')
  
  // Getters
  const computedValue = computed(() => state.value.toUpperCase())
  
  // Actions
  function updateState(newValue: string) {
    state.value = newValue
  }
  
  return {
    state,
    computedValue,
    updateState,
  }
})
```

### 4. Usar el store
```typescript
// En cualquier componente Vue
import { use[Modulo]Store } from '@/app/[modulo]/stores/[modulo]Store'

const store = use[Modulo]Store()
```

## Configuración automática

La configuración de Pinia se instala automáticamente a través de `src/config/index.ts`, por lo que no necesitas hacer nada adicional para usar los stores.

## Ejemplo completo

Puedes ver un ejemplo funcional en:
- `src/app/ejemplo/stores/ejemploStore.ts` - Store de ejemplo
- `src/app/auth/stores/authStore.ts` - Store de autenticación

## Reglas importantes

1. **Un store por módulo**: Cada módulo debe tener su propio store
2. **Nomenclatura consistente**: `use[Modulo]Store` y archivo `[modulo]Store.ts`
3. **No cruces entre módulos**: Los stores de un módulo NO deben importar stores de otros módulos
4. **Solo configuración aquí**: Esta carpeta (`config/stores/`) es solo para configuración de Pinia
