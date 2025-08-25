import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CourseFilters as Filters } from '../../../../shared/types';
import { Button } from '../../../../components/ui/Button/Button';
// import { useResponsive } from '../../../hooks/useResponsive';
// import { useReducedMotion } from '../../../hooks/useAccessibility';

interface CourseFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  onSearch: (query: string) => void;
  className?: string;
}

const difficultyOptions = [
  { value: '', label: 'Todos los niveles' },
  { value: 'beginner', label: 'Principiante' },
  { value: 'intermediate', label: 'Intermedio' },
  { value: 'advanced', label: 'Avanzado' },
];

const sortOptions = [
  { value: '', label: 'Más recientes' },
  { value: 'popular', label: 'Más populares' },
  { value: 'rating', label: 'Mejor valorados' },
  { value: 'price_asc', label: 'Precio: menor a mayor' },
  { value: 'price_desc', label: 'Precio: mayor a menor' },
];

export const CourseFilters: React.FC<CourseFiltersProps> = ({
  filters,
  onFiltersChange,
  onSearch,
  className = ''
}) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 1024);
  const prefersReducedMotion = false; // Simplified for now
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState<Filters>(filters);

  const handleFilterChange = (key: keyof Filters, value: any) => {
    const newFilters = { ...localFilters, [key]: value === '' ? undefined : value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const clearFilters = () => {
    const clearedFilters: Filters = {};
    setLocalFilters(clearedFilters);
    setSearchQuery('');
    onFiltersChange(clearedFilters);
    onSearch('');
  };

  const hasActiveFilters = Object.values(localFilters).some(value => 
    value !== undefined && value !== '' && value !== null
  ) || searchQuery !== '';

  const containerClass = `
    bg-white rounded-xl shadow-sm border border-gray-100
    ${isMobile ? 'mx-4' : ''}
    ${className}
  `;

  return (
    <div className={containerClass}>
      {/* Search Bar */}
      <div className={`${isMobile ? 'p-4' : 'p-6'} border-b border-gray-100`}>
        <form onSubmit={handleSearch} className={`flex gap-3 ${isMobile ? 'flex-col' : 'flex-row'}`}>
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder={isMobile ? "Buscar cursos..." : "Buscar cursos por título, descripción o instructor..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-sm"
              />
            </div>
          </div>
          <Button 
            type="submit" 
            variant="primary"
            size={isMobile ? 'md' : 'md'}
            fullWidth={isMobile}
          >
            Buscar
          </Button>
        </form>
      </div>

      {/* Filter Toggle */}
      <div className={`${isMobile ? 'px-4 py-3' : 'px-6 py-4'} border-b border-gray-100`}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full text-left focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 rounded-lg p-2 -m-2"
          aria-expanded={isExpanded}
          aria-controls="advanced-filters"
        >
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
            </svg>
            <span className="font-medium text-gray-700">Filtros avanzados</span>
            {hasActiveFilters && (
              <span className="bg-[var(--color-primary)] text-white text-xs px-2 py-1 rounded-full">
                {Object.values(localFilters).filter(v => v !== undefined && v !== '').length + (searchQuery ? 1 : 0)}
              </span>
            )}
          </div>
          
          <motion.svg
            animate={prefersReducedMotion ? {} : { rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </motion.svg>
        </button>
      </div>

      {/* Expanded Filters */}
      <motion.div
        id="advanced-filters"
        initial={prefersReducedMotion ? {} : { height: 0 }}
        animate={prefersReducedMotion ? {} : { height: isExpanded ? 'auto' : 0 }}
        transition={{ duration: 0.3 }}
        className={`overflow-hidden ${isExpanded ? 'block' : 'hidden'}`}
      >
        <div className={`${isMobile ? 'p-4' : 'p-6'} space-y-6`}>
          <div className={`grid gap-6 ${
            isMobile ? 'grid-cols-1' : 
            isTablet ? 'grid-cols-2' : 
            'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
          }`}>
            {/* Difficulty Level */}
            <div>
              <label 
                htmlFor="difficulty-filter"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Nivel de dificultad
              </label>
              <select
                id="difficulty-filter"
                value={localFilters.difficulty_level || ''}
                onChange={(e) => handleFilterChange('difficulty_level', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-sm"
                aria-label="Filtrar por nivel de dificultad"
              >
                {difficultyOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label 
                htmlFor="sort-filter"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Ordenar por
              </label>
              <select
                id="sort-filter"
                value={localFilters.sort_by || ''}
                onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-sm"
                aria-label="Ordenar cursos por"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label 
                htmlFor="min-price-filter"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Precio mínimo
              </label>
              <input
                id="min-price-filter"
                type="number"
                min="0"
                step="0.01"
                placeholder="$0.00"
                value={localFilters.min_price || ''}
                onChange={(e) => handleFilterChange('min_price', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-sm"
                aria-label="Precio mínimo del curso"
              />
            </div>

            <div>
              <label 
                htmlFor="max-price-filter"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Precio máximo
              </label>
              <input
                id="max-price-filter"
                type="number"
                min="0"
                step="0.01"
                placeholder="$999.99"
                value={localFilters.max_price || ''}
                onChange={(e) => handleFilterChange('max_price', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-sm"
                aria-label="Precio máximo del curso"
              />
            </div>
          </div>

          {/* Quick Filters */}
          <div>
            <fieldset>
              <legend className="block text-sm font-medium text-gray-700 mb-3">
                Filtros rápidos
              </legend>
              <div className={`flex flex-wrap gap-2 ${isMobile ? 'grid grid-cols-2' : ''}`}>
                <Button
                  variant={localFilters.min_price === 0 && localFilters.max_price === 0 ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => handleFilterChange('min_price', 0)}
                >
                  Cursos gratuitos
                </Button>
                
                <Button
                  variant={localFilters.min_price && localFilters.min_price > 0 ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    handleFilterChange('min_price', 1);
                    handleFilterChange('max_price', undefined);
                  }}
                >
                  Cursos de pago
                </Button>

                <Button
                  variant={localFilters.sort_by === 'rating' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => handleFilterChange('sort_by', 'rating')}
                >
                  Mejor valorados
                </Button>

                <Button
                  variant={localFilters.sort_by === 'popular' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => handleFilterChange('sort_by', 'popular')}
                >
                  Más populares
                </Button>
              </div>
            </fieldset>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className={`flex ${isMobile ? 'justify-center' : 'justify-end'}`}>
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                }
              >
                Limpiar filtros
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default CourseFilters;