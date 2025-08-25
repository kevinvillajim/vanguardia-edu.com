import { IEnrollmentRepository, EnrollmentFilters, UpdateProgressData, CourseProgressData } from '../../domain/repositories/IEnrollmentRepository';
import { Enrollment, Progress, Certificate, StudentStats, StudentActivity } from '../../domain/entities/Enrollment';
import { PaginatedResponse } from '../../shared/types';
import { apiClient } from '../api/ApiClient';
import { ENDPOINTS, buildUrl } from '../api/endpoints';

export class EnrollmentRepository implements IEnrollmentRepository {
  
  async enrollInCourse(userId: number, courseId: number): Promise<Enrollment> {
    const response = await apiClient.post<{ data: Enrollment }>(ENDPOINTS.ENROLLMENTS.ENROLL, {
      user_id: userId,
      course_id: courseId
    });
    return response.data;
  }

  async getEnrollments(userId: number, filters?: EnrollmentFilters): Promise<PaginatedResponse<Enrollment>> {
    const url = buildUrl(ENDPOINTS.ENROLLMENTS.LIST, { user_id: userId, ...filters });
    return apiClient.get<PaginatedResponse<Enrollment>>(url);
  }

  async getEnrollment(userId: number, courseId: number): Promise<Enrollment> {
    const response = await apiClient.get<{ data: Enrollment }>(ENDPOINTS.ENROLLMENTS.GET(courseId), {
      params: { user_id: userId }
    });
    return response.data;
  }

  async cancelEnrollment(enrollmentId: number): Promise<void> {
    await apiClient.post(ENDPOINTS.ENROLLMENTS.CANCEL(enrollmentId));
  }

  async updateProgress(data: UpdateProgressData): Promise<Progress> {
    const response = await apiClient.post<{ data: Progress }>(ENDPOINTS.ENROLLMENTS.PROGRESS, data);
    return response.data;
  }

  async getProgress(userId: number, courseId: number): Promise<Progress[]> {
    const response = await apiClient.get<{ data: Progress[] }>(ENDPOINTS.ENROLLMENTS.COURSE_PROGRESS(courseId), {
      params: { user_id: userId }
    });
    return response.data;
  }

  async getCourseProgress(userId: number, courseId: number): Promise<CourseProgressData> {
    const response = await apiClient.get<{ data: CourseProgressData }>(ENDPOINTS.ENROLLMENTS.COURSE_PROGRESS(courseId), {
      params: { user_id: userId, detailed: true }
    });
    return response.data;
  }

  async markComponentCompleted(userId: number, componentId: number): Promise<Progress> {
    const response = await apiClient.post<{ data: Progress }>(ENDPOINTS.ENROLLMENTS.COMPLETE_COMPONENT, {
      user_id: userId,
      component_id: componentId
    });
    return response.data;
  }

  async getStudentStats(userId: number): Promise<StudentStats> {
    const response = await apiClient.get<{ data: StudentStats }>(ENDPOINTS.DASHBOARD.STUDENT, {
      params: { user_id: userId }
    });
    return response.data;
  }

  async getStudentActivity(userId: number, limit = 10): Promise<StudentActivity[]> {
    const response = await apiClient.get<{ data: StudentActivity[] }>(ENDPOINTS.ENROLLMENTS.ACTIVITY, {
      params: { user_id: userId, limit }
    });
    return response.data;
  }

  async generateCertificate(userId: number, courseId: number): Promise<Certificate> {
    const response = await apiClient.post<{ data: Certificate }>(ENDPOINTS.CERTIFICATES.GENERATE, {
      user_id: userId,
      course_id: courseId
    });
    return response.data;
  }

  async getCertificates(userId: number): Promise<Certificate[]> {
    const response = await apiClient.get<{ data: Certificate[] }>(ENDPOINTS.CERTIFICATES.LIST, {
      params: { user_id: userId }
    });
    return response.data;
  }

  async getCertificate(certificateId: number): Promise<Certificate> {
    const response = await apiClient.get<{ data: Certificate }>(ENDPOINTS.CERTIFICATES.GET(certificateId));
    return response.data;
  }

  async getCourseEnrollments(courseId: number, filters?: EnrollmentFilters): Promise<PaginatedResponse<Enrollment>> {
    const url = buildUrl(ENDPOINTS.ENROLLMENTS.COURSE_ENROLLMENTS(courseId), filters);
    return apiClient.get<PaginatedResponse<Enrollment>>(url);
  }

  async getStudentsByTeacher(teacherId: number): Promise<Enrollment[]> {
    const response = await apiClient.get<{ data: Enrollment[] }>(ENDPOINTS.ENROLLMENTS.STUDENTS, {
      params: { teacher_id: teacherId }
    });
    return response.data;
  }

  async getCourseViewData(userId: number, courseId: number): Promise<any> {
    const response = await apiClient.get<{ data: any }>(ENDPOINTS.ENROLLMENTS.COURSE_VIEW(courseId), {
      params: { user_id: userId }
    });
    return response.data;
  }
}