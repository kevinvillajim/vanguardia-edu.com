/**
 * Hook personalizado para el sistema de auto-guardado híbrido
 */

import { useEffect, useCallback, useRef, useState } from 'react';
import { HybridAutoSaveService, AutoSaveStatus } from '../services/HybridAutoSaveService';
import { autoSaveRepository, DraftData } from '../infrastructure/repositories/AutoSaveRepository';
import { logger } from '../shared/utils/logger';

interface UseHybridAutoSaveOptions {
  courseId: number | null;
  enabled?: boolean;
  onSaveSuccess?: () => void;
  onSaveError?: (error: Error) => void;
}

export const useHybridAutoSave = (options: UseHybridAutoSaveOptions) => {
  const { courseId, enabled = true, onSaveSuccess, onSaveError } = options;
  
  const [status, setStatus] = useState<AutoSaveStatus>('idle');
  const serviceRef = useRef<HybridAutoSaveService | null>(null);
  const dataRef = useRef<DraftData>({});

  // Inicializar servicio si no existe
  useEffect(() => {
    if (!serviceRef.current) {
      serviceRef.current = new HybridAutoSaveService();
    }
    
    return serviceRef.current.onStatusChange(setStatus);
  }, []);

  // Función para actualizar datos a guardar
  const updateData = useCallback((newData: DraftData) => {
    dataRef.current = { 
      ...newData, 
      timestamp: new Date().toISOString() 
    };
  }, []);

  // Función para notificar cambios
  const notifyChange = useCallback((isSubstantialChange = false) => {
    if (!courseId || !enabled || !serviceRef.current) return;

    const dataProvider = () => dataRef.current;
    const saveCallback = autoSaveRepository.createSaveCallback(courseId, 'auto');
    
    serviceRef.current.notifyChange(
      courseId, 
      dataProvider, 
      async (data) => {
        try {
          await saveCallback(data);
          onSaveSuccess?.();
        } catch (error) {
          onSaveError?.(error as Error);
          throw error;
        }
      },
      isSubstantialChange
    );
  }, [courseId, enabled, onSaveSuccess, onSaveError]);

  // Iniciar auto-guardado cuando hay courseId y está habilitado
  useEffect(() => {
    if (!courseId || !enabled || !serviceRef.current) return;

    const dataProvider = () => dataRef.current;
    const saveCallback = autoSaveRepository.createSaveCallback(courseId, 'auto');
    
    serviceRef.current.start(courseId, dataProvider, async (data) => {
      try {
        await saveCallback(data);
        onSaveSuccess?.();
      } catch (error) {
        onSaveError?.(error as Error);
        throw error;
      }
    });

    // Cleanup al desmontar
    return () => {
      serviceRef.current?.stop();
    };
  }, [courseId, enabled, onSaveSuccess, onSaveError]);

  // Guardado manual forzado
  const forceSave = useCallback(async (): Promise<void> => {
    if (!courseId || !serviceRef.current) {
      throw new Error('No se puede guardar: curso no inicializado');
    }

    const saveCallback = autoSaveRepository.createSaveCallback(courseId, 'manual');
    
    try {
      await serviceRef.current.forceSave(courseId, dataRef.current, async (data) => {
        try {
          await saveCallback(data);
          onSaveSuccess?.();
        } catch (error) {
          onSaveError?.(error as Error);
          throw error;
        }
      });
    } catch (error) {
      logger.error('❌ Error en guardado manual:', error);
      throw error;
    }
  }, [courseId, onSaveSuccess, onSaveError]);

  // Cargar último borrador
  const loadLatestDraft = useCallback(async (): Promise<DraftData | null> => {
    if (!courseId) return null;

    try {
      const response = await autoSaveRepository.getLatestDraft(courseId);
      return response.data.draft;
    } catch (error) {
      logger.error('❌ Error cargando borrador:', error);
      throw error;
    }
  }, [courseId]);

  // Detener auto-guardado
  const stop = useCallback(() => {
    serviceRef.current?.stop();
  }, []);

  return {
    status,
    updateData,
    notifyChange,
    forceSave,
    loadLatestDraft,
    stop,
    isActive: !!courseId && enabled
  };
};