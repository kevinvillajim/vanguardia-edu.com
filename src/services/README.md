# Sistema Avanzado de Archivos y Uploads

Este sistema proporciona funcionalidades avanzadas para manejo de archivos, incluyendo procesamiento en tiempo real, uploads por chunks, y optimización automática.

## Características Principales

✅ **Procesamiento de Imágenes**: Compresión, redimensionamiento, conversión de formato  
✅ **Upload por Chunks**: Para archivos grandes con capacidad de reanudación  
✅ **Validación Avanzada**: Integrada con sistema de validación centralizado  
✅ **Thumbnails Automáticos**: Generación de miniaturas optimizadas  
✅ **Análisis de Archivos**: Metadatos, recomendaciones y estimaciones  
✅ **Upload Múltiple**: Procesamiento concurrente con límites configurables  
✅ **Manejo de Errores**: Sistema robusto con reintentos inteligentes  
✅ **Progress Tracking**: Progreso detallado por fases (análisis, procesamiento, upload)  

## Arquitectura del Sistema

```
📁 Sistema de Archivos Avanzado
├── 🔧 FileProcessingService
│   ├── Compresión de imágenes (WebP, JPEG, PNG)
│   ├── Redimensionamiento inteligente
│   ├── Generación de thumbnails
│   ├── Extracción de metadatos
│   └── Validación de integridad (checksums)
├── 📦 ChunkedUploadService
│   ├── División de archivos en chunks
│   ├── Upload concurrente controlado
│   ├── Reanudación de uploads interrumpidos
│   └── Seguimiento de estado por chunk
├── 🚀 UploadService (Mejorado)
│   ├── Integración de procesamiento
│   ├── Decisión automática de estrategia
│   ├── Upload múltiple con semáforos
│   └── Análisis pre-upload
└── 🎣 Hooks de React
    ├── useAdvancedUpload (Completo)
    ├── useSmartUpload (Automático)
    └── useUpload (Básico)
```

## Uso Básico

### 1. Upload Inteligente Automático

```typescript
import { useSmartUpload } from '../hooks/useAdvancedUpload';

function ImageUploader() {
  const upload = useSmartUpload();

  const handleFile = async (file: File) => {
    // Procesamiento automático basado en tipo y tamaño
    const result = await upload.uploadWithSmartProcessing(file, 'image');
    
    if (result.success) {
      console.log('Upload exitoso:', result.fileUrl);
    }
  };

  return (
    <div>
      <input type="file" onChange={(e) => e.files?.[0] && handleFile(e.files[0])} />
      
      {upload.isActive && (
        <div>
          <div>Progreso: {upload.totalProgress}%</div>
          <div>
            {upload.state.isAnalyzing && 'Analizando archivo...'}
            {upload.state.isProcessing && 'Procesando imagen...'}
            {upload.state.isUploading && 'Subiendo archivo...'}
          </div>
        </div>
      )}
    </div>
  );
}
```

### 2. Upload Avanzado con Control Total

```typescript
import { useAdvancedUpload } from '../hooks/useAdvancedUpload';

function AdvancedUploader() {
  const upload = useAdvancedUpload();

  const handleUpload = async (file: File) => {
    // Primero analizar el archivo
    const analysis = await upload.analyzeFile(file);
    console.log('Recomendaciones:', analysis.recommendations);

    // Upload con opciones específicas
    const result = await upload.uploadWithProcessing(file, 'image', {
      enableImageCompression: true,
      generateThumbnail: true,
      thumbnailSize: 300,
      maxImageDimensions: { width: 1920, height: 1080 },
      imageQuality: 0.85,
      onProgress: (progress) => {
        console.log(`Upload: ${progress.percentage}%`);
      }
    });

    return result;
  };

  return (
    <div>
      {/* UI del uploader avanzado */}
      {upload.state.analysis && (
        <div>
          <h3>Análisis del Archivo:</h3>
          <ul>
            {upload.state.analysis.recommendations.map((rec, i) => (
              <li key={i}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

### 3. Upload por Chunks para Archivos Grandes

```typescript
import { chunkedUploadService } from '../services/chunkedUploadService';

// Upload directo por chunks
const uploadLargeFile = async (file: File) => {
  const result = await chunkedUploadService.uploadFileInChunks(file, {
    chunkSize: 2 * 1024 * 1024, // 2MB chunks
    maxConcurrentUploads: 3,
    enableResume: true,
    onProgress: (progress) => {
      console.log(`Chunk progress: ${progress.percentage}%`);
    }
  });

  return result;
};

// Reanudar upload interrumpido
const resumeUpload = async (file: File) => {
  const result = await chunkedUploadService.resumeUpload(file);
  return result;
};
```

### 4. Procesamiento de Imágenes

```typescript
import { fileProcessingService } from '../services/fileProcessingService';

// Procesar imagen manualmente
const processImage = async (file: File) => {
  const result = await fileProcessingService.processImage(file, {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 0.85,
    format: 'webp',
    maintainAspectRatio: true
  });

  if (result.success) {
    console.log('Compresión:', result.metadata.compressionRatio + '%');
    console.log('Tamaño original:', result.metadata.originalSize);
    console.log('Tamaño procesado:', result.metadata.processedSize);
    
    // Usar archivo procesado
    return result.processedFile;
  }
};

// Generar thumbnail
const generateThumbnail = async (file: File) => {
  const result = await fileProcessingService.generateThumbnail(file, 200);
  return result.processedFile;
};

