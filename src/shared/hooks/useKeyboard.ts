import { useEffect, useCallback, useState } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  callback: (event: KeyboardEvent) => void;
  preventDefault?: boolean;
  target?: 'document' | 'window';
}

export const useKeyboard = (shortcuts: KeyboardShortcut[]) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    shortcuts.forEach(({ key, ctrlKey, metaKey, shiftKey, altKey, callback, preventDefault = true }) => {
      const isKeyMatch = event.key.toLowerCase() === key.toLowerCase();
      const isCtrlMatch = ctrlKey ? event.ctrlKey : !event.ctrlKey;
      const isMetaMatch = metaKey ? event.metaKey : !event.metaKey;
      const isShiftMatch = shiftKey ? event.shiftKey : !event.shiftKey;
      const isAltMatch = altKey ? event.altKey : !event.altKey;

      if (isKeyMatch && isCtrlMatch && isMetaMatch && isShiftMatch && isAltMatch) {
        if (preventDefault) {
          event.preventDefault();
          event.stopPropagation();
        }
        callback(event);
      }
    });
  }, [shortcuts]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};

// Hook para navegación con teclado en listas
export const useListNavigation = (
  items: any[],
  onSelect: (item: any, index: number) => void,
  isOpen: boolean = true
) => {
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'ArrowDown',
      callback: () => {
        if (isOpen) {
          setSelectedIndex(prev => (prev + 1) % items.length);
        }
      }
    },
    {
      key: 'ArrowUp',
      callback: () => {
        if (isOpen) {
          setSelectedIndex(prev => prev <= 0 ? items.length - 1 : prev - 1);
        }
      }
    },
    {
      key: 'Enter',
      callback: () => {
        if (isOpen && selectedIndex >= 0 && selectedIndex < items.length) {
          onSelect(items[selectedIndex], selectedIndex);
        }
      }
    },
    {
      key: 'Escape',
      callback: () => {
        setSelectedIndex(-1);
      }
    }
  ];

  useKeyboard(shortcuts);

  useEffect(() => {
    if (!isOpen) {
      setSelectedIndex(-1);
    }
  }, [isOpen]);

  return { selectedIndex, setSelectedIndex };
};

export default useKeyboard;