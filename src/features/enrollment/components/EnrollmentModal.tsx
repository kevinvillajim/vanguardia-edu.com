import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Course } from '../../../services/courses/courseService';
import { enrollmentService, EnrollmentData } from '../../../services/enrollment/enrollmentService';
import { useAuth } from '../../../contexts/AuthContext';
import { PaymentForm } from './PaymentForm';
import { CouponInput } from './CouponInput';
import { EnrollmentSummary } from './EnrollmentSummary';
import { Button } from "@/shared/components/ui/Button/Button";
import { Card } from '../../../shared/components/ui/Card/Card';

interface EnrollmentModalProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (enrollmentId: number) => void;
}

type EnrollmentStep = 'summary' | 'payment' | 'processing' | 'success' | 'error';

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

export const EnrollmentModal: React.FC<EnrollmentModalProps> = ({
  course,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { user, isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState<EnrollmentStep>('summary');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enrollmentData, setEnrollmentData] = useState<EnrollmentData>({
    course_id: course.id,
    payment_method: course.price === 0 ? 'free' : 'card'
  });
  const [pricingDetails, setPricingDetails] = useState<PricingDetails>({
    original_price: course.price,
    discount_amount: 0,
    final_price: course.price
  });

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setCurrentStep('summary');
      setError(null);
      setPricingDetails({
        original_price: course.price,
        discount_amount: 0,
        final_price: course.price
      });
    }
  }, [isOpen, course.price]);

  if (!isAuthenticated) {
    return null;
  }

  const handleCouponApplied = (couponData: any) => {
    setPricingDetails({
      original_price: couponData.original_price,
      discount_amount: couponData.original_price - couponData.final_price,
      final_price: couponData.final_price,
      coupon_applied: {
        code: couponData.coupon_details.code,
        discount_type: couponData.discount_type,
        discount_value: couponData.discount_value
      }
    });
    setEnrollmentData(prev => ({ ...prev, coupon_code: couponData.coupon_details.code }));
  };

  const handlePaymentMethodChange = (method: 'free' | 'card' | 'paypal') => {
    setEnrollmentData(prev => ({ ...prev, payment_method: method }));
  };

  const handlePaymentDetailsChange = (details: any) => {
    setEnrollmentData(prev => ({ ...prev, payment_details: details }));
  };

  const handleEnrollment = async () => {
    setLoading(true);
    setError(null);
    setCurrentStep('processing');

    try {
      let response;

      if (pricingDetails.final_price === 0) {
        // Inscripción gratuita
        response = await enrollmentService.enrollInCourse({
          course_id: course.id,
          payment_method: 'free',
          coupon_code: enrollmentData.coupon_code
        });
      } else {
        // Inscripción de pago
        const paymentResponse = await enrollmentService.processPayment({
          course_id: course.id,
          payment_method: enrollmentData.payment_method!,
          payment_details: enrollmentData.payment_details,
          coupon_code: enrollmentData.coupon_code
        });

        if (paymentResponse.status === 'success') {
          response = { id: paymentResponse.enrollment_id! };
        } else if (paymentResponse.status === 'pending' && paymentResponse.redirect_url) {
          // Redirigir a página de pago externa (PayPal, etc.)
          window.location.href = paymentResponse.redirect_url;
          return;
        } else {
          throw new Error(paymentResponse.error_message || 'Error procesando el pago');
        }
      }

      setCurrentStep('success');
      setTimeout(() => {
        onSuccess(response.id);
        onClose();
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Error durante la inscripción');
      setCurrentStep('error');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'summary':
        return (
          <div className="space-y-6">
            <EnrollmentSummary
              course={course}
              pricingDetails={pricingDetails}
              user={user!}
            />

            {course.price > 0 && (
              <CouponInput
                courseId={course.id}
                onCouponApplied={handleCouponApplied}
                onError={setError}
              />
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                fullWidth
              >
                Cancelar
              </Button>
              
              <Button
                variant="primary"
                onClick={() => {
                  if (pricingDetails.final_price === 0) {
                    handleEnrollment();
                  } else {
                    setCurrentStep('payment');
                  }
                }}
                fullWidth
              >
                {pricingDetails.final_price === 0 ? 'Inscribirse Gratis' : 'Continuar al Pago'}
              </Button>
            </div>
          </div>
        );

      case 'payment':
        return (
          <div className="space-y-6">
            <div className="text-center pb-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Información de Pago</h3>
              <p className="text-sm text-gray-600 mt-1">
                Total a pagar: <span className="font-bold text-[var(--color-primary)]">
                  ${pricingDetails.final_price.toFixed(2)}
                </span>
              </p>
            </div>

            <PaymentForm
              amount={pricingDetails.final_price}
              onPaymentMethodChange={handlePaymentMethodChange}
              onPaymentDetailsChange={handlePaymentDetailsChange}
              selectedMethod={enrollmentData.payment_method!}
            />

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setCurrentStep('summary')}
                fullWidth
              >
                Volver
              </Button>
              
              <Button
                variant="primary"
                onClick={handleEnrollment}
                loading={loading}
                fullWidth
              >
                Completar Inscripción
              </Button>
            </div>
          </div>
        );

      case 'processing':
        return (
          <div className="text-center py-12">
            <div className="animate-spin w-16 h-16 border-4 border-[var(--color-primary)] border-t-transparent rounded-full mx-auto mb-6"></div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Procesando Inscripción
            </h3>
            <p className="text-gray-600">
              Por favor espera mientras procesamos tu inscripción...
            </p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center py-12">
            <div className="text-6xl mb-6">🎉</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              ¡Inscripción Exitosa!
            </h3>
            <p className="text-gray-600 mb-6">
              Te has inscrito exitosamente a "{course.title}"
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3 text-green-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium">
                  Ya puedes comenzar a aprender
                </span>
              </div>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="text-center py-12">
            <div className="text-6xl mb-6">❌</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Error en la Inscripción
            </h3>
            <p className="text-gray-600 mb-6">{error}</p>
            
            <div className="space-y-3">
              <Button
                variant="primary"
                onClick={() => {
                  setCurrentStep('summary');
                  setError(null);
                }}
                fullWidth
              >
                Intentar de Nuevo
              </Button>
              
              <Button
                variant="outline"
                onClick={onClose}
                fullWidth
              >
                Cerrar
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {currentStep === 'summary' && 'Inscribirse al Curso'}
                {currentStep === 'payment' && 'Información de Pago'}
                {currentStep === 'processing' && 'Procesando...'}
                {currentStep === 'success' && '¡Inscripción Exitosa!'}
                {currentStep === 'error' && 'Error'}
              </h2>
              <p className="text-gray-600 mt-1">{course.title}</p>
            </div>
            
            {!['processing', 'success'].includes(currentStep) && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Progress Steps */}
          {currentStep !== 'error' && (
            <div className="mt-6">
              <div className="flex items-center justify-between">
                {['summary', 'payment', 'success'].map((step, index) => {
                  const isActive = currentStep === step;
                  const isCompleted = ['summary', 'payment'].indexOf(currentStep) > index;
                  const isVisible = course.price > 0 || step !== 'payment';
                  
                  if (!isVisible) return null;
                  
                  return (
                    <div key={step} className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        isCompleted ? 'bg-green-500 text-white' :
                        isActive ? 'bg-[var(--color-primary)] text-white' :
                        'bg-gray-200 text-gray-600'
                      }`}>
                        {isCompleted ? '✓' : index + 1}
                      </div>
                      
                      {index < 2 && course.price > 0 && (
                        <div className={`w-16 h-0.5 mx-2 ${
                          isCompleted ? 'bg-green-500' : 'bg-gray-200'
                        }`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};