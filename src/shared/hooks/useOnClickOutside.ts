import { useEffect, useRef, RefObject } from 'react';

/**
 * Hook for detecting clicks outside of a specific element
 * Useful for modals, dropdowns, etc.
 */
export function useOnClickOutside<T extends HTMLElement = HTMLElement>(
  handler: (event: MouseEvent | TouchEvent) => void,
  ref?: RefObject<T>
): RefObject<T> {
  const localRef = useRef<T>(null);
  const refToUse = ref || localRef;

  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const element = refToUse?.current;
      
      // Do nothing if clicking ref's element or descendent elements
      if (!element || element.contains(event.target as Node)) {
        return;
      }

      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [refToUse, handler]);

  return refToUse;
}

export default useOnClickOutside;