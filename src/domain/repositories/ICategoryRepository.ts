import { PaginatedResponse } from '../../shared/types';
import { 
  Category, 
  CreateCategoryData, 
  UpdateCategoryData, 
  CategoryFilters,
  CategoryStats,
  CategoryTree,
  CategoryReorderData
} from '../entities/Category';

/**
 * Interfaz del repositorio de categorías
 * Define todas las operaciones disponibles para gestionar categorías
 */
export interface ICategoryRepository {
  /**
   * Obtener todas las categorías con filtros opcionales
   */
  getCategories(filters?: CategoryFilters): Promise<PaginatedResponse<Category>>;

  /**
   * Obtener una categoría por ID
   */
  getCategoryById(id: number): Promise<Category>;

  /**
   * Obtener categoría por slug
   */
  getCategoryBySlug(slug: string): Promise<Category>;

  /**
   * Obtener estructura de árbol de categorías
   */
  getCategoryTree(includeInactive?: boolean): Promise<CategoryTree[]>;

  /**
   * Obtener categorías raíz (sin padre)
   */
  getRootCategories(): Promise<Category[]>;

  /**
   * Obtener subcategorías de una categoría padre
   */
  getSubcategories(parentId: number): Promise<Category[]>;

  /**
   * Crear nueva categoría
   */
  createCategory(data: CreateCategoryData): Promise<Category>;

  /**
   * Actualizar categoría existente
   */
  updateCategory(data: UpdateCategoryData): Promise<Category>;

  /**
   * Eliminar categoría
   */
  deleteCategory(id: number): Promise<void>;

  /**
   * Reordenar categorías
   */
  reorderCategories(reorderData: CategoryReorderData[]): Promise<void>;

  /**
   * Obtener estadísticas de una categoría
   */
  getCategoryStats(id: number): Promise<CategoryStats>;

  /**
   * Validar si un slug está disponible
   */
  validateSlug(slug: string, excludeId?: number): Promise<boolean>;

  /**
   * Obtener categorías populares (por número de cursos o inscripciones)
   */
  getPopularCategories(limit?: number): Promise<Category[]>;

  /**
   * Obtener categorías sugeridas para un usuario
   */
  getSuggestedCategories(userId?: number): Promise<Category[]>;
}