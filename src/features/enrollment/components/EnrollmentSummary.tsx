import React from 'react';
import { Course } from '../../../services/courses/courseService';

interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

interface PricingDetails {
  original_price: number;
  discount_amount: number;
  final_price: number;
  coupon_applied?: {
    code: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
  };
}

interface EnrollmentSummaryProps {
  course: Course;
  pricingDetails: PricingDetails;
  user: User;
}

const difficultyLabels = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
};

const difficultyColors = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-red-100 text-red-800',
};

export const EnrollmentSummary: React.FC<EnrollmentSummaryProps> = ({
  course,
  pricingDetails,
  user
}) => {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) return `${mins}min`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}min`;
  };

  return (
    <div className="space-y-6">
      {/* Course Information */}
      <div className="flex gap-4">
        {course.banner_image ? (
          <img
            src={course.banner_image}
            alt={course.title}
            className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
          />
        ) : (
          <div className="w-24 h-24 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] rounded-lg flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {course.title.substring(0, 2).toUpperCase()}
          </div>
        )}
        
        <div className="flex-1">
          <h3 className="font-bold text-lg text-gray-900 mb-2">{course.title}</h3>
          
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-2">
            <span className={`px-2 py-1 rounded-full text-xs ${difficultyColors[course.difficulty_level]}`}>
              {difficultyLabels[course.difficulty_level]}
            </span>
            
            {course.total_lessons && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                {course.total_lessons} lecciones
              </span>
            )}
            
            {course.duration_hours && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formatDuration(course.duration_hours * 60)}
              </span>
            )}
            
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <span>{course.rating}</span>
            </span>
          </div>
          
          <p className="text-sm text-gray-600 line-clamp-2">
            {course.description}
          </p>
        </div>
      </div>

      {/* Student Information */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Información del Estudiante</h4>
        
        <div className="flex items-center gap-3">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center font-bold">
              {user.name.substring(0, 2).toUpperCase()}
            </div>
          )}
          
          <div>
            <p className="font-medium text-gray-900">{user.name}</p>
            <p className="text-sm text-gray-600">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Course Benefits */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Lo que incluye este curso:</h4>
        
        <div className="space-y-2 text-sm">
          {[
            'Acceso de por vida al contenido',
            'Certificado de finalización',
            'Soporte del instructor',
            'Acceso móvil y desktop',
            'Actualizaciones gratuitas del contenido',
            'Comunidad de estudiantes',
            'Garantía de satisfacción de 30 días'
          ].map((benefit, index) => (
            <div key={index} className="flex items-center gap-3">
              <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700">{benefit}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Breakdown */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Resumen de Pago</h4>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Precio del curso:</span>
            <span className="font-medium">
              ${pricingDetails.original_price.toFixed(2)}
            </span>
          </div>
          
          {pricingDetails.discount_amount > 0 && (
            <>
              <div className="flex justify-between items-center text-green-600">
                <span>Descuento aplicado:</span>
                <span className="font-medium">
                  -${pricingDetails.discount_amount.toFixed(2)}
                </span>
              </div>
              
              {pricingDetails.coupon_applied && (
                <div className="text-xs text-gray-500">
                  Cupón: {pricingDetails.coupon_applied.code}
                </div>
              )}
            </>
          )}
          
          <hr className="my-2" />
          
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Total:</span>
            <span className={`${pricingDetails.final_price === 0 ? 'text-green-600' : 'text-[var(--color-primary)]'}`}>
              {pricingDetails.final_price === 0 ? 'GRATIS' : `$${pricingDetails.final_price.toFixed(2)}`}
            </span>
          </div>
          
          {pricingDetails.final_price > 0 && (
            <p className="text-xs text-gray-500 mt-2">
              * Los precios incluyen todos los impuestos aplicables
            </p>
          )}
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="text-xs text-gray-500 space-y-2">
        <p>
          Al proceder con la inscripción, aceptas nuestros{' '}
          <a href="/terms" className="text-[var(--color-primary)] hover:underline">
            Términos y Condiciones
          </a>{' '}
          y{' '}
          <a href="/privacy" className="text-[var(--color-primary)] hover:underline">
            Política de Privacidad
          </a>.
        </p>
        
        {pricingDetails.final_price > 0 && (
          <p>
            Tienes 30 días para solicitar un reembolso completo si no estás satisfecho con el curso.
          </p>
        )}
      </div>
    </div>
  );
};