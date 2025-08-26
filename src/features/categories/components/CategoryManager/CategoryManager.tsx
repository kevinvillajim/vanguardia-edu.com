import React, { useState, useCallback } from 'react';
import { useAdvancedMemo, useAdvancedCallback, withMemoization } from '../../../../shared/performance/MemoizationUtils';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  ChevronDown, 
  ChevronRight, 
  Eye, 
  EyeOff,
  BarChart3,
  GripVertical,
  Check,
  X,
  AlertCircle
} from 'lucide-react';
import { Button } from '../../../../components/ui/Button/Button';
import { useCategories, useCategoryTree } from '../../../../hooks/useCategories';
import { Category, CreateCategoryData, CategoryColor, CategoryIcon } from '../../../../domain/entities/Category';
import { logger } from '../../../../shared/utils/logger';

interface CategoryManagerProps {
  onCategorySelect?: (category: Category) => void;
  className?: string;
}

interface CategoryFormData extends Omit<CreateCategoryData, 'slug'> {
  id?: number;
  slug?: string;
}

const CategoryManagerComponent: React.FC<CategoryManagerProps> = ({
  onCategorySelect,
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showInactive, setShowInactive] = useState(false);

  // Hooks para datos
  const { 
    categories, 
    loading, 
    error, 
    createCategory, 
    updateCategory, 
    deleteCategory,
    clearError 
  } = useCategories({
    search: searchQuery,
    isActive: showInactive ? undefined : true
  });

  const { tree, loading: treeLoading } = useCategoryTree(showInactive);

  // Filtrado de categorías optimizado con memoización
  const filteredTree = useAdvancedMemo(() => {
    if (!searchQuery.trim()) return tree;

    const filterTree = (categories: any[]): any[] => {
      return categories.reduce((filtered, category) => {
        const matchesSearch = category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             category.description?.toLowerCase().includes(searchQuery.toLowerCase());
        
        const filteredChildren = category.children ? filterTree(category.children) : [];
        
        if (matchesSearch || filteredChildren.length > 0) {
          filtered.push({
            ...category,
            children: filteredChildren
          });
        }
        
        return filtered;
      }, []);
    };

    return filterTree(tree);
  }, [tree, searchQuery], {
    enableProfiling: import.meta.env.VITE_MODE === 'debugging',
    cacheKey: 'filteredTree',
    ttl: 30000 // 30 segundos
  });

  // Estado del formulario
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    parentId: undefined,
    color: CategoryColor.BLUE,
    icon: '',
    isActive: true,
    sortOrder: 0
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  /**
   * Alternar expansión de categoría - Optimizado con useAdvancedCallback
   */
  const toggleExpanded = useAdvancedCallback((categoryId: number) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  }, [], {
    enableProfiling: import.meta.env.VITE_MODE === 'debugging',
    cacheKey: 'toggleExpanded'
  });

  /**
   * Generar slug automáticamente del nombre - Memoizado
   */
  const generateSlug = useAdvancedCallback((name: string): string => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }, [], {
    enableProfiling: import.meta.env.VITE_MODE === 'debugging',
    cacheKey: 'generateSlug'
  });

  /**
   * Validar formulario - Optimizado con memoización
   */
  const validateForm = useAdvancedCallback((): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      errors.name = 'El nombre es requerido';
    } else if (formData.name.length < 2) {
      errors.name = 'El nombre debe tener al menos 2 caracteres';
    } else if (formData.name.length > 100) {
      errors.name = 'El nombre no puede exceder 100 caracteres';
    }

    if (formData.description && formData.description.length > 500) {
      errors.description = 'La descripción no puede exceder 500 caracteres';
    }

    if (formData.color && !/^#[0-9A-F]{6}$/i.test(formData.color)) {
      errors.color = 'El color debe ser un valor hexadecimal válido';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData], {
    enableProfiling: import.meta.env.VITE_MODE === 'debugging',
    cacheKey: 'validateForm'
  });

  /**
   * Manejar envío del formulario
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const slug = formData.slug || generateSlug(formData.name);
      const categoryData = {
        ...formData,
        slug,
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined
      };

      let result: Category | null;
      
      if (editingCategory) {
        result = await updateCategory({ 
          id: editingCategory.id, 
          ...categoryData 
        });
      } else {
        result = await createCategory(categoryData);
      }

      if (result) {
        resetForm();
        if (onCategorySelect) {
          onCategorySelect(result);
        }
      }
    } catch (error) {
      logger.error('Error saving category:', error);
    }
  };

  /**
   * Resetear formulario
   */
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      parentId: undefined,
      color: CategoryColor.BLUE,
      icon: '',
      isActive: true,
      sortOrder: 0
    });
    setFormErrors({});
    setShowForm(false);
    setEditingCategory(null);
  };

  /**
   * Iniciar edición
   */
  const startEdit = (category: Category) => {
    setFormData({
      name: category.name,
      description: category.description || '',
      parentId: category.parentId,
      color: category.color || CategoryColor.BLUE,
      icon: category.icon || '',
      isActive: category.isActive,
      sortOrder: category.sortOrder,
      slug: category.slug
    });
    setEditingCategory(category);
    setShowForm(true);
  };

  /**
   * Confirmar eliminación
   */
  const handleDelete = async (category: Category) => {
    if (!window.confirm(`¿Está seguro que desea eliminar la categoría "${category.name}"?`)) {
      return;
    }

    const success = await deleteCategory(category.id);
    if (success && selectedCategory?.id === category.id) {
      setSelectedCategory(null);
    }
  };

  /**
   * Renderizar ítem de categoría en árbol - Memoizado
   */
  const renderCategoryItem = useAdvancedCallback((category: any, level = 0) => {
    const isExpanded = expandedCategories.has(category.id);
    const hasChildren = category.children && category.children.length > 0;

    return (
      <div key={category.id} className="select-none">
        <div 
          className={`flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer ${
            selectedCategory?.id === category.id ? 'bg-blue-50 border border-blue-200' : ''
          }`}
          style={{ marginLeft: `${level * 20}px` }}
        >
          {hasChildren ? (
            <button
              onClick={() => toggleExpanded(category.id)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
            </button>
          ) : (
            <div className="w-6 h-6" />
          )}

          <div
            onClick={() => setSelectedCategory(category)}
            className="flex-1 flex items-center gap-3"
          >
            {category.color && (
              <div 
                className="w-4 h-4 rounded-full border border-gray-200"
                style={{ backgroundColor: category.color }}
              />
            )}
            
            {category.icon && (
              <span className="text-sm">{category.icon}</span>
            )}
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className={`font-medium ${!category.isActive ? 'text-gray-500' : ''}`}>
                  {category.name}
                </span>
                {!category.isActive && (
                  <EyeOff className="w-3 h-3 text-gray-400" />
                )}
                {category.courseCount !== undefined && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    {category.courseCount} cursos
                  </span>
                )}
              </div>
              {category.description && (
                <p className="text-xs text-gray-500 mt-1 truncate">
                  {category.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => startEdit(category)}
              className="p-1 hover:bg-blue-100 text-blue-600 rounded"
              title="Editar categoría"
            >
              <Edit className="w-3 h-3" />
            </button>
            
            <button
              onClick={() => handleDelete(category)}
              className="p-1 hover:bg-red-100 text-red-600 rounded"
              title="Eliminar categoría"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && hasChildren && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              {category.children.map((child: any) => 
                renderCategoryItem(child, level + 1)
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }, [expandedCategories, selectedCategory, editingCategory], {
    enableProfiling: import.meta.env.VITE_MODE === 'debugging',
    cacheKey: 'renderCategoryItem'
  });

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Administrar Categorías
          </h2>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowInactive(!showInactive)}
              leftIcon={showInactive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            >
              {showInactive ? 'Mostrar todas' : 'Solo activas'}
            </Button>
            
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowForm(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Nueva Categoría
            </Button>
          </div>
        </div>

        {/* Buscador */}
        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar categorías..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-700">{error}</span>
            <button 
              onClick={clearError}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Contenido Principal */}
      <div className="p-4">
        {(loading || treeLoading) ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Cargando categorías...</p>
          </div>
        ) : filteredTree.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <BarChart3 className="w-12 h-12 mx-auto" />
            </div>
            <p className="text-gray-500">No hay categorías creadas</p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowForm(true)}
              className="mt-4"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Crear primera categoría
            </Button>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredTree.map(category => renderCategoryItem(category))}
          </div>
        )}
      </div>

      {/* Modal de Formulario */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => resetForm()}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="border-b border-gray-200 p-4">
                <h3 className="text-lg font-semibold">
                  {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
                </h3>
              </div>

              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                {/* Nombre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Nombre de la categoría"
                  />
                  {formErrors.name && (
                    <p className="text-xs text-red-600 mt-1">{formErrors.name}</p>
                  )}
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                      formErrors.description ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Descripción opcional"
                  />
                  {formErrors.description && (
                    <p className="text-xs text-red-600 mt-1">{formErrors.description}</p>
                  )}
                </div>

                {/* Categoría padre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría Padre
                  </label>
                  <select
                    value={formData.parentId || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      parentId: e.target.value ? parseInt(e.target.value) : undefined 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Sin categoría padre</option>
                    {categories
                      .filter(cat => !editingCategory || cat.id !== editingCategory.id)
                      .map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))
                    }
                  </select>
                </div>

                {/* Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {Object.entries(CategoryColor).map(([key, value]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setFormData({ ...formData, color: value })}
                        className={`w-8 h-8 rounded-full border-2 ${
                          formData.color === value ? 'border-gray-800' : 'border-gray-200'
                        }`}
                        style={{ backgroundColor: value }}
                        title={key}
                      />
                    ))}
                  </div>
                </div>

                {/* Estado activo */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                    Categoría activa
                  </label>
                </div>

                {/* Botones */}
                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={resetForm}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-1"
                    disabled={loading}
                  >
                    {loading ? 'Guardando...' : editingCategory ? 'Actualizar' : 'Crear'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Optimizar con memoización avanzada
export const CategoryManager = withMemoization(CategoryManagerComponent, {
  compareProps: (prevProps, nextProps) => {
    return prevProps.onCategorySelect === nextProps.onCategorySelect &&
           prevProps.className === nextProps.className;
  },
  displayName: 'CategoryManager',
  enableProfiling: import.meta.env.VITE_MODE === 'debugging'
});

export default CategoryManager;