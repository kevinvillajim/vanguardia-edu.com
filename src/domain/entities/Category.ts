import { BaseEntity } from '../../shared/types';

/**
 * Entidad Category - Representa una categoría de cursos
 * 
 * Estructura jerárquica:
 * Category (parent) → Category (children) → Courses
 */
export interface Category extends BaseEntity {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string; // Color hex para la UI
  parentId?: number; // Para categorías jerárquicas
  parent?: Category;
  children?: Category[];
  isActive: boolean;
  sortOrder: number;
  courseCount?: number; // Número de cursos en esta categoría
}

/**
 * Datos para crear una nueva categoría
 */
export interface CreateCategoryData {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  parentId?: number;
  isActive?: boolean;
  sortOrder?: number;
}

/**
 * Datos para actualizar una categoría existente
 */
export interface UpdateCategoryData extends Partial<CreateCategoryData> {
  id: number;
}

/**
 * Filtros para buscar categorías
 */
export interface CategoryFilters {
  search?: string;
  parentId?: number | null; // null para categorías raíz
  isActive?: boolean;
  includeChildren?: boolean;
  includeCourseCounts?: boolean;
  sortBy?: 'name' | 'sortOrder' | 'courseCount' | 'createdAt';
  sortDirection?: 'asc' | 'desc';
}

/**
 * Estadísticas de una categoría
 */
export interface CategoryStats {
  categoryId: number;
  totalCourses: number;
  publishedCourses: number;
  totalEnrollments: number;
  averageRating: number;
  popularCourses: Array<{
    id: number;
    title: string;
    enrollmentCount: number;
  }>;
}

/**
 * Estructura de árbol para mostrar categorías jerárquicamente
 */
export interface CategoryTree extends Category {
  children: CategoryTree[];
  level: number; // Profundidad en el árbol (0 = raíz)
  hasChildren: boolean;
}

/**
 * Datos para reordenar categorías
 */
export interface CategoryReorderData {
  categoryId: number;
  newSortOrder: number;
  newParentId?: number;
}

/**
 * Enum para tipos de iconos predefinidos
 */
export enum CategoryIcon {
  DEVELOPMENT = 'code',
  DESIGN = 'palette',
  BUSINESS = 'briefcase',
  MARKETING = 'megaphone',
  TECHNOLOGY = 'computer',
  SCIENCE = 'flask',
  ARTS = 'image',
  HEALTH = 'heart',
  EDUCATION = 'book',
  LANGUAGE = 'globe',
  MUSIC = 'music',
  SPORTS = 'activity',
  COOKING = 'utensils',
  PHOTOGRAPHY = 'camera',
  WRITING = 'pen-tool'
}

/**
 * Enum para colores predefinidos de categorías
 */
export enum CategoryColor {
  BLUE = '#3B82F6',
  GREEN = '#10B981',
  PURPLE = '#8B5CF6', 
  RED = '#EF4444',
  YELLOW = '#F59E0B',
  INDIGO = '#6366F1',
  PINK = '#EC4899',
  GRAY = '#6B7280',
  TEAL = '#14B8A6',
  ORANGE = '#F97316'
}