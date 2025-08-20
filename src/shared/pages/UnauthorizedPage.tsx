import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from "@/shared/components/ui/Button/Button";
import { USER_ROLES } from '../../utils/constants';

export const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const getDashboardRoute = (userRole: number): string => {
    switch (userRole) {
      case USER_ROLES.ADMIN:
        return '/admin/control';
      case USER_ROLES.TEACHER:
        return '/profesor/dashboard';
      case USER_ROLES.STUDENT:
        return '/user/dashboard';
      default:
        return '/dashboard';
    }
  };

  const handleGoHome = () => {
    if (user) {
      navigate(getDashboardRoute(user.role));
    } else {
      navigate('/auth/login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="mx-auto h-24 w-24 text-red-500">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Acceso Denegado
          </h2>
          <p className="text-gray-600 text-lg">
            No tienes permisos para acceder a esta página.
          </p>
          {user && (
            <p className="text-sm text-gray-500 mt-2">
              Rol actual: {user.role === USER_ROLES.ADMIN ? 'Administrador' : 
                        user.role === USER_ROLES.TEACHER ? 'Profesor' : 
                        user.role === USER_ROLES.STUDENT ? 'Estudiante' : 'Desconocido'}
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <Button 
            variant="primary" 
            size="lg" 
            fullWidth
            onClick={handleGoHome}
          >
            {user ? 'Ir al Dashboard' : 'Iniciar Sesión'}
          </Button>
          
          <button
            onClick={() => navigate(-1)}
            className="w-full text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            ← Volver atrás
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default UnauthorizedPage;