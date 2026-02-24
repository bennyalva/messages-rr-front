# 🔍 Auditoría de Patrones de Diseño y Buenas Prácticas — messages-rr

## Resumen General

Se revisó la totalidad de la capa `lib/` (store, services, hooks, types, utils, config), el componente `AuthGuard`, `MessageItem`, y la estructura de la app. A continuación se presenta el veredicto para cada patrón y área del código.

---

## ✅ Lo que está BIEN implementado

### 1. **Singleton — Redux Store**
La tienda Redux es una instancia única exportada y proporcionada vía `StoreProvider`. Esto es correcto y sigue las guías oficiales de Redux Toolkit.

```
store.ts → configureStore (instancia única)
StoreProvider.tsx → <Provider store={store}>
```
✅ **Los typed hooks** (`useAppDispatch`, `useAppSelector`) son una excelente práctica que evita tipado manual repetitivo.

---

### 2. **Facade — Capa de Servicios**
Los servicios (`authService`, `chatService`, `sessionService`) actúan como facades que encapsulan la complejidad de las llamadas HTTP y del manejo de sesión.

| Servicio | Responsabilidad | Veredicto |
|---|---|---|
| `authService` | Login y registro | ✅ Bien separado |
| `chatService` | CRUD de mensajes y reacciones | ✅ Bien organizado |
| `sessionService` | Sesiones, tokens, cookies, bfcache | ✅ Muy robusto |

---

### 3. **Observer — Redux + createAsyncThunk**
El `chatSlice` usa `createAsyncThunk` para operaciones async, los componentes se suscriben al estado vía `useAppSelector`. Este es el patrón Observer bien aplicado.

✅ Los `extraReducers` manejan correctamente los estados `pending`, `fulfilled` y `rejected`.

---

### 4. **Validación con Zod** 
Usar Zod para definir schemas Y generar tipos (`z.infer`) es una excelente práctica que garantiza que la validación en runtime coincida con los tipos en compilación.

```typescript
// ✅ Schema-first approach (buena práctica)
export const UserSchema = z.object({ ... });
export type User = z.infer<typeof UserSchema>;
```

---

### 5. **Guard Pattern — `AuthGuard`**
El componente `AuthGuard` implementa correctamente el patrón Guard con:
- `useLayoutEffect` para validación ANTES del render visual
- Soporte de roles (`allowedRoles`)
- Protección contra bfcache y navegación mobile
- Loading state durante hidratación

---

### 6. **Custom Hooks — Separación de Concerns**
`useSessionValidator` y `useNavigationGuard` encapsulan lógica compleja de efectos de forma reutilizable. Bien documentados con JSDoc.

---

## ⚠️ Áreas con Oportunidades de Mejora

### 1. 🔴 **Seguridad — Contraseñas en texto plano**

En `authService.ts:19`, la contraseña se compara directamente sin hash. La contraseña también viaja y se almacena en texto plano en `db.json`.

```typescript
// ❌ Actual (línea 19)
if (user.password !== credentials.password) { ... }

// ✅ Debería usar bcrypt o similar (en un backend real)
```
También, en `adminSlice.ts:21`, las contraseñas están hardcodeadas en el estado inicial:
```typescript
// ❌ Contraseñas visibles en el código fuente
{ password: 'admin' }, { password: 'user1' }
```

> Nota: Esto es aceptable para un proyecto de demo con `json-server`, pero importante notarlo para producción.

---

### 2. 🟡 **Uso de `any` — Pérdida de Type Safety**

| Archivo | Línea | Problema |
|---|---|---|
| `chatService.ts` | 85 | `getUsers: async (): Promise<any[]>` |
| `chatSlice.ts` | 118 | `action.payload.forEach((u: any) => ...)` |
| `adminSlice.ts` | 39 | `role: any` en `updateUserRole` |

```diff
-getUsers: async (): Promise<any[]> => {
+getUsers: async (): Promise<User[]> => {

-updateUserRole(state, action: PayloadAction<{id: string, role: any}>)
+updateUserRole(state, action: PayloadAction<{id: string, role: UserRole}>)
```

---

### 3. 🟡 **Componente `MessageItem` — Demasiado Grande (557 líneas)**

`MessageItem.tsx` tiene 557 líneas con 22 funciones internas. Viola el principio de **Single Responsibility** (SRP) y dificulta el mantenimiento.

**Subcomponentes que deberían extraerse:**
- `AvatarWithBadge` → componente independiente
- `ReplyPreview` → componente independiente
- `ActionIconButton` → componente independiente
- `groupReactions()` y `formatRelativeTime()` → mover a `utils/`

---

### 4. 🟡 **Inconsistencia en la inicialización de `API_URL`**

```typescript
// chatService.ts — Se inicializa a nivel de módulo (❌ problemático en SSR)
const API_URL = getApiUrl();    // se ejecuta al importar el módulo

// authService.ts — Se obtiene dentro de cada método (✅ correcto)
const API_URL = getApiUrl();    // se ejecuta en cada llamada
```

`chatService` podría tener problemas si el módulo se importa durante SSR, donde `window` no existe.

---

### 5. 🟡 **Datos hardcodeados en el estado inicial del store**

```typescript
// chatSlice.ts:37
activeUsers: ['1', '2'], // ❌ Mock IDs hardcodeados

// adminSlice.ts:20-23
users: [
  { id: '1', username: 'admin', ... }, // ❌ Datos de prueba en producción
]
```

Estos mock data deberían venir de la API o de un archivo de configuración separado.

---

### 6. 🟢 **Menor — Duplicación de lógica de validación de sesión**

La lógica de validar sesión + redirigir a login está duplicada entre:
- `AuthGuard.tsx` (líneas 43-56, 62-84)
- `useSessionValidator.ts` (líneas 29-38, 42-82)

Ambos hacen exactamente lo mismo. Se podría consolidar en un solo lugar.

---

## 📊 Scorecard Final

| Criterio | Puntuación | Notas |
|---|---|---|
| **Estructura del proyecto** | ⭐⭐⭐⭐ | Buena separación: `lib/`, `components/`, `app/` |
| **Patrones de diseño** | ⭐⭐⭐⭐ | Singleton, Facade, Observer, Guard bien aplicados |
| **Type safety (TypeScript)** | ⭐⭐⭐ | Buen uso de Zod, pero hay `any` en varios lugares |
| **Separación de concerns** | ⭐⭐⭐ | Servicios bien separados, pero `MessageItem` es un God Component |
| **Manejo de errores** | ⭐⭐⭐ | Presente en servicios, falta en algunos thunks |
| **Seguridad** | ⭐⭐ | Contraseñas en texto plano (aceptable para demo) |
| **Reutilización** | ⭐⭐⭐⭐ | Hooks customs, typed hooks de Redux, componentes UI |
| **Documentación (JSDoc)** | ⭐⭐⭐⭐ | Buenos comentarios en hooks y servicios |
| **Consistencia** | ⭐⭐⭐ | API_URL inconsistente, lógica duplicada |

### **Puntuación general: 7.5/10** 🎯

> El proyecto está bien estructurado y aplica patrones de diseño de forma correcta para su escala. Las mejoras principales serían: eliminar `any`, dividir `MessageItem`, y consolidar la lógica de sesión duplicada.
