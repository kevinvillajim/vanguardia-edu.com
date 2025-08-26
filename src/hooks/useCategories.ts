import { useState, useEffect, useCallback } from 'react';
import { categoryService } from '../services/categoryService';
import { 
  Category, 
  CreateCategoryData, 
  UpdateCategoryData, 
  CategoryFilters,
  CategoryStats,
  CategoryTree
} from '../domain/entities/Category';
import { PaginatedResponse } from '../shared/types';
import { logger } from '../shared/utils/logger';

/**
 * Hook para gestionar el estado de categorías
 */
export const useCategories = (initialFilters?: CategoryFilters, userRole?: 'teacher' | 'admin') => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);
  const [filters, setFilters] = useState<CategoryFilters>(initialFilters || {});

  /**
   * Cargar categorías
   */
  const loadCategories = useCallback(async (newFilters?: CategoryFilters) => {
    try {
      setLoading(true);
      setError(null);

      const filtersToUse = newFilters || filters;
      const response: PaginatedResponse<Category> = await categoryService.getCategories(filtersToUse);
      
      setCategories(response.data);
      setPagination(response.meta || null);
      
      logger.course('Categories loaded:', { count: response.data.length });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar categorías';
      setError(errorMessage);
      logger.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  /**
   * Crear nueva categoría
   */
  const createCategory = useCallback(async (data: CreateCategoryData): Promise<Category | null> => {
    try {
      setLoading(true);
      setError(null);

      const newCategory = await categoryService.createCategory(data, userRole);
      
      // Actualizar lista local
      setCategories(prev => [...prev, newCategory]);
      
      logger.success('Category created:', newCategory.name);
      return newCategory;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear categoría';
      setError(errorMessage);
      logger.error('Error creating category:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [userRole]);

  /**
   * Actualizar categoría
   */
  const updateCategory = useCallback(async (data: UpdateCategoryData): Promise<Category | null> => {
    try {
      setLoading(true);
      setError(null);

      const updatedCategory = await categoryService.updateCategory(data);
      
      // Actualizar lista local
      setCategories(prev => prev.map(cat => 
        cat.id === updatedCategory.id ? updatedCategory : cat
      ));
      
      logger.success('Category updated:', updatedCategory.name);
      return updatedCategory;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar categoría';
      setError(errorMessage);
      logger.error('Error updating category:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Eliminar categoría
   */
  const deleteCategory = useCallback(async (id: number): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      await categoryService.deleteCategory(id);
      
      // Remover de lista local
      setCategories(prev => prev.filter(cat => cat.id !== id));
      
      logger.success('Category deleted:', { id });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar categoría';
      setError(errorMessage);
      logger.error('Error deleting category:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualizar filtros y recargar
   */
  const updateFilters = useCallback((newFilters: Partial<CategoryFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    loadCategories(updatedFilters);
  }, [filters, loadCategories]);

  /**
   * Limpiar error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Refrescar datos
   */
  const refresh = useCallback(() => {
    loadCategories();
  }, [loadCategories]);

  // Cargar datos iniciales
  useEffect(() => {
    loadCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    pagination,
    filters,
    loadCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    updateFilters,
    clearError,
    refresh
  };
};

/**
 * Hook para obtener una categoría específica por ID
 */
export const useCategory = (id: number | null) => {
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCategory = useCallback(async (categoryId: number) => {
    try {
      setLoading(true);
      setError(null);

      const data = await categoryService.getCategoryById(categoryId);
      setCategory(data);
      
      logger.course('Category loaded:', data.name);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar categoría';
      setError(errorMessage);
      logger.error('Error loading category:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id) {
      loadCategory(id);
    } else {
      setCategory(null);
    }
  }, [id, loadCategory]);

  return {
    category,
    loading,
    error,
    reload: () => id && loadCategory(id)
  };
};

/**
 * Hook para obtener árbol de categorías
 */
export const useCategoryTree = (includeInactive = false) => {
  const [tree, setTree] = useState<CategoryTree[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTree = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await categoryService.getCategoryTree(includeInactive);
      setTree(data);
      
      logger.course('Category tree loaded:', { nodeCount: data.length });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar árbol de categorías';
      setError(errorMessage);
      logger.error('Error loading category tree:', err);
    } finally {
      setLoading(false);
    }
  }, [includeInactive]);

  useEffect(() => {
    loadTree();
  }, [loadTree]);

  return {
    tree,
    loading,
    error,
    reload: loadTree
  };
};

/**
 * Hook para estadísticas de categoría
 */
export const useCategoryStats = (id: number | null) => {
  const [stats, setStats] = useState<CategoryStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async (categoryId: number) => {
    try {
      setLoading(true);
      setError(null);

      const data = await categoryService.getCategoryStats(categoryId);
      setStats(data);
      
      logger.course('Category stats loaded:', { categoryId, totalCourses: data.totalCourses });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar estadísticas';
      setError(errorMessage);
      logger.error('Error loading category stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id) {
      loadStats(id);
    } else {
      setStats(null);
    }
  }, [id, loadStats]);

  return {
    stats,
    loading,
    error,
    reload: () => id && loadStats(id)
  };
};

/**
 * Hook para categorías populares
 */
export const usePopularCategories = (limit = 10) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPopularCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await categoryService.getPopularCategories(limit);
      setCategories(data);
      
      logger.course('Popular categories loaded:', { count: data.length });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar categorías populares';
      setError(errorMessage);
      logger.error('Error loading popular categories:', err);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    loadPopularCategories();
  }, [loadPopularCategories]);

  return {
    categories,
    loading,
    error,
    reload: loadPopularCategories
  };
};