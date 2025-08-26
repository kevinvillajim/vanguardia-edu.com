/**
 * Utilidades para manejo consistente de IDs entre frontend y backend
 * 
 * REGLAS:
 * - Backend: Siempre number para entidades persistidas
 * - Frontend Domain: number para IDs del backend
 * - Frontend Builder: string para IDs temporales (con prefijos)
 * - Conversiones: Funciones específicas para mapear
 */

// Tipos para IDs
export type BackendId = number;
export type FrontendId = string;
export type TemporaryId = string;

// Prefijos para IDs temporales
export const ID_PREFIXES = {
  TEMP_COURSE: 'course-temp-',
  TEMP_UNIT: 'unit-temp-',
  TEMP_MODULE: 'module-temp-',
  TEMP_COMPONENT: 'component-temp-',
  BUILDER_MODULE: 'builder-mod-',
  BUILDER_COMPONENT: 'builder-comp-'
} as const;

/**
 * Verifica si un ID es temporal (usado en el builder antes de persistir)
 */
export const isTemporaryId = (id: string | number | undefined | null): boolean => {
  if (typeof id !== 'string') return false;
  return Object.values(ID_PREFIXES).some(prefix => id.startsWith(prefix));
};

/**
 * Verifica si un ID es del backend (número válido)
 */
export const isBackendId = (id: string | number | undefined | null): id is BackendId => {
  if (typeof id === 'number') return id > 0;
  if (typeof id === 'string') {
    const parsed = parseInt(id, 10);
    return !isNaN(parsed) && parsed > 0;
  }
  return false;
};

/**
 * Convierte un ID del backend (number) a string para uso en el frontend
 */
export const backendIdToString = (id: BackendId | undefined | null): FrontendId => {
  if (id === undefined || id === null) return '';
  return id.toString();
};

/**
 * Convierte un ID string del frontend a number para el backend
 * Retorna undefined si el ID es temporal o inválido
 */
export const stringIdToBackend = (id: FrontendId | undefined | null): BackendId | undefined => {
  if (!id || isTemporaryId(id)) return undefined;
  const parsed = parseInt(id, 10);
  return isNaN(parsed) || parsed <= 0 ? undefined : parsed;
};

/**
 * Genera un ID temporal único con el prefijo especificado
 */
export const generateTemporaryId = (prefix: string): TemporaryId => {
  return `${prefix}${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Extrae el ID del backend desde un objeto que puede tener múltiples campos de ID
 */
export const extractBackendId = (entity: {
  id?: string | number;
  backendId?: number;
  backendUnitId?: number;
  backendModuleId?: number;
  backendComponentId?: number;
}): BackendId | undefined => {
  // Priorizar IDs específicos del backend
  if (entity.backendUnitId) return entity.backendUnitId;
  if (entity.backendModuleId) return entity.backendModuleId;
  if (entity.backendComponentId) return entity.backendComponentId;
  if (entity.backendId) return entity.backendId;
  
  // Fallback al ID principal si es válido
  return stringIdToBackend(entity.id?.toString());
};

/**
 * Clase para mapear IDs entre builder y backend manteniendo relaciones
 */
export class IdMapper {
  private builderToBackendMap = new Map<string, number>();
  private backendToBuilderMap = new Map<number, string>();

  /**
   * Registra una relación entre ID del builder y ID del backend
   */
  registerMapping(builderId: string, backendId: number): void {
    this.builderToBackendMap.set(builderId, backendId);
    this.backendToBuilderMap.set(backendId, builderId);
  }

  /**
   * Obtiene el ID del backend correspondiente a un ID del builder
   */
  getBackendId(builderId: string): number | undefined {
    return this.builderToBackendMap.get(builderId);
  }

  /**
   * Obtiene el ID del builder correspondiente a un ID del backend
   */
  getBuilderId(backendId: number): string | undefined {
    return this.backendToBuilderMap.get(backendId);
  }

  /**
   * Limpia todas las relaciones
   */
  clear(): void {
    this.builderToBackendMap.clear();
    this.backendToBuilderMap.clear();
  }

  /**
   * Obtiene todas las relaciones registradas
   */
  getAllMappings(): Array<{ builderId: string; backendId: number }> {
    return Array.from(this.builderToBackendMap.entries()).map(([builderId, backendId]) => ({
      builderId,
      backendId
    }));
  }
}

/**
 * Validación de IDs antes de enviar al backend
 */
export const validateBackendId = (id: unknown, context: string = ''): BackendId => {
  if (typeof id === 'number' && id > 0) return id;
  if (typeof id === 'string') {
    const parsed = parseInt(id, 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  
  throw new Error(`ID inválido para backend${context ? ` (${context})` : ''}: ${id}`);
};

/**
 * Helpers específicos para diferentes tipos de entidades
 */
export const courseIdUtils = {
  generateTempId: () => generateTemporaryId(ID_PREFIXES.TEMP_COURSE),
  isTemp: (id: string) => id.startsWith(ID_PREFIXES.TEMP_COURSE),
};

export const unitIdUtils = {
  generateTempId: () => generateTemporaryId(ID_PREFIXES.TEMP_UNIT),
  isTemp: (id: string) => id.startsWith(ID_PREFIXES.TEMP_UNIT),
};

export const moduleIdUtils = {
  generateTempId: () => generateTemporaryId(ID_PREFIXES.TEMP_MODULE),
  generateBuilderId: () => generateTemporaryId(ID_PREFIXES.BUILDER_MODULE),
  isTemp: (id: string) => id.startsWith(ID_PREFIXES.TEMP_MODULE),
  isBuilder: (id: string) => id.startsWith(ID_PREFIXES.BUILDER_MODULE),
};

export const componentIdUtils = {
  generateTempId: () => generateTemporaryId(ID_PREFIXES.TEMP_COMPONENT),
  generateBuilderId: () => generateTemporaryId(ID_PREFIXES.BUILDER_COMPONENT),
  isTemp: (id: string) => id.startsWith(ID_PREFIXES.TEMP_COMPONENT),
  isBuilder: (id: string) => id.startsWith(ID_PREFIXES.BUILDER_COMPONENT),
};