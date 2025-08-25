/**
 * Entidades del Sistema de Actividades - MVP
 * 
 * Tipos para el manejo de actividades, entregas y calificaciones
 */

export interface Activity {
  id: string;
  title: string;
  description: string;
  type: 'assignment' | 'project' | 'essay' | 'presentation';
  maxScore: number;
  dueDate: string; // ISO string
  courseId: number;
  moduleId?: string;
  createdBy: number; // Teacher ID
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  instructions?: string;
  allowedFileTypes: string[]; // ['pdf', 'doc', 'docx', 'jpg', 'png', 'mp4']
  maxFileSize: number; // in bytes
  maxFiles: number;
}

export interface ActivityFile {
  id: string;
  originalName: string;
  fileName: string; // stored filename
  filePath: string;
  fileSize: number;
  fileType: string;
  mimeType: string;
  uploadedAt: string;
}

export interface ActivitySubmission {
  id: string;
  activityId: string;
  studentId: number;
  submittedAt: string;
  status: 'draft' | 'submitted' | 'graded';
  files: ActivityFile[];
  studentNotes?: string;
  score?: number;
  maxScore: number;
  feedback?: string;
  gradedAt?: string;
  gradedBy?: number; // Teacher ID
}

export interface ActivityStats {
  totalStudents: number;
  submitted: number;
  graded: number;
  pending: number;
  averageScore?: number;
  onTime: number;
  late: number;
}

// DTOs para API
export interface CreateActivityData {
  title: string;
  description: string;
  type: Activity['type'];
  maxScore: number;
  dueDate: string;
  courseId: number;
  moduleId?: string;
  instructions?: string;
  allowedFileTypes?: string[];
  maxFileSize?: number;
  maxFiles?: number;
}

export interface SubmitActivityData {
  activityId: string;
  studentNotes?: string;
  files: File[]; // Files to upload
}

export interface GradeActivityData {
  submissionId: string;
  score: number;
  feedback?: string;
}

export default Activity;