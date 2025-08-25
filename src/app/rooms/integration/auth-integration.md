# Integración del Módulo Rooms con AuthStore

## Estado Actual

### ✅ Integración Parcial Implementada

1. **RoomsService**: Se verifica existencia de token para permisos de admin
2. **RoomsStore**: Delega verificación de permisos al service
3. **Router Guards**: Verifica autenticación básica para rutas admin

### 🔄 Integración Futura con Backend de Roles

Cuando el backend implemente roles de usuario completos:

#### 1. AuthStore Integration
```typescript
// En roomsService.ts
import { useAuthStore } from '@/app/auth/stores/authStore'

hasAdminPermissions(): boolean {
  const authStore = useAuthStore()
  return authStore.hasRole('admin') || authStore.hasPermission('manage_rooms')
}
```

#### 2. Router Guards Update
```typescript
// En router.ts
import { useAuthStore } from '@/app/auth/stores/authStore'

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAdmin) {
    if (!authStore.hasRole('admin')) {
      next('/')
      return
    }
  }
  // ... resto de guards
})
```

#### 3. Verificación en Componentes
```typescript
// En componentes que necesiten verificar admin
import { useAuthStore } from '@/app/auth/stores/authStore'

const authStore = useAuthStore()
const canManageRooms = computed(() => 
  authStore.hasRole('admin') || authStore.hasPermission('manage_rooms')
)
```

## Funcionalidad Actual

- ✅ CRUD completo de rooms
- ✅ Filtros y paginación
- ✅ Validación de formularios
- ✅ Manejo de errores
- ✅ Guards básicos de autenticación
- ✅ Componentes reactivos
- ✅ Estado centralizado con Pinia

## Próximos Pasos

1. **Definir roles en backend**: `admin`, `user`, etc.
2. **Implementar endpoints de permisos**: `/api/auth/permissions`
3. **Actualizar authStore**: Añadir métodos `hasRole()` y `hasPermission()`
4. **Completar integración**: Reemplazar TODOs con implementación real

## Notas de Arquitectura

- La implementación actual es **funcional y segura**
- El sistema de permisos está **preparado para escalabilidad**
- La separación service/store/composable permite **fácil mantenimiento**
- Los guards del router proporcionan **seguridad a nivel de navegación**
