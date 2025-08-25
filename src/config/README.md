# 🎛️ Sistema de Configuraciones Centralizadas

Este directorio centraliza **TODAS** las configuraciones de VanguardIA en archivos organizados y fácilmente mantenibles.

## 📁 Estructura de Archivos

```
src/config/
├── index.ts              # 🎯 PUNTO DE ENTRADA - Exporta todo
├── activity.config.ts     # 🔄 Actividad del usuario y tokens
├── api.config.ts          # 🌐 API y comunicación con backend
├── ui.config.ts           # 🎨 Interfaz de usuario y UX
├── course.config.ts       # 📚 Sistema de cursos y educación
└── README.md             # 📖 Esta documentación
```

## 🚀 Uso Rápido

### Importar Configuración Específica
```typescript
// ✅ Recomendado: Importar solo lo que necesites
import { ACTIVITY_CONFIG, API_CONFIG } from '@/config';
import { getActivityConfigForRole } from '@/config';

// Usar configuración
const userConfig = getActivityConfigForRole('teacher');
const apiUrl = API_CONFIG.baseUrl;
```

### Importar por Categoría
```typescript
// Para funciones específicas
import { formatActivityTime } from '@/config/activity.config';
import { formatFileSize } from '@/config/api.config';
import { shouldShowAnimations } from '@/config/ui.config';
```

### Importar Todo (Solo si necesitas múltiples configuraciones)
```typescript
// ⚠️ Usar con moderación - importa mucho código
import * as Config from '@/config';

// Usar
const config = Config.getAppConfig();
```

## 📋 Configuraciones Disponibles

### 🔄 **activity.config.ts** - Actividad y Tokens
- Detección de actividad del usuario (mouse, teclado, foco)
- Renovación automática de tokens de autenticación
- Configuración específica por rol (profesor, estudiante, admin)
- Presets para desarrollo, producción, seguridad

```typescript
import { ACTIVITY_CONFIG, getActivityConfigForRole } from '@/config';

// Configuración por defecto
const config = ACTIVITY_CONFIG;

// Configuración por rol
const teacherConfig = getActivityConfigForRole('teacher'); // 15 min inactividad
```

### 🌐 **api.config.ts** - API y Comunicación
- URLs de endpoints y configuración base
- Timeouts, reintentos y manejo de errores
- Configuración de uploads por tipo de archivo
- Headers por defecto y autenticación

```typescript
import { API_CONFIG, getApiConfig, UPLOAD_CONFIGS } from '@/config';

// Configuración de API
const api = getApiConfig('production');

// Configuración de uploads
const imageUpload = UPLOAD_CONFIGS.images; // Max 10MB, solo imágenes
```

### 🎨 **ui.config.ts** - Interfaz de Usuario
- Temas (claro, oscuro, educativo)
- Animaciones y transiciones
- Breakpoints responsive
- Configuración de componentes (modales, notificaciones)

```typescript
import { UI_CONFIG, getUiConfig, UI_THEMES } from '@/config';

// Tema personalizado
const darkTheme = getUiConfig('DARK', 'FAST', 'COMPACT');

// Verificar animaciones
const showAnims = shouldShowAnimations(UI_CONFIG);
```

### 📚 **course.config.ts** - Sistema de Cursos
- Estructura de cursos (límites, validaciones)
- Componentes disponibles (video, lectura, quiz, etc.)
- Configuración de evaluaciones y progreso
- Metadatos (categorías, dificultades, idiomas)

```typescript
import { COURSE_CONFIG, getCourseConfig, validateCourseStructure } from '@/config';

// Configuración académica
const academicConfig = getCourseConfig('ACADEMIC');

// Validar estructura de curso
const validation = validateCourseStructure(courseData);
```

## 🎯 Configuraciones por Rol de Usuario

```typescript
import { getUserConfig } from '@/config';

// Configuración optimizada para profesores
const teacherConfig = getUserConfig('teacher');
// - 15 minutos de inactividad
// - Tema educativo
// - Estructura académica de cursos

// Configuración para estudiantes  
const studentConfig = getUserConfig('student');
// - 10 minutos de inactividad
// - Tema claro
// - Estructura básica de cursos

// Configuración para administradores
const adminConfig = getUserConfig('admin');
// - 20 minutos de inactividad
// - Tema oscuro con layout espacioso
// - Estructura académica completa
```

## ⚙️ Variables de Entorno

Las configuraciones soportan variables de entorno para diferentes despliegues:

```env
# .env
REACT_APP_API_URL=https://api.vanguardia.com/api
REACT_APP_ACTIVITY_TIMEOUT=900000  # 15 minutos
REACT_APP_REFRESH_BUFFER=300000    # 5 minutos
```

## 🔧 Personalización

### Crear Nueva Configuración
```typescript
// src/config/my-custom.config.ts
export const MY_CONFIG = {
  customSetting: 'value',
  // ...
};

// Agregar al index.ts
export { MY_CONFIG } from './my-custom.config';
```

### Extender Configuración Existente
```typescript
import { ACTIVITY_CONFIG } from '@/config';

export const EXTENDED_ACTIVITY = {
  ...ACTIVITY_CONFIG,
  inactivityTimeout: 30 * 60 * 1000, // 30 minutos
  roleSpecific: {
    ...ACTIVITY_CONFIG.roleSpecific,
    developer: {
      inactivityTimeout: 60 * 60 * 1000, // 1 hora para desarrolladores
    }
  }
};
```

## 🐛 Debug y Validación

```typescript
import { validateAllConfigs, debugConfigs } from '@/config';

// En desarrollo - log de todas las configuraciones
debugConfigs();

// Validar configuraciones
const { isValid, errors } = validateAllConfigs();
if (!isValid) {
  console.error('Errores de configuración:', errors);
}
```

## 📝 Mejores Prácticas

### ✅ Hacer
- Importar solo las configuraciones que necesites
- Usar funciones getter para configuración dinámica
- Validar configuraciones en desarrollo
- Documentar cambios importantes

### ❌ Evitar
- Importar `import * as Config` a menos que sea necesario
- Hardcodear valores en componentes - usar configuración
- Modificar configuraciones directamente - usar funciones
- Duplicar configuraciones entre archivos

## 🔄 Migración desde Sistema Anterior

Si encuentras importaciones del sistema anterior:
```typescript
// ❌ Sistema anterior
import { config } from '../shared/config/someConfig';

// ✅ Sistema nuevo
import { SOME_CONFIG } from '@/config';
```

## 📊 Información del Sistema

```typescript
import { CONFIG_INFO } from '@/config';

console.log('Configuraciones:', CONFIG_INFO);
// {
//   version: '1.0.0',
//   totalConfigs: 4,
//   features: ['Configuración por roles', 'Validación automática', ...]
// }
```

## 🚨 Resolución de Problemas

### Error: "Cannot resolve '@/config'"
- Verificar que el path alias esté configurado en `vite.config.ts` o `tsconfig.json`
- Usar importación relativa: `import from '../../config'`

### Error: "Configuration not found"
- Verificar que el archivo esté exportado en `index.ts`
- Revisar el nombre de la exportación

### Error: "Validation failed"
- Ejecutar `validateAllConfigs()` para ver errores específicos
- Revisar la configuración en el archivo correspondiente

---

**💡 Tip**: Usa el comando `debugConfigs()` en desarrollo para ver todas las configuraciones actuales y detectar problemas.