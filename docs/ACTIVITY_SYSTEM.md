# Sistema Inteligente de Actividad y Renovación de Tokens

## 📋 Descripción General

El sistema de actividad inteligente detecta automáticamente la actividad del usuario (movimiento del mouse, clicks, teclas, etc.) y renueva los tokens de autenticación de forma proactiva cuando el usuario está activo, evitando que se cierre la sesión durante tareas largas como la creación de cursos.

## 🎯 Características Principales

### ✅ Detección Automática de Actividad
- Monitorea eventos de mouse, teclado, scroll, touch
- Detecta cuando la ventana tiene/pierde foco
- Sistema inteligente de throttling para evitar spam

### ✅ Renovación Proactiva de Tokens
- Renueva tokens automáticamente cuando están próximos a expirar
- Solo renueva si hay actividad reciente del usuario
- Manejo inteligente de errores de red vs errores de autenticación

### ✅ Configuración por Roles
- **Profesores**: 15 minutos de inactividad (para creación de cursos largos)
- **Estudiantes**: 10 minutos de inactividad 
- **Administradores**: 20 minutos de inactividad

### ✅ Período de Gracia
- Tiempo adicional cuando la ventana pierde foco
- Profesores: 5 minutos de gracia
- Estudiantes: 2 minutos de gracia

## 🔧 Configuración

### Variables de Entorno (.env)

```env
# Tiempo de inactividad en milisegundos (opcional)
REACT_APP_ACTIVITY_TIMEOUT=600000  # 10 minutos

# Buffer para renovación de token (opcional)
REACT_APP_REFRESH_BUFFER=300000    # 5 minutos
```

### Configuración en Código

```typescript
// Sistema de configuraciones centralizadas en src/config/
import { ACTIVITY_CONFIG, getActivityConfigForRole } from '@/config';

// Configuración por defecto
const config = ACTIVITY_CONFIG;

// Configuración específica por rol  
const teacherConfig = getActivityConfigForRole('teacher');
// - inactivityTimeout: 15 minutos
// - refreshBuffer: 7 minutos  
// - focusGracePeriod: 5 minutos

// También disponible: 'student' (10 min) y 'admin' (20 min)
```

## 🚀 Uso en Componentes

### Uso Automático (Recomendado)

El sistema se activa automáticamente en `App.tsx`:

```typescript
import { useUserActivity } from './shared/hooks/useUserActivity';

const App = () => {
  // Se inicia automáticamente cuando el usuario está autenticado
  const { isMonitoring } = useUserActivity({
    autoStart: true,
    statsUpdateInterval: 30000
  });
  
  return (
    // ... tu app
  );
};
```

### Uso Manual para Componentes Específicos

```typescript
import { useActivityRecorder } from './shared/hooks/useUserActivity';

const CrearCursoPage = () => {
  const { recordActivity } = useActivityRecorder();
  
  const handleImportantAction = () => {
    recordActivity(); // Registrar actividad específica
    // ... lógica del componente
  };
  
  return (
    // ... componente
  );
};
```

### Configuración Personalizada

```typescript
import { useUserActivity } from './shared/hooks/useUserActivity';
import { ACTIVITY_PRESETS } from './config';

const ComponenteEspecial = () => {
  const { isMonitoring, stats } = useUserActivity({
    customConfig: ACTIVITY_PRESETS.EXTENDED, // 25 minutos
    autoStart: true,
    statsUpdateInterval: 5000
  });
  
  return (
    <div>
      {stats && (
        <div>Última actividad: {stats.lastActivity}</div>
      )}
    </div>
  );
};
```

## 🐛 Debug y Desarrollo

### Panel de Debug

En modo desarrollo, un panel flotante muestra el estado del sistema:

```typescript
// En src/App.tsx
{process.env.NODE_ENV === 'development' && (
  <ActivityDebugPanel 
    defaultVisible={false}
    position="bottom-right"
  />
)}
```

### Logs de Consola

El sistema genera logs detallados en desarrollo:

```
🔍 UserActivityService: Iniciando monitoreo de actividad
👆 UserActivityService: Actividad registrada
🔄 UserActivityService: Token necesita renovación
✅ UserActivityService: Token renovado exitosamente
😴 UserActivityService: Usuario inactivo, cerrando sesión
```

### Hook de Debug

