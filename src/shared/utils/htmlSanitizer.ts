import DOMPurify from 'dompurify';

/**
 * Configuración segura para sanitización de HTML educativo
 * Solo permite elementos y atributos seguros para contenido de cursos
 */
const SAFE_HTML_CONFIG = {
  // Elementos permitidos - solo los necesarios para contenido educativo
  ALLOWED_TAGS: [
    // Estructura básica
    'p', 'br', 'div',
    // Títulos
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    // Formato de texto
    'strong', 'b', 'em', 'i', 'u', 's', 'mark',
    // Listas
    'ul', 'ol', 'li',
    // Enlaces (limitados)
    'a',
    // Código (sin ejecución)
    'code', 'pre',
    // Citas
    'blockquote', 'cite',
    // Tablas básicas
    'table', 'thead', 'tbody', 'tr', 'td', 'th',
    // Elementos inline seguros
    'span', 'small', 'sub', 'sup'
  ],

  // Atributos permitidos - muy restrictivos
  ALLOWED_ATTR: [
    // Solo estilos CSS seguros en línea (limitados)
    'style',
    // Enlaces seguros
    'href', 'target', 'rel',
    // Clases CSS (para estilos)
    'class',
    // IDs para navegación interna
    'id',
    // Atributos de accesibilidad
    'aria-label', 'aria-describedby', 'role',
    // Atributos de tabla
    'colspan', 'rowspan'
  ],

  // Protocolos permitidos en enlaces
  ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|#):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,

  // Filtrar CSS peligroso
  ALLOW_DATA_ATTR: false,
  ALLOW_UNKNOWN_PROTOCOLS: false,
  
  // Configuraciones adicionales de seguridad
  SANITIZE_DOM: true,
  KEEP_CONTENT: true,
  
  // Hook para filtrar CSS inline peligroso
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onmouseout', 'onfocus', 'onblur'],
  
  // Filtros personalizados
  CUSTOM_ELEMENT_HANDLING: {
    tagNameCheck: null,
    attributeNameCheck: null,
    allowCustomizedBuiltInElements: false
  }
};

/**
 * Sanitiza HTML de manera segura para contenido educativo
 * Elimina scripts, eventos, y elementos peligrosos
 */
export const sanitizeEducationalHTML = (html: string): string => {
  if (!html || typeof html !== 'string') {
    return '';
  }

  // Sanitización base con DOMPurify
  let sanitized = DOMPurify.sanitize(html, SAFE_HTML_CONFIG);

  // Filtros adicionales de seguridad específicos
  sanitized = sanitized
    // Eliminar cualquier script que se haya escapado
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Eliminar eventos JavaScript inline que puedan haberse escapado
    .replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '')
    // Eliminar javascript: en href
    .replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"')
    // Eliminar data: URLs peligrosas
    .replace(/src\s*=\s*["']data:[^"']*["']/gi, '')
    // Asegurar que los enlaces externos abran en nueva ventana de forma segura
    .replace(/<a\s+([^>]*href\s*=\s*["']https?:\/\/[^"']*["'][^>]*)>/gi, 
             '<a $1 target="_blank" rel="noopener noreferrer">');

  return sanitized;
};

/**
 * Versión más restrictiva para sanitizar contenido en vistas previas
 * Elimina completamente cualquier interactividad
 */
export const sanitizeForPreview = (html: string): string => {
  const restrictiveConfig = {
    ...SAFE_HTML_CONFIG,
    ALLOWED_TAGS: SAFE_HTML_CONFIG.ALLOWED_TAGS.filter(tag => tag !== 'a'), // Sin enlaces en preview
    ALLOWED_ATTR: SAFE_HTML_CONFIG.ALLOWED_ATTR.filter(attr => 
      !['href', 'target', 'onclick'].includes(attr)
    )
  };

  return DOMPurify.sanitize(html || '', restrictiveConfig);
};

/**
 * Extrae solo el texto plano de HTML, eliminando todas las etiquetas
 * Útil para estadísticas y búsquedas
 */
export const extractPlainText = (html: string): string => {
  if (!html || typeof html !== 'string') {
    return '';
  }

  // Primero sanitizar, luego extraer texto
  const sanitized = sanitizeEducationalHTML(html);
  
  // Crear elemento temporal para extraer texto
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = sanitized;
  
  return tempDiv.textContent || tempDiv.innerText || '';
};

/**
 * Valida que el HTML sea seguro antes de guardarlo
 * Retorna true si es seguro, false si contiene contenido peligroso
 */
export const validateHTMLSafety = (html: string): boolean => {
  if (!html || typeof html !== 'string') {
    return true;
  }

  // Lista de patrones peligrosos que nunca deberían estar presentes
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<embed/i,
    /<object/i,
    /document\./i,
    /window\./i,
    /eval\(/i,
    /setTimeout/i,
    /setInterval/i
  ];

  return !dangerousPatterns.some(pattern => pattern.test(html));
};

/**
 * Configuración de DOMPurify específica para el editor WYSIWYG
 * Permite un poco más de flexibilidad durante la edición
 */
export const sanitizeForEditor = (html: string): string => {
  const editorConfig = {
    ...SAFE_HTML_CONFIG,
    // En el editor, permitimos algunos atributos adicionales temporalmente
    ALLOWED_ATTR: [
      ...SAFE_HTML_CONFIG.ALLOWED_ATTR,
      'contenteditable', // Para el funcionamiento del editor
      'data-*' // Para metadatos temporales del editor
    ]
  };

  return DOMPurify.sanitize(html || '', editorConfig);
};