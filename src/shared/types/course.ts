// Course-related type definitions for the application

export interface MediaResource {
  id?: string;
  url: string;
  type: 'image' | 'video' | 'document';
  filename: string;
  size?: number;
  mimeType?: string;
  alt?: string;
  caption?: string;
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
    poster?: string;
  };
}

export interface CourseComponent {
  id: string;
  type: 'banner' | 'video' | 'paragraph' | 'image' | 'quiz';
  title?: string;
  content?: string;
  order: number;
  metadata?: {
    // Common metadata
    courseId?: number;
    unitId?: number;
    
    // Component-specific metadata
    media?: MediaResource;
    
    // Quiz-specific
    questions?: QuizQuestion[];
    passingScore?: number;
    maxAttempts?: number;
    enableTimer?: boolean;
    showExplanations?: boolean;
    
    // Text-specific
    enableMarkdown?: boolean;
    variant?: 'default' | 'highlight' | 'note' | 'warning' | 'success';
    
    // Image-specific
    enableZoom?: boolean;
    enableDownload?: boolean;
    lazy?: boolean;
    
    // Video-specific
    autoPlay?: boolean;
    controls?: boolean;
    preload?: 'none' | 'metadata' | 'auto';
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface QuizQuestion {
  id?: string;
  question: string;
  options: string[];
  answer: number;
  explanation?: string;
  points?: number;
  timeLimit?: number;
  category?: string;
}

export interface QuizAttempt {
  id?: string;
  userId: string;
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
  timeSpent: number;
  timestamp: Date;
}

export interface QuizAnalytics {
  totalAttempts: number;
  averageScore: number;
  timeSpent: number;
  strongAreas: string[];
  weakAreas: string[];
  attemptHistory: {
    attempt: number;
    score: number;
    timestamp: Date;
  }[];
}

export interface CourseModule {
  id: string;
  title: string;
  description?: string;
  order: number;
  components: CourseComponent[];
  estimatedDuration?: number; // in minutes
  isRequired?: boolean;
  prerequisites?: string[];
  learningObjectives?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CourseUnit {
  id: string;
  title: string;
  description?: string;
  order: number;
  modules: CourseModule[];
  isPublished?: boolean;
  publishedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Course {
  id: string;
  title: string;
  description?: string;
  thumbnail?: MediaResource;
  units: CourseUnit[];
  category?: string;
  tags?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  duration?: number; // total estimated hours
  language?: string;
  isPublished?: boolean;
  publishedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  instructor?: {
    id: string;
    name: string;
    avatar?: string;
    bio?: string;
  };
  stats?: {
    enrollments: number;
    completions: number;
    averageRating: number;
    totalRatings: number;
  };
}

export interface CourseProgress {
  id: string;
  userId: string;
  courseId: string;
  completedModules: string[];
  currentModuleId?: string;
  progressPercentage: number;
  startedAt: Date;
  lastAccessedAt: Date;
  completedAt?: Date;
  quizScores: {
    moduleId: string;
    score: number;
    attempts: number;
    lastAttemptAt: Date;
  }[];
  timeSpent: number; // in minutes
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: Date;
  status: 'active' | 'completed' | 'dropped' | 'suspended';
  progress?: CourseProgress;
  certificate?: {
    id: string;
    issuedAt: Date;
    certificateUrl: string;
  };
}

// Builder-specific types for course creation
export interface ComponentTemplate {
  type: CourseComponent['type'];
  label: string;
  icon: string;
  description: string;
  defaultProps: Partial<CourseComponent>;
}

export interface CourseBuilder {
  course: Partial<Course>;
  currentUnit?: string;
  currentModule?: string;
  isDirty: boolean;
  validationErrors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
  path?: string;
}

// API response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: ValidationError[];
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// Component props types
export interface BaseComponentProps {
  className?: string;
  courseId?: number;
  unitId?: number;
  LoadingComponent?: React.ComponentType;
  ErrorComponent?: React.ComponentType<{ onRetry: () => void }>;
}

export interface BannerProps extends BaseComponentProps {
  img?: string;
  title: string;
  onScrollClick?: () => void;
}

export interface VideoProps extends BaseComponentProps {
  src: string;
  poster?: string;
  title?: string;
  autoPlay?: boolean;
  controls?: boolean;
  preload?: 'none' | 'metadata' | 'auto';
}

export interface ParagraphProps extends BaseComponentProps {
  content: string;
  enableMarkdown?: boolean;
  enableCopy?: boolean;
  enableTextResize?: boolean;
  enableFullscreen?: boolean;
  variant?: 'default' | 'highlight' | 'note' | 'warning' | 'success';
  ariaLabel?: string;
}

export interface ImageProps extends BaseComponentProps {
  img: string;
  alt?: string;
  lazy?: boolean;
  enableZoom?: boolean;
  enableDownload?: boolean;
  sizes?: string;
}

export interface QuizProps extends BaseComponentProps {
  questions: QuizQuestion[];
  unit?: number;
  course?: number;
  courseTitle?: string;
  onComplete?: (score: number, analytics: QuizAnalytics) => void;
  nextUnitUrl?: string;
  passingScore?: number;
  enableTimer?: boolean;
  showExplanations?: boolean;
  enableReview?: boolean;
  maxAttempts?: number;
}