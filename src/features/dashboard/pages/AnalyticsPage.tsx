import React from 'react';
import { motion } from 'framer-motion';

export const AnalyticsPage: React.FC = () => {
  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Analytics
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Usuarios Activos
            </h3>
            <p className="text-3xl font-bold text-blue-600">1,234</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              +12% desde el mes pasado
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Cursos Completados
            </h3>
            <p className="text-3xl font-bold text-green-600">567</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              +8% desde el mes pasado
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Tiempo Promedio
            </h3>
            <p className="text-3xl font-bold text-purple-600">4.5h</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              -5% desde el mes pasado
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Próximamente: Gráficos Detallados
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Esta página contendrá análisis detallados del rendimiento de la plataforma.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AnalyticsPage;