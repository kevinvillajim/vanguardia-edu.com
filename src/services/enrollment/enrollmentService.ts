import { apiClient } from '../api/client';

export interface EnrollmentData {
  course_id: number;
  payment_method?: 'free' | 'card' | 'paypal' | 'transfer';
  payment_details?: {
    card_number?: string;
    card_holder?: string;
    expiry_date?: string;
    cvv?: string;
    billing_address?: {
      street: string;
      city: string;
      state: string;
      postal_code: string;
      country: string;
    };
  };
  coupon_code?: string;
}

export interface EnrollmentResponse {
  id: number;
  course_id: number;
  student_id: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  enrolled_at: string;
  progress_percentage: number;
  completed_lessons: number;
  total_lessons: number;
  certificate_earned: boolean;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_amount: number;
  payment_method: string;
}

export interface StudentProgress {
  course_id: number;
  total_lessons: number;
  completed_lessons: number;
  progress_percentage: number;
  current_lesson_id?: number;
  last_accessed_at: string;
  time_spent_minutes: number;
  quiz_scores: Array<{
    lesson_id: number;
    score: number;
    max_score: number;
    attempts: number;
  }>;
}

export interface Certificate {
  id: number;
  course_id: number;
  student_id: number;
  certificate_url: string;
  issued_at: string;
  verification_code: string;
}

class EnrollmentService {
  private readonly basePath = '/enrollments';

  /**
   * Inscribirse a un curso
   */
  async enrollInCourse(enrollmentData: EnrollmentData): Promise<EnrollmentResponse> {
    const response = await apiClient.post(this.basePath, enrollmentData);
    return response.data;
  }

  /**
   * Obtener mis inscripciones
   */
  async getMyEnrollments(filters?: {
    status?: 'pending' | 'active' | 'completed' | 'cancelled';
    page?: number;
    per_page?: number;
  }): Promise<{
    data: EnrollmentResponse[];
    meta: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  }> {
    const response = await apiClient.get(this.basePath, {
      params: filters
    });
    return response.data;
  }

  /**
   * Obtener detalles de una inscripción específica
   */
  async getEnrollment(enrollmentId: number): Promise<EnrollmentResponse> {
    const response = await apiClient.get(`${this.basePath}/${enrollmentId}`);
    return response.data;
  }

  /**
   * Verificar si estoy inscrito en un curso
   */
  async checkEnrollmentStatus(courseId: number): Promise<{
    is_enrolled: boolean;
    enrollment?: EnrollmentResponse;
    can_enroll: boolean;
    enrollment_requirements?: string[];
  }> {
    const response = await apiClient.get(`${this.basePath}/check/${courseId}`);
    return response.data;
  }

  /**
   * Cancelar inscripción
   */
  async cancelEnrollment(enrollmentId: number, reason?: string): Promise<void> {
    await apiClient.post(`${this.basePath}/${enrollmentId}/cancel`, {
      reason
    });
  }

  /**
   * Marcar lección como completada
   */
  async markLessonComplete(courseId: number, lessonId: number): Promise<{
    lesson_completed: boolean;
    course_progress: number;
    next_lesson_id?: number;
    achievement_unlocked?: string;
  }> {
    const response = await apiClient.post(`${this.basePath}/progress`, {
      course_id: courseId,
      lesson_id: lessonId,
      action: 'complete'
    });
    return response.data;
  }

  /**
   * Actualizar progreso de lección
   */
  async updateLessonProgress(
    courseId: number, 
    lessonId: number, 
    progressData: {
      progress_percentage: number;
      time_spent_seconds: number;
      current_position?: number;
    }
  ): Promise<void> {
    await apiClient.post(`${this.basePath}/progress`, {
      course_id: courseId,
      lesson_id: lessonId,
      action: 'update',
      ...progressData
    });
  }

  /**
   * Obtener progreso detallado del curso
   */
  async getCourseProgress(courseId: number): Promise<StudentProgress> {
    const response = await apiClient.get(`${this.basePath}/progress/${courseId}`);
    return response.data;
  }

  /**
   * Enviar respuestas de quiz
   */
  async submitQuizAnswers(
    courseId: number, 
    lessonId: number, 
    answers: Array<{
      question_id: number;
      answer: string | string[] | number;
    }>
  ): Promise<{
    score: number;
    max_score: number;
    passed: boolean;
    correct_answers: number;
    total_questions: number;
    detailed_results: Array<{
      question_id: number;
      is_correct: boolean;
      correct_answer: string;
      explanation?: string;
    }>;
  }> {
    const response = await apiClient.post(`${this.basePath}/quiz/submit`, {
      course_id: courseId,
      lesson_id: lessonId,
      answers
    });
    return response.data;
  }

  /**
   * Generar certificado del curso
   */
  async generateCertificate(courseId: number): Promise<Certificate> {
    const response = await apiClient.post(`${this.basePath}/certificate`, {
      course_id: courseId
    });
    return response.data;
  }

  /**
   * Obtener mis certificados
   */
  async getMyCertificates(): Promise<Certificate[]> {
    const response = await apiClient.get(`${this.basePath}/certificates`);
    return response.data;
  }

  /**
   * Aplicar cupón de descuento
   */
  async applyCoupon(courseId: number, couponCode: string): Promise<{
    valid: boolean;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    final_price: number;
    original_price: number;
    coupon_details: {
      code: string;
      description: string;
      expires_at?: string;
      usage_limit?: number;
      used_count?: number;
    };
  }> {
    const response = await apiClient.post(`${this.basePath}/coupon/apply`, {
      course_id: courseId,
      coupon_code: couponCode
    });
    return response.data;
  }

  /**
   * Procesar pago
   */
  async processPayment(paymentData: {
    course_id: number;
    payment_method: 'card' | 'paypal';
    payment_details: any;
    coupon_code?: string;
  }): Promise<{
    payment_id: string;
    status: 'success' | 'pending' | 'failed';
    enrollment_id?: number;
    redirect_url?: string;
    error_message?: string;
  }> {
    const response = await apiClient.post(`${this.basePath}/payment/process`, paymentData);
    return response.data;
  }

  /**
   * Obtener historial de pagos
   */
  async getPaymentHistory(): Promise<Array<{
    id: string;
    course_id: number;
    course_title: string;
    amount: number;
    currency: string;
    status: string;
    payment_method: string;
    created_at: string;
    invoice_url?: string;
  }>> {
    const response = await apiClient.get(`${this.basePath}/payments`);
    return response.data;
  }

  /**
   * Solicitar reembolso
   */
  async requestRefund(enrollmentId: number, reason: string): Promise<{
    refund_request_id: string;
    status: 'pending' | 'approved' | 'denied';
    estimated_processing_days: number;
  }> {
    const response = await apiClient.post(`${this.basePath}/${enrollmentId}/refund`, {
      reason
    });
    return response.data;
  }

  /**
   * Obtener estadísticas de aprendizaje
   */
  async getLearningStats(): Promise<{
    total_courses_enrolled: number;
    total_courses_completed: number;
    total_hours_learned: number;
    total_certificates_earned: number;
    current_streak_days: number;
    longest_streak_days: number;
    favorite_categories: Array<{
      category: string;
      course_count: number;
    }>;
    monthly_progress: Array<{
      month: string;
      lessons_completed: number;
      hours_learned: number;
    }>;
  }> {
    const response = await apiClient.get(`${this.basePath}/stats`);
    return response.data;
  }
}

export const enrollmentService = new EnrollmentService();