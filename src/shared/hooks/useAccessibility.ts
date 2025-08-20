import React, { useEffect, useRef, useState } from 'react';

export interface AccessibilityOptions {
  autoFocus?: boolean;
  trapFocus?: boolean;
  restoreFocus?: boolean;
  closeOnEscape?: boolean;
  closeOnOutsideClick?: boolean;
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

export const useAccessibility = (
  isOpen: boolean,
  onClose: () => void,
  options: AccessibilityOptions = {}
) => {
  const {
    autoFocus = true,
    trapFocus = true,
    restoreFocus = true,
    closeOnEscape = true,
    closeOnOutsideClick = true,
    ariaLabel,
    ariaDescribedBy
  } = options;

  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  // Store the previously focused element when component mounts
  useEffect(() => {
    if (isOpen) {
      previousActiveElementRef.current = document.activeElement as HTMLElement;
    }
  }, [isOpen]);

  // Auto focus first focusable element
  useEffect(() => {
    if (isOpen && autoFocus && containerRef.current) {
      const focusableElement = containerRef.current.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;
      
      if (focusableElement) {
        setTimeout(() => focusableElement.focus(), 100);
      }
    }
  }, [isOpen, autoFocus]);

  // Trap focus within container
  useEffect(() => {
    if (!isOpen || !trapFocus || !containerRef.current) return;

    const container = containerRef.current;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const focusableElements = container.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      ) as NodeListOf<HTMLElement>;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, trapFocus]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen || !closeOnOutsideClick) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, closeOnOutsideClick, onClose]);

  // Restore focus when component unmounts or closes
  useEffect(() => {
    return () => {
      if (restoreFocus && previousActiveElementRef.current) {
        setTimeout(() => {
          previousActiveElementRef.current?.focus();
        }, 100);
      }
    };
  }, [isOpen, restoreFocus]);

  return {
    containerRef,
    containerProps: {
      ref: containerRef,
      role: 'dialog',
      'aria-modal': isOpen,
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedBy,
      tabIndex: -1,
    }
  };
};

export const useScreenReader = () => {
  const [announcements, setAnnouncements] = useState<string[]>([]);

  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    setAnnouncements(prev => [...prev, message]);
    
    // Remove announcement after a delay to clean up
    setTimeout(() => {
      setAnnouncements(prev => prev.filter(a => a !== message));
    }, 1000);
  };

  const ScreenReaderAnnouncements: React.FC = () => {
    return React.createElement('div', {
      className: 'sr-only',
      'aria-live': 'polite',
      'aria-atomic': 'true'
    }, announcements.map((announcement, index) => 
      React.createElement('div', { key: index }, announcement)
    ));
  };

  return { announce, ScreenReaderAnnouncements };
};

export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
};

export default useAccessibility;