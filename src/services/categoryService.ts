import { CategoryRepository } from '../infrastructure/repositories/CategoryRepository';
import { 
  Category, 
  CreateCategoryData, 
  UpdateCategoryData, 
  CategoryFilters,
  CategoryStats,
  CategoryTree,
  CategoryReorderData
} from '../domain/entities/Category';
import { PaginatedResponse } from '../shared/types';
import { logger } from '../shared/utils/logger';
import { CategoryValidator } from '../shared/validation';

/**
 * Service de categorías - Capa de aplicación para lógica de negocio
 */
class CategoryService {
  private repository = new CategoryRepository();

  /**
   * Obtener todas las categorías
   */
  async getCategories(filters?: CategoryFilters): Promise<PaginatedResponse<Category>> {
    try {
      return await this.repository.getCategories(filters);
    } catch (error) {
      logger.error('CategoryService: Error getting categories', error);
      throw error;
    }
  }

  /**
   * Obtener categoría por ID
   */
  async getCategoryById(id: number): Promise<Category> {
    try {
      return await this.repository.getCategoryById(id);
    } catch (error) {
      logger.error('CategoryService: Error getting category by ID', error);
      throw error;
    }
  }

  /**
   * Obtener estructura de árbol
   */
  async getCategoryTree(includeInactive = false): Promise<CategoryTree[]> {
    try {
      return await this.repository.getCategoryTree(includeInactive);
    } catch (error) {
      logger.error('CategoryService: Error getting category tree', error);
      throw error;
    }
  }

  /**
   * Crear nueva categoría
   */
  async createCategory(data: CreateCategoryData, userRole?: 'teacher' | 'admin'): Promise<Category> {
    try {
      logger.debug('🔍 Creating category with data:', data, 'Role:', userRole);
      
      // Validaciones de negocio usando el sistema centralizado
      const validationResult = CategoryValidator.validate(data);
      if (!validationResult.isValid) {
        const firstError = validationResult.errors[0];
        logger.warn('❌ Category validation failed:', validationResult.fieldErrors);
        throw new Error(firstError);
      }
      
      // Generar slug si no se proporciona
      if (!data.slug) {
        data.slug = this.generateSlug(data.name);
        logger.debug('🏷️ Generated slug:', data.slug);
      }

      // Validar que el slug sea único
      const isSlugAvailable = await this.repository.validateSlug(data.slug);
      if (!isSlugAvailable) {
        throw new Error(`El slug "${data.slug}" ya está en uso`);
      }

      const category = await this.repository.createCategory(data, userRole);
      logger.success('✅ Category created successfully:', category.name);
      return category;
    } catch (error) {
      logger.error('CategoryService: Error creating category', error);
      throw error;
    }
  }

  /**
   * Actualizar categoría
   */
  async updateCategory(data: UpdateCategoryData): Promise<Category> {
    try {
      logger.debug('🔄 Updating category:', data.id);
      
      // Validaciones de negocio usando el sistema centralizado
      if (data.name || data.slug || data.description || data.color) {
        const validationResult = CategoryValidator.validate(data as CreateCategoryData);
        if (!validationResult.isValid) {
          const firstError = validationResult.errors[0];
          logger.warn('❌ Category update validation failed:', validationResult.fieldErrors);
          throw new Error(firstError);
        }
      }

      // Validar slug si se está cambiando
      if (data.slug) {
        const isSlugAvailable = await this.repository.validateSlug(data.slug, data.id);
        if (!isSlugAvailable) {
          throw new Error(`El slug "${data.slug}" ya está en uso`);
        }
      }

      // Validar que no se asigne como padre a sí misma o a sus descendientes
      if (data.parentId) {
        await this.validateParentAssignment(data.id, data.parentId);
      }

      const category = await this.repository.updateCategory(data);
      logger.success('✅ Category updated successfully:', category.name);
      return category;
    } catch (error) {
      logger.error('CategoryService: Error updating category', error);
      throw error;
    }
  }

  /**
   * Eliminar categoría
   */
  async deleteCategory(id: number): Promise<void> {
    try {
      // Verificar que no tenga cursos asignados
      const stats = await this.repository.getCategoryStats(id);
      if (stats.totalCourses > 0) {
        throw new Error(`No se puede eliminar la categoría porque tiene ${stats.totalCourses} cursos asignados`);
      }

      // Verificar que no tenga subcategorías
      const subcategories = await this.repository.getSubcategories(id);
      if (subcategories.length > 0) {
        throw new Error(`No se puede eliminar la categoría porque tiene ${subcategories.length} subcategorías`);
      }

      await this.repository.deleteCategory(id);
    } catch (error) {
      logger.error('CategoryService: Error deleting category', error);
      throw error;
    }
  }

  /**
   * Reordenar categorías
   */
  async reorderCategories(reorderData: CategoryReorderData[]): Promise<void> {
    try {
      // Validar que los datos de reorden sean consistentes
      this.validateReorderData(reorderData);
      
      await this.repository.reorderCategories(reorderData);
    } catch (error) {
      logger.error('CategoryService: Error reordering categories', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de categoría
   */
  async getCategoryStats(id: number): Promise<CategoryStats> {
    try {
      return await this.repository.getCategoryStats(id);
    } catch (error) {
      logger.error('CategoryService: Error getting category stats', error);
      throw error;
    }
  }

  /**
   * Obtener categorías populares
   */
  async getPopularCategories(limit = 10): Promise<Category[]> {
    try {
      return await this.repository.getPopularCategories(limit);
    } catch (error) {
      logger.error('CategoryService: Error getting popular categories', error);
      throw error;
    }
  }

  /**
   * Obtener categorías sugeridas
   */
  async getSuggestedCategories(userId?: number): Promise<Category[]> {
    try {
      return await this.repository.getSuggestedCategories(userId);
    } catch (error) {
      logger.error('CategoryService: Error getting suggested categories', error);
      throw error;
    }
  }

  /**
   * Generar slug a partir del nombre
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remover acentos
      .replace(/[^a-z0-9\s-]/g, '') // Solo letras, números, espacios y guiones
      .replace(/\s+/g, '-') // Reemplazar espacios con guiones
      .replace(/-+/g, '-') // Reemplazar múltiples guiones con uno solo
      .replace(/^-|-$/g, ''); // Remover guiones al inicio y final
  }

  // Método eliminado - ahora se usa CategoryValidator del sistema centralizado

  /**
   * Validar asignación de padre
   */
  private async validateParentAssignment(categoryId: number, parentId: number): Promise<void> {
    if (categoryId === parentId) {
      throw new Error('Una categoría no puede ser padre de sí misma');
    }

    // TODO: Implementar validación de ciclos en la jerarquía
    // Esto requiere obtener toda la cadena de ancestros del parentId
    // y verificar que categoryId no esté en ella
  }

  /**
   * Validar datos de reorden
   */
  private validateReorderData(reorderData: CategoryReorderData[]): void {
    const categoryIds = new Set<number>();
    
    for (const item of reorderData) {
      if (categoryIds.has(item.categoryId)) {
        throw new Error(`ID de categoría duplicado en datos de reorden: ${item.categoryId}`);
      }
      categoryIds.add(item.categoryId);

      if (item.newSortOrder < 0) {
        throw new Error('El orden no puede ser negativo');
      }

      if (item.newParentId === item.categoryId) {
        throw new Error('Una categoría no puede ser padre de sí misma');
      }
    }
  }

  // Métodos eliminados - ahora se usan las validaciones centralizadas en ValidationRules
}

export const categoryService = new CategoryService();