// Extraer metadatos
const getMetadata = async (file: File) => {
  const metadata = await fileProcessingService.extractMetadata(file);
  console.log('Metadatos:', {
    fileName: metadata.fileName,
    size: metadata.originalSize,
    dimensions: metadata.dimensions,
    checksum: metadata.checksum
  });
};
```

## Configuración y Optimizaciones

### Configuración de Compresión de Imágenes

```typescript
const imageOptions = {
  // Dimensiones máximas
  maxWidth: 1920,
  maxHeight: 1080,
  
  // Calidad (0-1)
  quality: 0.85,
  
  // Formato de salida
  format: 'webp' as const, // 'webp' | 'jpeg' | 'png'
  
  // Mantener proporción
  maintainAspectRatio: true
};
```

### Configuración de Upload por Chunks

```typescript
const chunkOptions = {
  // Tamaño de chunk (default: 1MB)
  chunkSize: 1024 * 1024,
  
  // Uploads concurrentes (default: 3)
  maxConcurrentUploads: 3,
  
  // Habilitar reanudación (default: true)
  enableResume: true,
  
  // Reintentos por chunk (default: 3)
  maxRetries: 3,
  
  // Timeout por chunk (default: 60s)
  timeout: 60000
};
```

### Umbrales de Procesamiento

```typescript
// En UploadService
private readonly IMAGE_SIZE_THRESHOLD = 2 * 1024 * 1024; // 2MB
private readonly CHUNK_SIZE_THRESHOLD = 10 * 1024 * 1024; // 10MB

// Configurables por proyecto:
const config = {
  imageCompression: {
    threshold: 2 * 1024 * 1024, // Comprimir imágenes > 2MB
    quality: 0.85,
    maxDimensions: { width: 1920, height: 1080 }
  },
  chunkUpload: {
    threshold: 10 * 1024 * 1024, // Chunks para archivos > 10MB
    chunkSize: 1024 * 1024, // 1MB chunks
    maxConcurrent: 3
  }
};
```

## Manejo de Errores Específicos

```typescript
// Errores de procesamiento
if (error.code === 'PROCESSING_FAILED') {
  console.log('Error al procesar archivo:', error.message);
  // Intentar upload sin procesamiento
}

// Errores de chunks
if (error.code === 'CHUNK_UPLOAD_FAILED') {
  console.log('Error en upload por chunks:', error.details);
  // Reanudar o intentar upload normal
}

// Errores de validación
if (error.code === 'FILE_TOO_LARGE') {
  console.log('Archivo muy grande:', error.message);
  // Sugerir compresión o división
}
```

## Performance y Optimizaciones

### Recomendaciones por Tipo de Archivo

| Tipo | Tamaño | Recomendación | Procesamiento |
|------|--------|---------------|---------------|
| Imagen | < 2MB | Upload directo | Ninguno |
| Imagen | 2-10MB | Comprimir + Upload | WebP, 85% quality |
| Imagen | > 10MB | Comprimir + Chunks | WebP + División |
| Video | < 50MB | Upload directo | Validación |
| Video | > 50MB | Upload por chunks | División + Validación |
| Documento | Cualquiera | Upload directo | Metadatos |

### Métricas de Performance

```typescript
// Análisis de archivo
const analysis = await upload.analyzeFile(file);
console.log('Tiempo estimado:', analysis.estimatedProcessingTime);

// Métricas de procesamiento
const result = await fileProcessingService.processImage(file);
console.log('Tiempo de procesamiento:', result.processingTime);
console.log('Ratio de compresión:', result.metadata.compressionRatio);

// Métricas de upload
upload.state.uploadProgress?.speed; // bytes/sec
upload.state.uploadProgress?.estimatedTime; // seconds
```

## Integración con Backend

### Endpoints Requeridos

```typescript
// Endpoints implementados automáticamente
FILES: {
  // Upload básico
  UPLOAD: '/files/upload',
  DELETE: (filename) => `/files/${filename}`,
  
  // Chunked upload
  CHUNKED_INIT: '/files/chunked/init',
  CHUNKED_UPLOAD: '/files/chunked/upload',
  CHUNKED_STATUS: '/files/chunked/status',
  CHUNKED_FINALIZE: '/files/chunked/finalize',
  
  // Procesamiento
  PROCESS_IMAGE: '/files/process/image',
  GENERATE_THUMBNAIL: '/files/process/thumbnail',
  EXTRACT_METADATA: '/files/metadata'
}
```

### Compatibilidad

- ✅ **React 18+**: Hooks avanzados y Suspense
- ✅ **TypeScript**: Tipado completo y safety
- ✅ **Vite**: Build optimizado y chunks
- ✅ **Web APIs**: Canvas, File API, Crypto API
- ✅ **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+

### Limitaciones Conocidas

- 📱 **Móvil**: Procesamiento limitado en dispositivos de baja gama
- 🧠 **Memoria**: Archivos > 100MB pueden causar problemas de memoria
- 🌐 **Conexión**: Chunks requieren conexión estable para reanudación
- 📊 **WebP**: Soporte limitado en navegadores antiguos

## Testing

```typescript
import { fileProcessingService } from '../services/fileProcessingService';

describe('File Processing', () => {
  it('should compress large images', async () => {
    const file = new File([/* blob */], 'test.jpg', { type: 'image/jpeg' });
    const result = await fileProcessingService.processImage(file);
    
    expect(result.success).toBe(true);
    expect(result.processedFile.size).toBeLessThan(file.size);
  });
});
```