import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from "@/shared/components/ui/Button/Button";

export const CoursesListPage: React.FC = () => {
  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Cursos
          </h1>
          <Link to="/courses/create">
            <Button variant="primary">
              Crear Curso
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Fundamentos de Ciberseguridad
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Aprende los conceptos básicos de la seguridad informática.
            </p>
            <Button variant="outline" size="sm">
              Ver Curso
            </Button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Ethical Hacking
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Técnicas de penetración ética y testing de seguridad.
            </p>
            <Button variant="outline" size="sm">
              Ver Curso
            </Button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Seguridad en Redes
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Protección y monitoreo de infraestructuras de red.
            </p>
            <Button variant="outline" size="sm">
              Ver Curso
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CoursesListPage;