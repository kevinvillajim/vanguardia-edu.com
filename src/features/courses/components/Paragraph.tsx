import React, { useState, useCallback } from 'react';
import { BookOpen, Copy, Check, Type, Maximize2, Minimize2, Shield } from 'lucide-react';
import { createComponentLogger } from '../../../shared/utils/logger';
import { sanitizeEducationalHTML, extractPlainText } from '../../../shared/utils/htmlSanitizer';

const logger = createComponentLogger('Paragraph');

interface ParagraphProps {
  /** Text content - supports plain text and basic markdown */
  content: string;
  /** Custom CSS classes */
  className?: string;
  /** Enable markdown parsing */
  enableMarkdown?: boolean;
  /** Enable copy functionality */
  enableCopy?: boolean;
  /** Enable text size adjustment */
  enableTextResize?: boolean;
  /** Enable full-screen reading mode */
  enableFullscreen?: boolean;
  /** Content variant for styling */
  variant?: 'default' | 'highlight' | 'note' | 'warning' | 'success';
  /** Accessibility: aria-label for screen readers */
  ariaLabel?: string;
}

type TextSize = 'sm' | 'md' | 'lg' | 'xl';

/**
 * Paragraph component for educational content with accessibility and UX features
 * Supports markdown, copy functionality, and reading enhancements
 */
export const Paragraph: React.FC<ParagraphProps> = ({
  content,
  className = '',
  enableMarkdown = true,
  enableCopy = true,
  enableTextResize = true,
  enableFullscreen = false,
  variant = 'default',
  ariaLabel
}) => {
  const [textSize, setTextSize] = useState<TextSize>('md');
  const [isCopied, setIsCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Ensure content is a string
  const safeContent = content || '';

  logger.debug('Paragraph rendered', { 
    contentLength: safeContent.length, 
    variant, 
    textSize,
    enableMarkdown 
  });

  const handleCopy = useCallback(async () => {
    try {
      // Copiar solo el texto plano, sin HTML
      const plainText = extractPlainText(safeContent);
      await navigator.clipboard.writeText(plainText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      logger.info('Content copied to clipboard');
    } catch (error) {
      logger.error('Failed to copy content', { error });
    }
  }, [safeContent]);

  const handleTextSizeChange = useCallback(() => {
    const sizes: TextSize[] = ['sm', 'md', 'lg', 'xl'];
    const currentIndex = sizes.indexOf(textSize);
    const nextIndex = (currentIndex + 1) % sizes.length;
    setTextSize(sizes[nextIndex]);
    logger.debug('Text size changed', { from: textSize, to: sizes[nextIndex] });
  }, [textSize]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
    logger.debug('Fullscreen toggled', { isFullscreen: !isFullscreen });
  }, [isFullscreen]);

  // Process content based on markdown support with security
  const processContent = useCallback((text: string): string => {
    // Ensure text is a string
    const safeText = String(text || '');
    
    if (!safeText) {
      return safeText;
    }

    if (!enableMarkdown) {
      // Si no hay markdown, aún necesitamos sanitizar el HTML
      return sanitizeEducationalHTML(safeText);
    }

    // Basic markdown processing (secure)
    let processed = safeText
      // Bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic text
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Code inline
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm">$1</code>')
      // Line breaks
      .replace(/\n/g, '<br>');

    // IMPORTANTE: Sanitizar después del procesamiento de markdown
    return sanitizeEducationalHTML(processed);
  }, [enableMarkdown]);

  // Get variant styles
  const getVariantStyles = useCallback((variant: string): string => {
    const variants = {
      default: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
      highlight: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
      note: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
      warning: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
      success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
    };
    return variants[variant] || variants.default;
  }, []);

  // Get text size classes
  const getTextSizeClasses = useCallback((size: TextSize): string => {
    const sizes = {
      sm: 'text-sm leading-relaxed',
      md: 'text-base leading-relaxed',
      lg: 'text-lg leading-relaxed',
      xl: 'text-xl leading-relaxed'
    };
    return sizes[size];
  }, []);

  const variantStyles = getVariantStyles(variant);
  const textSizeClasses = getTextSizeClasses(textSize);

  const fullscreenClass = isFullscreen 
    ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900 p-8 overflow-auto'
    : '';

  return (
    <article 
      className={`w-full border rounded-lg ${variantStyles} ${fullscreenClass} ${className}`}
      aria-label={ariaLabel || 'Contenido educativo'}
      role="article"
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <BookOpen className="w-4 h-4" />
          <span className="text-sm font-medium">Lectura</span>
        </div>
        
        <div className="flex items-center gap-2">
          {enableTextResize && (
            <button
              onClick={handleTextSizeChange}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              title={`Tamaño actual: ${textSize}`}
              aria-label="Cambiar tamaño de texto"
            >
              <Type className="w-4 h-4" />
            </button>
          )}
          
          {enableCopy && (
            <button
              onClick={handleCopy}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              title="Copiar contenido"
              aria-label="Copiar texto al portapapeles"
            >
              {isCopied ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          )}
          
          {enableFullscreen && (
            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
              aria-label={isFullscreen ? "Salir de pantalla completa" : "Ver en pantalla completa"}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className={`p-6 ${textSizeClasses}`}>
        {enableMarkdown ? (
          <div
            className="prose dark:prose-invert max-w-none text-gray-900 dark:text-white"
            dangerouslySetInnerHTML={{ __html: processContent(safeContent) }}
            aria-live="polite"
          />
        ) : (
          <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
            {safeContent}
          </p>
        )}
      </div>

      {/* Reading progress indicator for long content */}
      {safeContent.length > 500 && (
        <div className="px-6 pb-4">
          <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
            <span>Aproximadamente {Math.ceil(extractPlainText(safeContent).split(' ').length / 200)} minutos de lectura</span>
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-green-500" />
              <span className="text-green-600">Contenido protegido</span>
            </div>
          </div>
        </div>
      )}
    </article>
  );
};

export default Paragraph;