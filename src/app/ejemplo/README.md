# Módulo Ejemplo

Este módulo sirve como ejemplo de cómo estructurar módulos siguiendo la arquitectura ABCC.

## Estructura del módulo

```
app/ejemplo/
├── stores/
│   └── ejemploStore.ts    # Store del módulo ejemplo
├── components/            # Componentes específicos del módulo (futuro)
├── pages/                 # Páginas del módulo (futuro)
├── services/              # Servicios del módulo (futuro)
├── types/                 # Tipos TypeScript del módulo (futuro)
└── README.md              # Esta documentación
```

## Store

El store de ejemplo (`ejemploStore.ts`) demuestra:
- Uso de Composition API (recomendado)
- Uso de Options API (alternativo)
- Patrones de state, getters y actions
- Convenciones de nomenclatura

### Uso del store

```typescript
import { useExampleStore } from '@/app/ejemplo/stores/ejemploStore'

const store = useExampleStore()

// Usar state y getters
console.log(store.count, store.doubleCount)

// Ejecutar actions
store.increment()
store.setName('Nuevo nombre')
```

## Arquitectura ABCC

Este módulo sigue las reglas ABCC:
- **App**: Lógica específica del módulo ejemplo
- **Ubicación**: `app/ejemplo/` por ser funcionalidad de la aplicación
- **Organización**: Por tipo de archivo (stores, components, pages, etc.)
- **Aislamiento**: No depende de otros módulos en `app/`
