# 📁 Componentes de Media

Este directorio contiene componentes especializados para el manejo de contenido multimedia en VanguardIA.

## 📋 Componentes Disponibles

### 🖼️ MediaImage
Componente inteligente para mostrar imágenes con:
- ✅ Lazy loading automático
- ✅ Estados de carga (loading, error, success)
- ✅ URLs optimizadas según el entorno
- ✅ Fallback para imágenes no disponibles
- ✅ Soporte para diferentes tamaños y estilos

```tsx
import { MediaImage } from '@/shared/components/media/MediaImage';

// Uso básico
<MediaImage src="/uploads/courses/image.jpg" alt="Descripción" />

// Con configuraciones avanzadas
<MediaImage
  src="/uploads/courses/image.jpg"
  alt="Descripción"
  className="rounded-lg shadow-md"
  width={400}
  height={300}
  loading="lazy"
  onLoad={() => console.log('Imagen cargada')}
  onError={() => console.log('Error al cargar')}
/>
```

### 🎵 AudioPlayer ⭐ NEW
Componente inteligente para reproducir audio con streaming y lazy loading:
- ✅ **Streaming inteligente** - Reproduce mientras se carga (como YouTube)
- ✅ **Calidad adaptativa** - Ajusta automáticamente según la conexión
- ✅ **Buffer inteligente** - Mantiene reproducción fluida
- ✅ **Reintentos automáticos** - Se recupera de errores de red
- ✅ **3 variantes de diseño** - default, compact, minimal
- ✅ **Controles avanzados** - Skip, volumen, descarga
- ✅ **Indicadores de red** - Estado de conexión y buffer

```tsx
import { AudioPlayer } from '@/shared/components/media/AudioPlayer';

// Uso básico
<AudioPlayer src="/uploads/audio/track.mp3" />

// Con configuraciones avanzadas
<AudioPlayer
  src="/uploads/audio/track.mp3"
  title="Mi Podcast Episodio 1"
  description="Descripción del audio"
  autoPlay={false}
  showDownload={true}
  variant="default"
  onPlay={() => console.log('Reproduciendo')}
  onPause={() => console.log('Pausado')}
  onEnded={() => console.log('Terminado')}
  onLoadProgress={(loaded, total) => console.log('Cargando:', loaded/total)}
  onTimeUpdate={(current, total) => console.log('Progreso:', current/total)}
/>

// Variantes de diseño
<AudioPlayer src="/audio.mp3" variant="compact" />   {/* Más pequeño */}
<AudioPlayer src="/audio.mp3" variant="minimal" />   {/* Solo botón play */}
<AudioPlayer src="/audio.mp3" variant="default" />   {/* Completo */}
```

#### Características del AudioPlayer

**🚀 Streaming Inteligente:**
- Buffer progresivo mientras reproduce
- Detección automática de calidad de conexión
- Ajuste adaptativo de bitrate
- Reintentos automáticos en errores de red

**📊 Indicadores Visuales:**
- Estado de conexión (excelente, buena, pobre, offline)
- Progreso de buffer en tiempo real
- Indicador de carga/buffering
- Información de debug en desarrollo

**🎛️ Controles Avanzados:**
- Play/Pause con estados inteligentes
- Skip adelante/atrás (10 segundos)
- Control de volumen con slider
- Descarga directa del archivo
- Barra de progreso interactiva

**📱 Diseño Responsivo:**
- 3 variantes según el espacio disponible
- Optimizado para mobile y desktop
- Indicadores de estado claros
- Accesible por teclado

## 🔧 Características Técnicas

### Lazy Loading Inteligente
- Solo carga imágenes cuando están en el viewport
- Mejora el rendimiento de la página
- Reduce el ancho de banda inicial

### Streaming de Audio
- **Lazy Loading**: Metadatos primero, contenido bajo demanda
- **Buffer Adaptativo**: Mantiene 2-5 segundos de buffer mínimo
- **Calidad Dinámica**: Ajusta según velocidad de conexión
- **Recuperación de Errores**: Reintentos automáticos con backoff exponencial

### Gestión de Estados
- **Loading**: Muestra placeholder mientras carga
- **Error**: Fallback cuando la imagen no está disponible  
- **Success**: Imagen mostrada correctamente
- **Buffering**: Indicadores de carga en streaming
- **Network**: Estados de conexión (excellent, good, poor, offline)

### URLs Optimizadas
- Detecta automáticamente el entorno (desarrollo/producción)
- Construye URLs correctas para el backend
- Maneja rutas absolutas y relativas

## 🎨 Estilos y Personalización

Los componentes usan Tailwind CSS y pueden personalizarse:

```tsx
// Estilos personalizados para AudioPlayer
<AudioPlayer
  src="/audio.mp3"
  variant="default"
  className="custom-audio-player"
/>

// MediaImage con estilos responsivos
<MediaImage
  src="/imagen.jpg"
  alt="Imagen"
  className="w-full h-64 object-cover sm:h-80 lg:h-96"
/>
```

## 🚀 Mejores Prácticas

### Accesibilidad
- Siempre incluir atributo `alt` descriptivo en imágenes
- Usar controles accesibles por teclado en audio
- Proporcionar títulos y descripciones para contenido multimedia

### Rendimiento
- Usar lazy loading para contenido fuera del viewport inicial
- Implementar buffer inteligente para audio streaming
- Optimizar tamaños de archivo en el backend
- Usar formatos modernos (WebP para imágenes, AAC para audio)

### UX de Audio Streaming
- No usar autoplay por defecto (UX invasiva)
- Mostrar indicadores de carga y progreso claros
- Permitir controles de calidad manual cuando sea necesario
- Implementar recuperación automática de errores

### SEO
- Incluir descripciones alt relevantes
- Usar nombres de archivo descriptivos
- Implementar structured data cuando sea apropiado

## 🔮 Roadmap

### ✅ Completado
- [x] **AudioPlayer** - Reproductor con streaming inteligente
- [x] **MediaImage** - Imágenes con lazy loading
- [x] **Streaming Adaptativo** - Calidad según conexión
- [x] **Estados de Red** - Indicadores de conectividad

### Próximas Características
- [ ] Soporte para imágenes responsivas (srcset)
- [ ] Integración con CDN para optimización automática
- [ ] Componente para galerías de imágenes
- [ ] Soporte para formato WebP/AVIF
- [ ] Zoom y lightbox integrados
- [ ] Carga progresiva (blur-up)

### Componentes Planeados
- [ ] **VideoPlayer** - Reproductor de video con streaming
- [ ] **FileViewer** - Visualizador de documentos y PDFs
- [ ] **MediaUploader** - Componente para subir multimedia
- [ ] **ImageGallery** - Galería de imágenes con navegación
- [ ] **PlaylistPlayer** - Reproductor de listas de audio/video

## 📚 Recursos Adicionales

- [Documentación de Lazy Loading](https://web.dev/lazy-loading/)
- [Mejores Prácticas para Imágenes Web](https://web.dev/image-optimization/)
- [Guía de Accesibilidad para Imágenes](https://www.w3.org/WAI/tutorials/images/)
- [HTML Audio API](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/audio)
- [Streaming de Audio en Web](https://developer.mozilla.org/en-US/docs/Web/Media/Streaming)