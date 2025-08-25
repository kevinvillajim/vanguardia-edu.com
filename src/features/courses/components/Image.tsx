import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { ZoomIn, ZoomOut, X, ImageOff, RotateCcw, Download, Maximize2, Move } from 'lucide-react';
import { useMediaUrl } from '../../../shared/hooks/useMediaUrl';
import { createComponentLogger } from '../../../shared/utils/logger';

const logger = createComponentLogger('Image');

interface ImageViewerModalProps {
  src: string;
  alt: string;
  onClose: () => void;
}

interface ImageProps {
  /** Image source path or URL */
  img: string;
  /** Alt text for accessibility */
  alt?: string;
  /** Custom CSS classes */
  className?: string;
  /** Optional course ID for media organization */
  courseId?: number;
  /** Optional unit ID for media organization */
  unitId?: number;
  /** Enable lazy loading */
  lazy?: boolean;
  /** Enable zoom functionality */
  enableZoom?: boolean;
  /** Enable download functionality */
  enableDownload?: boolean;
  /** Image sizes for responsive loading */
  sizes?: string;
  /** Loading component */
  LoadingComponent?: React.ComponentType;
  /** Error component */
  ErrorComponent?: React.ComponentType<{ onRetry: () => void }>;
}

/**
 * Advanced Image Viewer Modal with zoom, pan, and accessibility
 */
const ImageViewerModal: React.FC<ImageViewerModalProps> = ({ src, alt, onClose }) => {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoom = useCallback((delta: number) => {
    setZoom(prevZoom => {
      const newZoom = Math.min(Math.max(prevZoom + delta, 0.5), 5);
      logger.debug('Zoom changed', { from: prevZoom, to: newZoom });
      return newZoom;
    });
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.2 : 0.2;
    handleZoom(delta);
  }, [handleZoom]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  }, [zoom, position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || zoom <= 1) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  }, [isDragging, zoom, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const resetView = useCallback(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    logger.debug('Image view reset');
  }, []);

  const downloadImage = useCallback(async () => {
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = alt || 'image';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      logger.info('Image downloaded', { src, alt });
    } catch (error) {
      logger.error('Failed to download image', { error, src });
    }
  }, [src, alt]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case '+':
        case '=':
          e.preventDefault();
          handleZoom(0.2);
          break;
        case '-':
          e.preventDefault();
          handleZoom(-0.2);
          break;
        case '0':
          e.preventDefault();
          resetView();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, handleZoom, resetView]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      {/* Header with controls */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleZoom(0.2)}
            className="p-2 bg-black bg-opacity-50 text-white rounded-lg hover:bg-opacity-70 transition-colors"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleZoom(-0.2)}
            className="p-2 bg-black bg-opacity-50 text-white rounded-lg hover:bg-opacity-70 transition-colors"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <button
            onClick={resetView}
            className="p-2 bg-black bg-opacity-50 text-white rounded-lg hover:bg-opacity-70 transition-colors"
            aria-label="Reset view"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <button
            onClick={downloadImage}
            className="p-2 bg-black bg-opacity-50 text-white rounded-lg hover:bg-opacity-70 transition-colors"
            aria-label="Download image"
          >
            <Download className="w-5 h-5" />
          </button>
          <span className="px-3 py-2 bg-black bg-opacity-50 text-white rounded-lg text-sm">
            {Math.round(zoom * 100)}%
          </span>
        </div>

        <button
          onClick={onClose}
          className="p-2 bg-black bg-opacity-50 text-white rounded-lg hover:bg-opacity-70 transition-colors"
          aria-label="Close viewer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Image container */}
      <div
        ref={containerRef}
        className="w-full h-full flex items-center justify-center overflow-hidden cursor-move"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img
          ref={imageRef}
          src={src}
          alt={alt}
          className="max-w-none max-h-none select-none"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
            transition: isDragging ? 'none' : 'transform 0.2s ease-out',
            cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in'
          }}
          draggable={false}
        />
      </div>

      {/* Help text */}
      <div className="absolute bottom-4 left-4 right-4 text-center">
        <p className="text-white text-sm bg-black bg-opacity-50 rounded-lg px-4 py-2 inline-block">
          Usa la rueda del mouse para zoom, arrastra para mover, ESC para cerrar
        </p>
      </div>
    </div>
  );
};

/**
 * Image component with lazy loading, zoom functionality, and accessibility
 * Follows clean architecture principles and modern web standards
 */
export const Image: React.FC<ImageProps> = ({
  img,
  alt = 'Imagen',
  className = '',
  courseId,
  unitId,
  lazy = true,
  enableZoom = true,
  enableDownload = false,
  sizes,
  LoadingComponent,
  ErrorComponent
}) => {
  const [showModal, setShowModal] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(!lazy);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    url: imageUrl,
    isLoading,
    hasError,
    retry
  } = useMediaUrl(isIntersecting ? img : undefined, {
    mediaType: 'images',
    courseId,
    unitId,
    fallbackStrategy: 'after-error'
  });

  logger.debug('Image component rendered', {
    img,
    imageUrl,
    isLoading,
    hasError,
    isIntersecting
  });

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || isIntersecting) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          logger.debug('Image entered viewport, starting load', { img });
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, isIntersecting, img]);

  const openModal = useCallback(() => {
    if (enableZoom && imageUrl) {
      setShowModal(true);
      logger.debug('Image modal opened', { imageUrl });
    }
  }, [enableZoom, imageUrl]);

  const closeModal = useCallback(() => {
    setShowModal(false);
    logger.debug('Image modal closed');
  }, []);

  // Generate responsive srcSet for better performance
  const responsiveSizes = useMemo(() => {
    if (!sizes || !imageUrl) return undefined;
    
    const breakpoints = [320, 640, 768, 1024, 1280, 1536];
    return breakpoints
      .map(width => `${imageUrl}?w=${width} ${width}w`)
      .join(', ');
  }, [imageUrl, sizes]);

  // Loading state
  if (isLoading && LoadingComponent) {
    return <LoadingComponent />;
  }

  // Error state with custom component
  if (hasError && ErrorComponent) {
    return <ErrorComponent onRetry={retry} />;
  }

  // Default error state
  if (hasError) {
    return (
      <div className={`relative h-[29rem] bg-gray-200 dark:bg-gray-800 rounded-lg mx-8 my-8 flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-500 dark:text-gray-400">
          <ImageOff className="w-16 h-16 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No se pudo cargar la imagen</h3>
          <p className="text-sm mb-4">Verifica tu conexión e inténtalo de nuevo</p>
          <button
            onClick={retry}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <figure 
        ref={containerRef}
        className={`relative mx-8 my-8 group ${className}`}
      >
        {/* Loading placeholder */}
        {!isIntersecting && (
          <div className="h-[29rem] bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center animate-pulse">
            <ImageOff className="w-12 h-12 text-gray-400" />
          </div>
        )}

        {/* Main image */}
        {isIntersecting && imageUrl && (
          <img
            ref={imageRef}
            src={imageUrl}
            srcSet={responsiveSizes}
            sizes={sizes}
            alt={alt}
            className="w-full h-auto rounded-lg shadow-lg cursor-pointer transition-transform duration-200 hover:scale-105"
            onClick={openModal}
            loading={lazy ? 'lazy' : 'eager'}
            onLoad={() => logger.success('Image loaded', { imageUrl })}
            onError={() => {
              logger.error('Image failed to load', { imageUrl });
              retry();
            }}
          />
        )}

        {/* Action buttons overlay */}
        {isIntersecting && imageUrl && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
            {enableZoom && (
              <button
                onClick={openModal}
                className="p-2 bg-black bg-opacity-50 text-white rounded-lg hover:bg-opacity-70 transition-colors"
                aria-label="Ver imagen en tamaño completo"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            )}
            
            {enableDownload && (
              <button
                onClick={async () => {
                  try {
                    const response = await fetch(imageUrl);
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = alt || 'image';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);
                  } catch (error) {
                    logger.error('Failed to download image', { error });
                  }
                }}
                className="p-2 bg-black bg-opacity-50 text-white rounded-lg hover:bg-opacity-70 transition-colors"
                aria-label="Descargar imagen"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Caption if provided */}
        {alt && alt !== 'Imagen' && (
          <figcaption className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center">
            {alt}
          </figcaption>
        )}
      </figure>

      {/* Modal viewer */}
      {showModal && imageUrl && (
        <ImageViewerModal
          src={imageUrl}
          alt={alt}
          onClose={closeModal}
        />
      )}
    </>
  );
};

export default Image;