```typescript
import { useActivityDebugger } from './shared/hooks/useUserActivity';

const DebugComponent = () => {
  const { debugInfo, isDebugging } = useActivityDebugger(true);
  
  if (!debugInfo) return null;
  
  return (
    <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
  );
};
```

## 📐 Presets de Configuración

### DEVELOPMENT (Desarrollo)
- Inactividad: 30 minutos
- Buffer: 10 minutos  
- Gracia: 10 minutos

### STRICT (Seguridad Alta)
- Inactividad: 5 minutos
- Buffer: 2 minutos
- Gracia: 30 segundos

### EXTENDED (Sesiones Largas)
- Inactividad: 25 minutos
- Buffer: 10 minutos
- Gracia: 10 minutos

## 🔒 Seguridad

### Protecciones Implementadas

1. **Validación de Token**: El sistema verifica que los tokens sean válidos antes de usarlos
2. **Solo Renovar con Actividad**: Los tokens solo se renuevan si hay actividad reciente
3. **Manejo de Errores**: Distingue entre errores de red y errores de autenticación
4. **Throttling**: Previene spam de eventos de actividad
5. **Cleanup**: Limpia todos los timers al cerrar sesión

### Buenas Prácticas

- ✅ El sistema se desactiva automáticamente al cerrar sesión
- ✅ No almacena información sensible en localStorage
- ✅ Maneja errores de red sin cerrar sesión innecesariamente
- ✅ Usa throttling para no sobrecargar el sistema

## 🛠️ Personalización

### Crear Configuración Personalizada

```typescript
// src/config/myActivityConfig.ts
import { ActivityConfig, ACTIVITY_CONFIG } from '../config';

export const MY_CUSTOM_CONFIG: ActivityConfig = {
  ...ACTIVITY_CONFIG,
  inactivityTimeout: 20 * 60 * 1000, // 20 minutos
  roleSpecific: {
    ...ACTIVITY_CONFIG.roleSpecific,
    teacher: {
      inactivityTimeout: 30 * 60 * 1000, // 30 minutos para profesores
      refreshBuffer: 10 * 60 * 1000,
    }
  }
};
```

### Usar Configuración Personalizada

```typescript
const { startMonitoring } = useUserActivity({ autoStart: false });

useEffect(() => {
  if (isAuthenticated) {
    startMonitoring(userRole, MY_CUSTOM_CONFIG);
  }
}, [isAuthenticated, userRole]);
```

## 🚨 Resolución de Problemas

### El Sistema No Se Activa

1. Verificar que el usuario esté autenticado
2. Comprobar que `autoStart: true` esté configurado
3. Revisar los logs de consola para errores

### Tokens No Se Renuevan

1. Verificar que hay actividad reciente del usuario
2. Comprobar que el backend soporte `/auth/refresh`
3. Revisar la configuración de `refreshBuffer`

### Sesión Se Cierra Muy Rápido

1. Aumentar `inactivityTimeout` para el rol del usuario
2. Configurar `focusGracePeriod` si se cambia de ventana frecuentemente
3. Usar preset `EXTENDED` para tareas largas

### Panel de Debug No Aparece

1. Verificar que estés en modo desarrollo (`NODE_ENV=development`)
2. Comprobar que el componente esté importado correctamente
3. Buscar errores en la consola del navegador

## 📊 Monitoreo en Producción

### Métricas Disponibles

```typescript
const stats = userActivityService.getActivityStats();

console.log({
  lastActivity: stats.lastActivity,        // "2m 30s"
  isActive: stats.isActive,               // true/false
  isWindowFocused: stats.isWindowFocused, // true/false
  config: stats.config                    // configuración actual
});
```

### Eventos para Analytics

El sistema permite integrar con servicios de analytics:

```typescript
// Ejemplo con Google Analytics
userActivityService.startMonitoring(userRole, {
  onActivity: () => {
    gtag('event', 'user_activity', {
      category: 'engagement',
      label: 'activity_detected'
    });
  },
  onTokenRefresh: () => {
    gtag('event', 'token_refresh', {
      category: 'security', 
      label: 'automatic_renewal'
    });
  }
});
```

## 📝 Notas de Desarrollo

- El sistema es completamente opcional y no afecta la funcionalidad existente
- Se puede desactivar completamente configurando `autoStart: false`
- Compatible con SSR/NextJS (detecta `window` antes de usar eventos DOM)
- Optimizado para performance con throttling y debouncing
- Memoria limpiada automáticamente al desmontar componentes