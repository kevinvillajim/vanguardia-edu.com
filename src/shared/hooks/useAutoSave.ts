import { useEffect, useRef, useState } from 'react';
import { debounce } from 'lodash';

interface UseAutoSaveOptions {
  delay?: number; // Delay en millisegundos
  onSave: (data: any) => Promise<void>;
  onError?: (error: Error) => void;
  enabled?: boolean;
}

export const useAutoSave = <T extends object>(
  data: T,
  options: UseAutoSaveOptions
) => {
  const { 
    delay = 2000, 
    onSave, 
    onError,
    enabled = true 
  } = options;
  
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<Error | null>(null);
  const previousDataRef = useRef<T>(data);
  
  // Crear función debounced
  const debouncedSave = useRef(
    debounce(async (dataToSave: T) => {
      if (!enabled) return;
      
      setIsSaving(true);
      setSaveError(null);
      
      try {
        await onSave(dataToSave);
        setLastSaved(new Date());
        previousDataRef.current = dataToSave;
      } catch (error) {
        const err = error as Error;
        setSaveError(err);
        if (onError) {
          onError(err);
        }
      } finally {
        setIsSaving(false);
      }
    }, delay)
  ).current;
  
  // Effect para detectar cambios y auto-guardar
  useEffect(() => {
    if (!enabled) return;
    
    // Comparar con datos anteriores para evitar guardados innecesarios
    const hasChanges = JSON.stringify(data) !== JSON.stringify(previousDataRef.current);
    
    if (hasChanges) {
      debouncedSave(data);
    }
  }, [data, debouncedSave, enabled]);
  
  // Cleanup
  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);
  
  // Función para forzar guardado inmediato
  const forceSave = async () => {
    debouncedSave.cancel();
    setIsSaving(true);
    setSaveError(null);
    
    try {
      await onSave(data);
      setLastSaved(new Date());
      previousDataRef.current = data;
    } catch (error) {
      const err = error as Error;
      setSaveError(err);
      if (onError) {
        onError(err);
      }
      throw err;
    } finally {
      setIsSaving(false);
    }
  };
  
  return {
    isSaving,
    lastSaved,
    saveError,
    forceSave,
    getTimeSinceLastSave: () => {
      if (!lastSaved) return null;
      const now = new Date();
      const diff = now.getTime() - lastSaved.getTime();
      const seconds = Math.floor(diff / 1000);
      
      if (seconds < 60) return `${seconds} segundos`;
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes} minutos`;
      const hours = Math.floor(minutes / 60);
      return `${hours} horas`;
    }
  };
};