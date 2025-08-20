import React from 'react';

const CourseGrades: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Mis Calificaciones
          </h1>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Sistema de Calificaciones
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Aquí podrás ver todas tus calificaciones, promedios y progreso académico.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                🚧 Esta sección estará disponible próximamente con el nuevo sistema de cursos interactivos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseGrades;