import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { courseService, CourseEnrollment } from '../../../services/courses/courseService';
import { userService, User } from '../../../services/user/userServiceV2';
import { useAuth } from '../../../contexts/AuthContext';
import { Button } from "@/shared/components/ui/Button/Button";
import { Card } from '../../../shared/components/ui/Card/Card';

export const CourseStudentsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [availableStudents, setAvailableStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignLoading, setAssignLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);

  const courseId = parseInt(id || '0');

  useEffect(() => {
    if (!hasRole('teacher') && !hasRole('admin')) {
      navigate('/unauthorized');
      return;
    }
    
    if (courseId) {
      loadCourseStudents();
      loadAvailableStudents();
    }
  }, [courseId]);

  const loadCourseStudents = async () => {
    try {
      const response = await courseService.getCourseStudents(courseId);
      setEnrollments(response.data);
    } catch (err: any) {
      setError(err.message || 'Error cargando estudiantes');
    }
  };

  const loadAvailableStudents = async () => {
    try {
      const response = await userService.getStudents();
      // Filtrar estudiantes que ya están inscritos
      const enrolledUserIds = enrollments.map(e => e.student.id);
      const available = response.data.filter(student => !enrolledUserIds.includes(student.id));
      setAvailableStudents(available);
    } catch (err: any) {
      console.error('Error loading students:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignStudent = async () => {
    if (!selectedStudent) return;

    setAssignLoading(true);
    try {
      await courseService.assignStudentToCourse(courseId, selectedStudent);
      await loadCourseStudents();
      await loadAvailableStudents();
      setShowAssignModal(false);
      setSelectedStudent(null);
    } catch (err: any) {
      setError(err.message || 'Error asignando estudiante');
    } finally {
      setAssignLoading(false);
    }
  };

  const handleRemoveStudent = async (userId: number) => {
    if (!confirm('¿Estás seguro de que quieres remover este estudiante del curso?')) {
      return;
    }

    try {
      await courseService.removeStudentFromCourse(courseId, userId);
      await loadCourseStudents();
      await loadAvailableStudents();
    } catch (err: any) {
      setError(err.message || 'Error removiendo estudiante');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Cargando estudiantes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => navigate('/teacher/courses')} variant="primary">
            Volver a mis cursos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Estudiantes</h1>
              <p className="text-gray-600 mt-1">Administra los estudiantes inscritos en tu curso</p>
            </div>
            
            <div className="flex gap-4">
              <Button
                onClick={() => setShowAssignModal(true)}
                variant="primary"
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                }
              >
                Asignar Estudiante
              </Button>
              
              <Button
                onClick={() => navigate('/teacher/courses')}
                variant="outline"
              >
                Volver a Mis Cursos
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Students List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Estudiantes Inscritos ({enrollments.length})
              </h2>
            </div>

            {enrollments.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay estudiantes inscritos
                </h3>
                <p className="text-gray-600 mb-4">
                  Asigna estudiantes a este curso para empezar a gestionar su progreso
                </p>
                <Button
                  onClick={() => setShowAssignModal(true)}
                  variant="primary"
                >
                  Asignar Primer Estudiante
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {enrollments.map((enrollment, index) => (
                  <motion.div
                    key={enrollment.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-6 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg font-semibold">
                          {enrollment.student.name.substring(0, 2).toUpperCase()}
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {enrollment.student.name}
                          </h3>
                          <p className="text-gray-600">{enrollment.student.email}</p>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                            <span>Inscrito: {formatDate(enrollment.enrolled_at)}</span>
                            {enrollment.completed_at && (
                              <span className="text-green-600">
                                Completado: {formatDate(enrollment.completed_at)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {Math.round(enrollment.progress_percentage)}%
                          </div>
                          <div className="text-xs text-gray-500">Progreso</div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            enrollment.status === 'completed' 
                              ? 'bg-green-100 text-green-800'
                              : enrollment.status === 'active'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {enrollment.status === 'completed' ? 'Completado' : 
                             enrollment.status === 'active' ? 'Activo' : 'Inactivo'}
                          </span>
                          
                          <Button
                            onClick={() => handleRemoveStudent(enrollment.student.id)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            Remover
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>

        {/* Assign Student Modal */}
        {showAssignModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Asignar Estudiante al Curso
              </h3>

              {availableStudents.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">
                    No hay estudiantes disponibles para asignar
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowAssignModal(false)}
                      variant="outline"
                      fullWidth
                    >
                      Cerrar
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Seleccionar Estudiante
                    </label>
                    <select
                      value={selectedStudent || ''}
                      onChange={(e) => setSelectedStudent(parseInt(e.target.value))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecciona un estudiante...</option>
                      {availableStudents.map(student => (
                        <option key={student.id} value={student.id}>
                          {student.name} ({student.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowAssignModal(false)}
                      variant="outline"
                      fullWidth
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleAssignStudent}
                      variant="primary"
                      fullWidth
                      loading={assignLoading}
                      disabled={!selectedStudent}
                    >
                      {assignLoading ? 'Asignando...' : 'Asignar'}
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseStudentsPage;