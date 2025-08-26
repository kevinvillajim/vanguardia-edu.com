import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CategoryManager } from '../../features/categories/components/CategoryManager/CategoryManager';
import { Category } from '../../domain/entities/Category';
import { useCategoryStats } from '../../hooks/useCategories';
import { BarChart3, TrendingUp, Users, BookOpen } from 'lucide-react';

const CategoriesPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  
  // Estadísticas de la categoría seleccionada
  const { stats, loading: statsLoading } = useCategoryStats(selectedCategory?.id || null);

  /**
   * Renderizar estadísticas de categoría
   */
  const renderCategoryStats = () => {
    if (!selectedCategory) {
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center text-gray-500">
            <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Selecciona una categoría para ver sus estadísticas</p>
          </div>
        </div>
      );
    }

    if (statsLoading) {
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              <div className="h-3 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          {selectedCategory.color && (
            <div 
              className="w-4 h-4 rounded-full border border-gray-200"
              style={{ backgroundColor: selectedCategory.color }}
            />
          )}
          <h3 className="text-lg font-semibold text-gray-900">
            {selectedCategory.name}
          </h3>
          {!selectedCategory.isActive && (
            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
              Inactiva
            </span>
          )}
        </div>

        {selectedCategory.description && (
          <p className="text-gray-600 mb-6">{selectedCategory.description}</p>
        )}

        {stats && (
          <>
            {/* Métricas principales */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Total Cursos</span>
                </div>
                <p className="text-2xl font-bold text-blue-900 mt-1">
                  {stats.totalCourses}
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-900">Publicados</span>
                </div>
                <p className="text-2xl font-bold text-green-900 mt-1">
                  {stats.publishedCourses}
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-purple-900">Inscripciones</span>
                </div>
                <p className="text-2xl font-bold text-purple-900 mt-1">
                  {stats.totalEnrollments.toLocaleString()}
                </p>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-900">Rating Prom.</span>
                </div>
                <p className="text-2xl font-bold text-yellow-900 mt-1">
                  {stats.averageRating ? stats.averageRating.toFixed(1) : 'N/A'}
                </p>
              </div>
            </div>

            {/* Cursos populares */}
            {stats.popularCourses && stats.popularCourses.length > 0 && (
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">
                  Cursos más populares
                </h4>
                <div className="space-y-2">
                  {stats.popularCourses.slice(0, 5).map((course, index) => (
                    <div 
                      key={course.id} 
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </div>
                        <span className="font-medium text-gray-900">{course.title}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {course.enrollmentCount.toLocaleString()} inscripciones
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                Administración de Categorías
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Gestiona las categorías de cursos del sistema
              </p>
            </div>
          </div>
        </motion.div>

        {/* Contenido Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel de administración */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <CategoryManager 
              onCategorySelect={setSelectedCategory}
              className="h-fit"
            />
          </motion.div>

          {/* Panel de estadísticas */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            {renderCategoryStats()}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;