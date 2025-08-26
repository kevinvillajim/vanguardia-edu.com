# Sistema de Validación Unificado

Este sistema proporciona validaciones consistentes entre frontend y backend, asegurando que las reglas de negocio se mantengan sincronizadas.

## Características

✅ **Validaciones Centralizadas**: Reglas definidas una sola vez  
✅ **Frontend-Backend Sync**: Mismas reglas en ambos lados  
✅ **Type Safety**: Full TypeScript support  
✅ **React Integration**: Hooks personalizados para formularios  
✅ **File Validation**: Validación de archivos multimedia  
✅ **Real-time Validation**: Validación en tiempo real  
✅ **Visual Feedback**: Componentes de UI para errores  

## Uso Básico

### 1. Validación Manual

```typescript
import { Validator, CourseValidator } from '../shared/validation';

// Validar curso completo
const courseData = { title: 'Mi Curso', description: '...' };
const result = CourseValidator.validate(courseData);

if (!result.isValid) {
  console.log('Errores:', result.errors);
  console.log('Errores por campo:', result.fieldErrors);
}

// Validar campo individual
const titleErrors = Validator.validateField(
  'Mi título muy corto', 
  ValidationRules.course.title, 
  'title'
);
```

### 2. Hook de Validación para Formularios

```typescript
import { useCourseValidation } from '../hooks/useValidation';

function CourseForm() {
  const validation = useCourseValidation({
    title: '',
    description: '',
    difficulty: 'beginner',
    durationHours: 0,
    learningObjectives: [],
    prerequisites: []
  });

  const handleSubmit = async () => {
    const isValid = await validation.validateAll();
    if (isValid) {
      // Proceder con el envío
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={validation.data.title}
        onChange={(e) => validation.setFieldValue('title', e.target.value)}
      />
      <FieldValidation errors={validation.errors.title} />
    </form>
  );
}
```

### 3. Validación de Archivos

```typescript
import { useFileValidation } from '../hooks/useValidation';

function FileUpload() {
  const fileValidation = useFileValidation();

  const handleFileSelect = async (file: File) => {
    const result = await fileValidation.validateFile(file, 'image');
    if (!result.isValid) {
      alert(result.error);
    }
  };

  return (
    <input
      type="file"
      onChange={(e) => e.files?.[0] && handleFileSelect(e.files[0])}
    />
  );
}
```

### 4. Componentes de Validación Visual

```typescript
import { ValidationSummary, FieldValidation } from '../shared/components/form';

function FormWithValidation({ errors, fieldErrors }) {
  return (
    <div>
      {/* Resumen de errores */}
      <ValidationSummary 
        errors={errors} 
        title="Corrige los siguientes errores"
        onDismiss={() => clearErrors()}
      />

      {/* Errores por campo */}
      <input name="title" />
      <FieldValidation errors={fieldErrors.title} />
    </div>
  );
}
```

## Reglas de Validación Disponibles

### Cursos
- **title**: 5-100 caracteres, requerido
- **description**: 20-5000 caracteres, requerido  
- **difficulty**: 'beginner' | 'intermediate' | 'advanced'
- **durationHours**: número positivo, máx 1000
- **learningObjectives**: 1-8 objetivos, máx 150 chars cada uno
- **prerequisites**: máx 5, máx 100 chars cada uno

### Categorías
- **name**: 2-100 caracteres, requerido
- **description**: máx 500 caracteres, opcional
- **slug**: formato válido (a-z, 0-9, guiones)
- **color**: formato hexadecimal (#RRGGBB)

### Usuarios
- **name**: 2-100 caracteres, requerido
- **email**: formato válido, máx 255 caracteres
- **password**: 8+ chars, mayúscula, minúscula, número

### Archivos
- **Imágenes**: 5MB max, JPG/PNG/WebP, 1920x1080 max
- **Videos**: 100MB max, MP4/WebM/OGG, 1h duración max
- **Documentos**: 10MB max, PDF/DOC/DOCX
- **Audio**: 50MB max, MP3/WAV/OGG

## Sincronización Backend

Las reglas definidas en `ValidationRules.ts` deben coincidir exactamente con las reglas del backend Laravel. Cuando se modifiquen las validaciones:

1. **Frontend**: Actualizar `ValidationRules.ts`
2. **Backend**: Actualizar Form Requests correspondientes
3. **Testing**: Verificar que ambos lados rechacen los mismos datos

## Ejemplo de Form Request Laravel (Backend)

```php
<?php
// app/Http/Requests/CreateCourseRequest.php

class CreateCourseRequest extends FormRequest
{
    public function rules()
    {
        return [
            'title' => 'required|string|min:5|max:100',
            'description' => 'required|string|min:20|max:5000',
            'difficulty' => 'required|in:beginner,intermediate,advanced',
            'duration_hours' => 'required|numeric|min:0.1|max:1000',
            'learning_objectives' => 'required|array|min:1|max:8',
            'learning_objectives.*' => 'required|string|max:150',
            'prerequisites' => 'nullable|array|max:5',
            'prerequisites.*' => 'required|string|max:100',
        ];
    }
}
```

## Extensibilidad

### Agregar Nueva Entidad

1. **Definir reglas**:
```typescript
// ValidationRules.ts
export const ValidationRules = {
  // ... existing rules
  enrollment: {
    studentId: {
      required: {
        validate: (value: number) => !!value,
        message: 'El ID del estudiante es requerido'
      }
    }
  }
};
```

2. **Crear validador**:
```typescript
// Validator.ts
static validateEnrollment(enrollmentData: any): ValidationResult {
  return this.validate(enrollmentData, ValidationRules.enrollment);
}
```

3. **Crear hook**:
```typescript
// useValidation.ts
export function useEnrollmentValidation(initialData: any) {
  return useValidation({
    initialData,
    rules: ValidationRules.enrollment,
    validateOnBlur: true
  });
}
```

## Testing

```typescript
import { CourseValidator } from '../shared/validation';

describe('Course Validation', () => {
  it('should reject invalid course data', () => {
    const invalidCourse = {
      title: 'ABC', // muy corto
      description: 'Short', // muy corta
      difficulty: 'invalid', // inválida
    };

    const result = CourseValidator.validate(invalidCourse);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('El título debe tener al menos 5 caracteres');
  });
});
```