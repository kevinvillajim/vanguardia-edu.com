import { ICategoryRepository } from '../../domain/repositories/ICategoryRepository';
import { 
  Category, 
  CreateCategoryData, 
  UpdateCategoryData, 
  CategoryFilters,
  CategoryStats,
  CategoryTree,
  CategoryReorderData
} from '../../domain/entities/Category';
import { PaginatedResponse } from '../../shared/types';
import { apiClient } from '../api/ApiClient';
import { ENDPOINTS, buildUrl } from '../api/endpoints';
import { logger } from '../../shared/utils/logger';

export class CategoryRepository implements ICategoryRepository {
  
  async getCategories(filters?: CategoryFilters): Promise<PaginatedResponse<Category>> {
    const url = buildUrl(ENDPOINTS.CATEGORIES.LIST, filters);
    const response = await apiClient.get<PaginatedResponse<Category>>(url);
    logger.course('Categories retrieved:', { count: response.data.length, filters });
    return response;
  }

  async getCategoryById(id: number): Promise<Category> {
    const response = await apiClient.get<{ data: Category }>(ENDPOINTS.CATEGORIES.GET(id));
    logger.course('Category retrieved by ID:', { id, name: response.data.name });
    return response.data;
  }

  async getCategoryBySlug(slug: string): Promise<Category> {
    const url = buildUrl(ENDPOINTS.CATEGORIES.LIST, { slug });
    const response = await apiClient.get<{ data: Category }>(url);
    logger.course('Category retrieved by slug:', { slug, name: response.data.name });
    return response.data;
  }

  async getCategoryTree(includeInactive?: boolean): Promise<CategoryTree[]> {
    const url = buildUrl(ENDPOINTS.CATEGORIES.TREE, { includeInactive });
    const response = await apiClient.get<{ data: CategoryTree[] }>(url);
    logger.course('Category tree retrieved:', { nodeCount: response.data.length });
    return response.data;
  }

  async getRootCategories(): Promise<Category[]> {
    const url = buildUrl(ENDPOINTS.CATEGORIES.LIST, { parentId: null });
    const response = await apiClient.get<{ data: Category[] }>(url);
    logger.course('Root categories retrieved:', { count: response.data.length });
    return response.data;
  }

  async getSubcategories(parentId: number): Promise<Category[]> {
    const url = buildUrl(ENDPOINTS.CATEGORIES.LIST, { parentId });
    const response = await apiClient.get<{ data: Category[] }>(url);
    logger.course('Subcategories retrieved:', { parentId, count: response.data.length });
    return response.data;
  }

  async createCategory(data: CreateCategoryData, userRole?: 'teacher' | 'admin'): Promise<Category> {
    // Mapear datos del frontend al formato esperado por el backend
    const backendData = {
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      icon: data.icon || null,
      color: data.color || null,
      parent_id: data.parentId || null,
      is_active: data.isActive ?? true,
      sort_order: data.sortOrder ?? 0
    };

    // Seleccionar endpoint apropiado según el rol
    const endpoint = userRole === 'teacher' 
      ? ENDPOINTS.CATEGORIES.TEACHER_CREATE 
      : ENDPOINTS.CATEGORIES.ADMIN_CREATE;

    try {
      logger.course('Creating category:', data.name, 'Role:', userRole);
      const response = await apiClient.post<{ data: Category }>(endpoint, backendData);
      logger.success('Category created successfully:', { id: response.data.id, name: response.data.name });
      return response.data;
    } catch (error) {
      logger.error('Error creating category:', error);
      throw error;
    }
  }

  async updateCategory(data: UpdateCategoryData): Promise<Category> {
    // Mapear datos del frontend al formato esperado por el backend
    const backendData: any = {};
    
    if (data.name !== undefined) backendData.name = data.name;
    if (data.slug !== undefined) backendData.slug = data.slug;
    if (data.description !== undefined) backendData.description = data.description;
    if (data.icon !== undefined) backendData.icon = data.icon;
    if (data.color !== undefined) backendData.color = data.color;
    if (data.parentId !== undefined) backendData.parent_id = data.parentId;
    if (data.isActive !== undefined) backendData.is_active = data.isActive;
    if (data.sortOrder !== undefined) backendData.sort_order = data.sortOrder;

    try {
      logger.course('Updating category:', { id: data.id, name: data.name });
      const response = await apiClient.put<{ data: Category }>(ENDPOINTS.CATEGORIES.UPDATE(data.id), backendData);
      logger.success('Category updated successfully:', { id: response.data.id, name: response.data.name });
      return response.data;
    } catch (error) {
      logger.error('Error updating category:', error);
      throw error;
    }
  }

  async deleteCategory(id: number): Promise<void> {
    try {
      logger.course('Deleting category:', { id });
      await apiClient.delete(ENDPOINTS.CATEGORIES.DELETE(id));
      logger.success('Category deleted successfully:', { id });
    } catch (error) {
      logger.error('Error deleting category:', error);
      throw error;
    }
  }

  async reorderCategories(reorderData: CategoryReorderData[]): Promise<void> {
    // Mapear al formato esperado por el backend
    const backendData = reorderData.map(item => ({
      category_id: item.categoryId,
      new_sort_order: item.newSortOrder,
      new_parent_id: item.newParentId || null
    }));

    try {
      logger.course('Reordering categories:', { count: reorderData.length });
      await apiClient.post(ENDPOINTS.CATEGORIES.REORDER, { categories: backendData });
      logger.success('Categories reordered successfully');
    } catch (error) {
      logger.error('Error reordering categories:', error);
      throw error;
    }
  }

  async getCategoryStats(id: number): Promise<CategoryStats> {
    try {
      const response = await apiClient.get<{ data: CategoryStats }>(ENDPOINTS.CATEGORIES.STATS(id));
      logger.course('Category stats retrieved:', { categoryId: id, totalCourses: response.data.totalCourses });
      return response.data;
    } catch (error) {
      logger.error('Error getting category stats:', error);
      throw error;
    }
  }

  async validateSlug(slug: string, excludeId?: number): Promise<boolean> {
    try {
      const params: any = { validateSlug: slug };
      if (excludeId) params.excludeId = excludeId;
      
      const url = buildUrl(ENDPOINTS.CATEGORIES.LIST, params);
      const response = await apiClient.get<{ success: boolean; available: boolean }>(url);
      
      logger.debug('🔍 Slug validation response:', { slug, available: response.available });
      return response.available;
    } catch (error) {
      logger.error('Error validating slug:', error);
      return false;
    }
  }

  async getPopularCategories(limit: number = 10): Promise<Category[]> {
    const url = buildUrl(ENDPOINTS.CATEGORIES.LIST, { 
      sortBy: 'courseCount', 
      sortDirection: 'desc',
      limit,
      includeCourseCounts: true 
    });
    
    const response = await apiClient.get<{ data: Category[] }>(url);
    logger.course('Popular categories retrieved:', { count: response.data.length });
    return response.data;
  }

  async getSuggestedCategories(userId?: number): Promise<Category[]> {
    const params = userId ? { suggestedFor: userId } : {};
    const url = buildUrl(ENDPOINTS.CATEGORIES.LIST, params);
    
    const response = await apiClient.get<{ data: Category[] }>(url);
    logger.course('Suggested categories retrieved:', { count: response.data.length, userId });
    return response.data;
  }
}