import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { motion } from 'framer-motion';
import { 
  Menu, Play, FileText, Image as ImageIcon, Music, ClipboardList, 
  Edit, Trash2, Eye, ChevronUp, ChevronDown, Plus, GripVertical,
  AlertCircle, X, RotateCcw, FolderOpen, Activity, TrendingUp, CheckCircle,
  Lock, Shield, CheckSquare
} from 'lucide-react';
import { useAuthStore } from '../../../../shared/store/authStore';
import { useCourseCreation } from '../../../../shared/hooks/useCourseCreation';
import { useAutoSave } from '../../../../shared/hooks/useAutoSave';
import { CreateCourseData, CourseUnit, CourseModule, CourseComponent } from '../../../../domain/entities/Course';
import { CreateUnitData, CreateModuleData, CreateComponentData } from '../../../../domain/repositories/ICourseRepository';
import { courseService } from '../../../../services/courseService';
import { uploadService } from '../../../../services/uploadService';
import { CourseData, ModuleData, LessonData, LessonContent } from '../../pages/CoursesCatalogPage';
import { SpecificComponentModal } from '../ComponentEditor/SpecificComponentModal';
import Banner from '../Banner';
import Video, { VideoProvider } from '../Video';
import VideoPlayer from '../../../../shared/components/media/VideoPlayer';
import Paragraph from '../Paragraph';
import { buildMediaUrl } from '../../../../shared/utils/mediaUtils';
import Image from '../Image';
import Quiz from '../Quiz';
import Document from '../Document';
import { AudioPlayer } from '../../../../shared/components/media/AudioPlayer';
import Button from '../../../../components/ui/Button/Button';
import { progressService } from '../../../../services/progressService';
import { logger } from '../../../../shared/utils/logger';

interface ComponentItem {
  id: string;
  type: string;
  title: string;
  content?: string;
  fileUrl?: string;
  duration?: number;
  isMandatory: boolean;
  order: number;
  metadata?: any;
}

interface Module {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  bannerImg?: string;
  components: ComponentItem[];
  quiz?: any;
  order: number;
  unitId?: number; // ID de la unidad en el backend
  enableSmartProgress?: boolean; // Sistema de prerrequisitos inteligentes
}

interface Activity {
  id: string;
  title: string;
  description: string;
  type: 'assignment' | 'project' | 'essay' | 'presentation';
  maxScore: number;
  weight: number;
  dueDate?: string;
  isMandatory: boolean;
  order: number;
}

interface Course {
  id?: string;
  title: string;
  description: string;
  modules: Module[];
  activities: Activity[];
}

interface TeacherCourseBuilderProps {
  courseData: CourseData;
  onUpdate: (updates: Partial<CourseData>) => void;
  validationErrors: string[];
  onBuilderDataChange?: (builderData: Course) => void;
}

// Tipos de componentes disponibles
const ComponentTypes = {
  BANNER: 'banner',
  VIDEO: 'video',
  READING: 'reading',
  IMAGE: 'image',
  DOCUMENT: 'document',
  AUDIO: 'audio',
  QUIZ: 'quiz',
  ACTIVITY: 'activity'
};

// Componente de item arrastrable
const DraggableComponent: React.FC<{
  component: ComponentItem;
  index: number;
  moduleId: string;
  moduleComponents: ComponentItem[];
  module: Module;
  moveComponent: (dragIndex: number, dropIndex: number, moduleId: string) => void;
  onEdit: () => void;
  onDelete: () => void;
  isFinalQuiz: (component: ComponentItem, moduleComponents: ComponentItem[]) => boolean;
  canActivateFinalQuiz: (component: ComponentItem, moduleComponents: ComponentItem[], module: Module) => boolean;
  getComponentLabel: (component: ComponentItem, moduleComponents: ComponentItem[], module: Module) => string;
}> = ({ component, index, moduleId, moduleComponents, module, moveComponent, onEdit, onDelete, isFinalQuiz, canActivateFinalQuiz, getComponentLabel }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'component',
    item: { index, moduleId, component },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'component',
    hover: (item: any) => {
      if (item.moduleId !== moduleId) return;
      if (item.index === index) return;
      moveComponent(item.index, index, moduleId);
      item.index = index;
    },
  });

  const getIcon = () => {
    switch (component.type) {
      case ComponentTypes.VIDEO: 
        return <Play className="w-5 h-5" />;
      case ComponentTypes.READING: 
        return <FileText className="w-5 h-5" />;
      case ComponentTypes.IMAGE: 
        return <ImageIcon className="w-5 h-5" />;
      case ComponentTypes.AUDIO: 
        return <Music className="w-5 h-5" />;
      case ComponentTypes.QUIZ: 
        return <ClipboardList className="w-5 h-5" />;
      default: 
        return <FolderOpen className="w-5 h-5" />;
    }
  };

  // Verificar si es quiz final
  const isQuizFinal = component.type === ComponentTypes.QUIZ && isFinalQuiz(component, moduleComponents);

  return (
    <div
      ref={(node) => !isQuizFinal && drag(drop(node))} // Solo aplicar drag si NO es quiz final
      className={`flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg transition-all ${
        isQuizFinal 
          ? 'cursor-default border-purple-300 bg-purple-50' // Quiz final - sin cursor de mover
          : isDragging 
            ? 'opacity-50 cursor-move' 
            : 'cursor-move'
      }`}
    >
      <div className="flex items-center space-x-3">
        {isQuizFinal ? (
          // Quiz final - icono de candado en lugar de grip
          <Lock className="w-4 h-4 text-purple-500" />
        ) : (
          <GripVertical className="w-4 h-4 text-gray-400" />
        )}
        <div className="text-gray-600">{getIcon()}</div>
        <div>
          <p className={`text-sm font-medium ${
            isQuizFinal ? 'text-purple-900' : 'text-gray-900'
          }`}>
            {component.title}
            {isQuizFinal && (
              <span className="ml-2 text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full">
                Quiz Final
              </span>
            )}
          </p>
          {component.duration && (
            <p className="text-xs text-gray-500">
              {component.duration} minutos
            </p>
          )}
        </div>
        <span className={`px-2 py-1 text-xs rounded ${
          !module.enableSmartProgress
            ? // Sistema desactivado - todo gris excepto Quiz Final
              (component.type === ComponentTypes.QUIZ && isFinalQuiz(component, moduleComponents))
                ? 'bg-green-100 text-green-700' // Quiz Final siempre disponible
                : 'bg-gray-100 text-gray-600'   // Todo lo demás opcional
            : // Sistema activado - lógica original  
              !component.isMandatory 
                ? 'bg-gray-100 text-gray-600'
                : isFinalQuiz(component, moduleComponents)
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-red-100 text-red-700'
        }`}>
          {getComponentLabel(component, moduleComponents, module)}
        </span>
        {module.enableSmartProgress && isFinalQuiz(component, moduleComponents) && !canActivateFinalQuiz(component, moduleComponents, module) && (
          <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded flex items-center space-x-1">
            <Lock className="w-3 h-3" />
            <span>Requiere completar contenido previo</span>
          </span>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={onEdit}
          className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-1 text-gray-500 hover:text-red-600 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Panel de componentes disponibles
const ComponentPalette: React.FC<{
  onAddComponent: (type: string, moduleId: string) => void;
  currentModuleId: string | null;
}> = ({ onAddComponent, currentModuleId }) => {
  const components = [
    { type: ComponentTypes.BANNER, label: 'Banner', icon: 'video' },
    { type: ComponentTypes.VIDEO, label: 'Video', icon: 'play' },
    { type: ComponentTypes.READING, label: 'Lectura', icon: 'document' },
    { type: ComponentTypes.IMAGE, label: 'Imagen', icon: 'photo' },
    { type: ComponentTypes.AUDIO, label: 'Audio', icon: 'music' },
    { type: ComponentTypes.DOCUMENT, label: 'Documento', icon: 'document' },
    { type: ComponentTypes.QUIZ, label: 'Quiz', icon: 'quiz' },
  ];

  const getIcon = (icon: string) => {
    switch (icon) {
      case 'play':
        return <Play className="w-6 h-6 text-gray-600 mb-1" />;
      case 'document':
        return <FileText className="w-6 h-6 text-gray-600 mb-1" />;
      case 'photo':
        return <ImageIcon className="w-6 h-6 text-gray-600 mb-1" />;
      case 'music':
        return <Music className="w-6 h-6 text-gray-600 mb-1" />;
      case 'quiz':
        return <ClipboardList className="w-6 h-6 text-gray-600 mb-1" />;
      default:
        return <FolderOpen className="w-6 h-6 text-gray-600 mb-1" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">
          Componentes Disponibles
        </h3>
        {currentModuleId && (
          <span className="text-xs bg-secondary-100 text-secondary-700 px-2 py-1 rounded flex items-center space-x-1">
            <CheckCircle className="w-3 h-3" />
            <span>Módulo seleccionado</span>
          </span>
        )}
      </div>
      
      {!currentModuleId && (
        <div className="mb-4 p-3 bg-acent-50 border border-acent-200 rounded-lg">
          <div className="flex items-center justify-center space-x-2">
            <AlertCircle className="w-4 h-4 text-acent-600" />
            <p className="text-xs text-acent-700 text-center font-medium">
              Primero crea y selecciona un módulo para activar los componentes
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        {components.map((comp) => (
          <button
            key={comp.type}
            onClick={() => currentModuleId && onAddComponent(comp.type, currentModuleId)}
            disabled={!currentModuleId}
            className={`flex flex-col items-center justify-center p-3 border rounded-lg transition-all ${
              currentModuleId
                ? 'border-gray-200 hover:border-primary-500 hover:bg-primary-50 cursor-pointer'
                : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
            }`}
            title={currentModuleId ? `Agregar ${comp.label}` : 'Selecciona un módulo primero'}
          >
            {getIcon(comp.icon)}
            <span className="text-xs text-gray-700">{comp.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export const TeacherCourseBuilder: React.FC<TeacherCourseBuilderProps> = ({
  courseData,
  onUpdate,
  validationErrors,
  onBuilderDataChange
}) => {
  const { user } = useAuthStore();
  
  // Use the course creation hook with notification support
  const {
    isLoading,
    error,
    course: createdCourse,
    createCourse,
    createUnit,
    createModule,
    createComponent,
    deleteUnit,
    deleteModule,
    deleteComponent,
    uploadBanner,
    clearError
  } = useCourseCreation((type, title, message) => {
    // Simple notification - you can replace with your preferred notification system
    if (type === 'error') {
      logger.error(`[${type.toUpperCase()}] ${title}:`, message);
    } else if (type === 'warn') {
      logger.warn(`[${type.toUpperCase()}] ${title}:`, message);
    } else {
      logger.course(`[${type.toUpperCase()}] ${title}:`, message);
    }
  });
  
  const [course, setCourse] = useState<Course>({
    title: courseData.title,
    description: courseData.description,
    modules: courseData.modules.map(module => ({
      id: module.id?.toString() || `module-${Date.now()}`,
      title: module.title,
      subtitle: module.subtitle || '',
      description: module.description,
      bannerImg: module.bannerImg || '',
      components: [],
      order: module.order,
      enableSmartProgress: module.enableSmartProgress ?? true // Por defecto activado
    })),
    activities: []
  });
  
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewModuleId, setPreviewModuleId] = useState<string | null>(null);
  const [previewCurrentModuleId, setPreviewCurrentModuleId] = useState<string | null>(null);
  const [currentCourseId, setCurrentCourseId] = useState<number | null>(null);
  const [editingComponent, setEditingComponent] = useState<{ component: ComponentItem; moduleId: string } | null>(null);
  const [editingModuleBanner, setEditingModuleBanner] = useState<string | null>(null);

  // Enviar datos del constructor al padre
  useEffect(() => {
    if (onBuilderDataChange) {
      onBuilderDataChange(course);
    }
  }, [course, onBuilderDataChange]);

  // Auto-guardado
  const { isSaving, lastSaved, getTimeSinceLastSave } = useAutoSave(course, {
    delay: 3000, // Guardar después de 3 segundos de inactividad
    enabled: currentCourseId !== null,
    onSave: async (courseData) => {
      if (!currentCourseId) return;
      
      try {
        await courseService.updateCourse(currentCourseId, {
          title: courseData.title,
          description: courseData.description
        });
        logger.course('Curso auto-guardado');
      } catch (error) {
        console.error('Error en auto-guardado:', error);
      }
    },
    onError: (error) => {
      console.error('Error de auto-guardado:', error);
    }
  });

  // Sync course data with props - usar useMemo para evitar re-renders innecesarios
  const courseDataHash = `${courseData.title}-${courseData.description}-${courseData.modules.length}`;
  
  useEffect(() => {
    setCourse(prevCourse => {
      // Solo actualizar si hay cambios reales comparando el hash
      const currentHash = `${prevCourse.title}-${prevCourse.description}-${prevCourse.modules.length}`;
      
      if (currentHash !== courseDataHash) {
        return {
          title: courseData.title,
          description: courseData.description,
          modules: courseData.modules.map(module => ({
            id: module.id?.toString() || `module-${Date.now()}`,
            title: module.title,
            subtitle: module.subtitle || '',
            description: module.description,
            bannerImg: module.bannerImg || '',
            components: [],
            order: module.order,
            enableSmartProgress: module.enableSmartProgress ?? true
          })),
          activities: []
        };
      }
      
      return prevCourse;
    });
  }, [courseDataHash, courseData.title, courseData.description, courseData.modules]);

  // Sync changes back to parent con debounce - usar useCallback para onUpdate
  const stableOnUpdate = useCallback(onUpdate, []);
  
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      stableOnUpdate({
        title: course.title,
        description: course.description,
        modules: course.modules.map(module => ({
          id: parseInt(module.id) || undefined,
          title: module.title,
          description: module.description,
          order: module.order,
          lessons: []
        }))
      });
    }, 300); // Incrementar debounce time
    
    return () => clearTimeout(timeoutId);
  }, [course.title, course.description, course.modules.length, stableOnUpdate]);

  // Función para renderizar componente en vista previa - memoizada para evitar re-renders
  const renderComponentPreview = useCallback((component: ComponentItem) => {
    const key = `component-${component.id}`;

    // Helper para obtener la URL de media correcta
    const getMediaUrl = (fileUrl: string | undefined, mediaType: 'images' | 'videos' | 'documents' | 'audio' = 'images') => {
      if (!fileUrl) return '';
      return buildMediaUrl(fileUrl, currentCourseId, undefined, mediaType);
    };

    // Helper para obtener contenido de imagen desde el content
    const getImageFromContent = (component: ComponentItem): string => {
      if (component.fileUrl) {
        return getMediaUrl(component.fileUrl, 'images');
      }
      if (component.content?.img) {
        return getMediaUrl(component.content.img, 'images');
      }
      if (component.content?.image) {
        return getMediaUrl(component.content.image, 'images');
      }
      return '';
    };

    switch (component.type) {
      case ComponentTypes.BANNER:
        const bannerImg = getImageFromContent(component);
        const bannerTitle = component.content?.title || component.title || 'Banner de Ejemplo';
        const bannerSubtitle = component.content?.subtitle || undefined;
        return (
          <Banner 
            key={key}
            img={bannerImg || '/team.jpeg'}
            title={bannerTitle}
            subtitle={bannerSubtitle}
          />
        );
      case ComponentTypes.VIDEO:
        const videoSrc = getMediaUrl(component.content?.src || component.fileUrl, 'videos');
        const posterUrl = component.content?.poster || component.metadata?.poster ? 
          getMediaUrl(component.content?.poster || component.metadata.poster, 'images') : undefined;
        return (
          <VideoPlayer 
            key={key}
            src={videoSrc || '/videos/curso1unidad2video.mp4'}
            title={component.content?.title || component.title || 'Video de Ejemplo'}
            description={component.content?.description}
            poster={posterUrl}
            autoPlay={component.content?.autoplay || false}
            showDownload={true}
            height="400px"
          />
        );
      case ComponentTypes.READING:
        const readingContent = component.content?.text || 'Contenido de lectura de ejemplo. Aquí iría el texto educativo del módulo.';
        return (
          <Paragraph 
            key={key}
            content={readingContent}
          />
        );
      case ComponentTypes.IMAGE:
        const imageUrl = getImageFromContent(component);
        return (
          <Image 
            key={key}
            img={imageUrl || '/team.jpeg'}
            alt={component.title || 'Imagen de Ejemplo'}
          />
        );
      case ComponentTypes.DOCUMENT:
        const documentUrl = getMediaUrl(component.content?.file_url || component.fileUrl, 'documents');
        // Obtener el módulo actual para el progreso
        const currentPreviewModule = course.modules.find(m => m.id === previewCurrentModuleId);
        return (
          <Document
            key={key}
            title={component.content?.title || component.title || 'Documento de Ejemplo'}
            fileUrl={documentUrl}
            fileName={component.content?.file_name || 'documento.pdf'}
            fileType={component.content?.file_type || 'application/pdf'}
            description={component.content?.description}
            downloadable={component.content?.downloadable !== false}
            courseId={currentCourseId}
            moduleId={currentPreviewModule?.id}
            componentId={component.id}
            onDownload={() => {
              // Callback adicional si se necesita
              logger.debug('Document downloaded from preview:', component.title);
            }}
          />
        );
      case ComponentTypes.AUDIO:
        const audioSrc = getMediaUrl(component.content?.src || component.fileUrl, 'audio');
        return (
          <AudioPlayer
            key={key}
            src={audioSrc || ''}
            title={component.content?.title || component.title || 'Audio de Ejemplo'}
            description={component.content?.description}
            autoPlay={component.content?.autoplay || false}
            showDownload={true}
            variant="default"
          />
        );
      case ComponentTypes.QUIZ:
        // Convert content format to Quiz component format if available
        const convertedQuestions = component.content?.questions ? 
          component.content.questions.map((q: any) => ({
            id: q.id,
            question: q.question,
            options: q.type === 'multiple_choice' ? (q.options || []) :
                     q.type === 'true_false' ? ['Verdadero', 'Falso'] : [],
            answer: q.type === 'multiple_choice' ? (typeof q.correct_answer === 'number' ? q.correct_answer : 0) :
                    q.type === 'true_false' ? (q.correct_answer === 'true' ? 0 : 1) :
                    q.type === 'short_answer' ? (typeof q.correct_answer === 'string' ? q.correct_answer : '') : 0,
            explanation: q.explanation,
            points: q.points,
            category: 'General'
          })) : [
            {
              id: 'sample-1',
              question: "¿Cuál es el propósito principal de este módulo?",
              options: ["Opción A", "Opción B", "Opción C", "Opción D"],
              answer: 0,
              explanation: "Esta es una pregunta de ejemplo",
              points: 1,
              category: 'General'
            }
          ];
        
        return (
          <Quiz 
            key={key}
            questions={convertedQuestions}
            courseTitle={component.content?.title || component.title || 'Quiz de Ejemplo'}
            passingScore={component.content?.passing_score || 70}
            enableTimer={component.content?.time_limit !== null}
            showExplanations={component.content?.show_correct_answers !== false}
            maxAttempts={component.content?.attempts_allowed || 3}
            className="!my-0"
          />
        );
      default:
        return (
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg mx-8 my-4">
            <p className="text-gray-600 dark:text-gray-400">
              Componente no reconocido: {component.type}
            </p>
          </div>
        );
    }
  }, [currentCourseId]);

  // Función para determinar si un componente debe ser obligatorio
  const shouldComponentBeMandatory = (componentType: string): boolean => {
    const mandatoryTypes = [
      ComponentTypes.VIDEO,
      ComponentTypes.AUDIO, 
      ComponentTypes.DOCUMENT,
      ComponentTypes.QUIZ
    ];
    return mandatoryTypes.includes(componentType);
  };

  // Función para verificar si un quiz es el quiz final del módulo
  const isFinalQuiz = (component: ComponentItem, moduleComponents: ComponentItem[]): boolean => {
    if (component.type !== ComponentTypes.QUIZ) return false;
    
    // Es quiz final si es el último quiz del módulo
    const quizzes = moduleComponents.filter(c => c.type === ComponentTypes.QUIZ);
    const currentQuizIndex = quizzes.findIndex(q => q.id === component.id);
    return currentQuizIndex === quizzes.length - 1;
  };

  // Función para verificar prerrequisitos del quiz final
  const canActivateFinalQuiz = (component: ComponentItem, moduleComponents: ComponentItem[], module: Module): boolean => {
    // Si el sistema inteligente está desactivado, siempre permitir acceso
    if (!module.enableSmartProgress) return true;
    
    if (!isFinalQuiz(component, moduleComponents)) return true;
    
    // Si no tenemos courseId, permitir acceso (modo preview/desarrollo)
    if (!currentCourseId) return true;
    
    // Usar el progressService para verificar el progreso real
    return progressService.canAccessFinalQuiz(
      currentCourseId,
      module.id,
      moduleComponents,
      component.id
    );
  };

  // Función para obtener la etiqueta descriptiva del componente
  const getComponentLabel = (component: ComponentItem, moduleComponents: ComponentItem[], module: Module): string => {
    // Si el sistema inteligente está desactivado, todo es opcional excepto el Quiz Final
    if (!module.enableSmartProgress) {
      if (component.type === ComponentTypes.QUIZ && isFinalQuiz(component, moduleComponents)) {
        return 'Quiz Final (Siempre disponible)';
      }
      return 'Opcional';
    }
    
    // Sistema inteligente activado - lógica original
    if (!component.isMandatory) return 'Opcional';
    
    if (component.type === ComponentTypes.QUIZ && isFinalQuiz(component, moduleComponents)) {
      return 'Quiz Final (Calificado)';
    }
    
    const labels = {
      [ComponentTypes.VIDEO]: 'Video (Obligatorio)',
      [ComponentTypes.AUDIO]: 'Audio (Obligatorio)', 
      [ComponentTypes.DOCUMENT]: 'Documento (Obligatorio)',
      [ComponentTypes.QUIZ]: 'Quiz (Obligatorio)',
      [ComponentTypes.BANNER]: 'Banner',
      [ComponentTypes.IMAGE]: 'Imagen',
      [ComponentTypes.READING]: 'Lectura'
    };
    
    return labels[component.type] || 'Obligatorio';
  };

  // Create course in backend if needed
  const ensureCourseExists = async () => {
    if (currentCourseId) {
      return currentCourseId;
    }

    // Crear curso borrador con valores por defecto si no hay datos
    const createCourseData: CreateCourseData = {
      title: courseData.title || 'Nuevo Curso',
      description: courseData.description || 'Descripción del curso',
      shortDescription: (courseData.description || 'Descripción del curso').substring(0, 100),
      price: courseData.price || 0,
      durationHours: courseData.durationHours || 1,
      difficulty: courseData.difficulty || 'beginner',
      tags: courseData.tags || [],
      teacherId: 0 // Se agregará automáticamente desde el store
    };

    try {
      // Debug log solo en desarrollo
      if (import.meta.env.MODE === 'development') {
        logger.course('Creando curso con datos:', createCourseData);
      }
      const result = await courseService.createCourse(createCourseData);
      if (import.meta.env.MODE === 'development') {
        logger.course('Resultado de createCourse:', result);
      }
      
      if (result.success && result.course && result.course.id) {
        setCurrentCourseId(result.course.id);
        if (import.meta.env.MODE === 'development') {
          logger.success('Curso creado con ID:', result.course.id);
        }
        return result.course.id;
      }
      
      console.error('Error creando el curso:', result.error || 'No se pudo obtener el ID del curso');
      return null;
    } catch (error) {
      console.error('Error al crear el curso:', error);
      return null;
    }
  };

  // Agregar nuevo módulo
  const addModuleLocal = async () => {
    try {
      // Primero asegurarse de que existe el curso en el backend
      const courseId = await ensureCourseExists();
      if (!courseId) {
        console.error('No se pudo crear o obtener el curso');
        // Crear módulo localmente como fallback
        const newModule: Module = {
          id: `module-temp-${Date.now()}`,
          title: `Módulo ${course.modules.length + 1}`,
          subtitle: '',
          description: '',
          bannerImg: '',
          components: [],
          order: course.modules.length,
          enableSmartProgress: true // Por defecto activado
        };
        
        setCourse(prev => ({
          ...prev,
          modules: [...prev.modules, newModule]
        }));
        setSelectedModuleId(newModule.id);
        return;
      }

      // Crear datos de la unidad para el backend
      const unitData: CreateUnitData = {
        title: `Módulo ${course.modules.length + 1}`,
        description: '',
        orderIndex: course.modules.length
      };

      // Paso 1: Crear la unidad en el backend
      if (import.meta.env.MODE === 'development') {
        logger.course('Intentando crear unidad en backend con courseId:', courseId);
      }
      const unitResult = await courseService.createUnit(courseId, unitData);
      if (import.meta.env.MODE === 'development') {
        logger.course('Resultado de createUnit:', unitResult);
      }
      
      if (unitResult.success && unitResult.unit && unitResult.unit.id) {
        // Paso 2: Crear el módulo dentro de la unidad
        const moduleData = {
          title: `Módulo ${course.modules.length + 1}`,
          description: '',
          orderIndex: 0 // Primer módulo de esta unidad
        };
        
        if (import.meta.env.MODE === 'development') {
          logger.course('Creando módulo en unidad ID:', unitResult.unit.id);
        }
        const moduleResult = await courseService.createModule(unitResult.unit.id, moduleData);
        if (import.meta.env.MODE === 'development') {
          logger.course('Resultado de createModule:', moduleResult);
        }
        
        if (moduleResult.success && moduleResult.module && moduleResult.module.id) {
          // Crear módulo frontend con el ID real del módulo
          const newModule: Module = {
            id: moduleResult.module.id.toString(),
            title: moduleResult.module.title || moduleData.title,
            subtitle: moduleResult.module.subtitle || '',
            description: moduleResult.module.description || '',
            bannerImg: moduleResult.module.bannerImg || '',
            components: [],
            order: moduleResult.module.order_index || moduleData.orderIndex,
            unitId: unitResult.unit.id, // Guardar referencia a la unidad
            enableSmartProgress: moduleResult.module.enableSmartProgress ?? true
          };
          
          setCourse(prev => ({
            ...prev,
            modules: [...prev.modules, newModule]
          }));
          setSelectedModuleId(newModule.id);
          
          if (import.meta.env.MODE === 'development') {
            logger.success('Módulo creado exitosamente:', { title: newModule.title, id: newModule.id });
          }
        } else {
          console.error('Error creando módulo en backend:', moduleResult.error);
          throw new Error(moduleResult.error || 'No se pudo crear el módulo');
        }
      } else {
        console.error('Error creando unidad en backend:', unitResult.error);
        throw new Error(unitResult.error || 'No se pudo crear la unidad');
      }
    } catch (error) {
      console.error('Error al agregar módulo:', error);
      // Crear módulo localmente como fallback
      const newModule: Module = {
        id: `module-temp-${Date.now()}`,
        title: `Módulo ${course.modules.length + 1}`,
        subtitle: '',
        description: '',
        bannerImg: '',
        components: [],
        order: course.modules.length,
        enableSmartProgress: true
      };
      
      setCourse(prev => ({
        ...prev,
        modules: [...prev.modules, newModule]
      }));
      setSelectedModuleId(newModule.id);
    }
  };

  // Agregar componente a un módulo
  const addComponentLocal = async (type: string, moduleId: string) => {
    const targetModule = course.modules.find(m => m.id === moduleId);
    if (!targetModule) {
      console.error('Módulo no encontrado');
      return;
    }

    try {
      // Si el módulo tiene un ID temporal, crear componente localmente
      if (moduleId.startsWith('module-temp-')) {
        const newComponent: ComponentItem = {
          id: `component-temp-${Date.now()}`,
          type,
          title: `Nuevo ${type}`,
          content: '',
          isMandatory: shouldComponentBeMandatory(type),
          order: targetModule.components.length,
          metadata: {}
        };

        setCourse(prev => ({
          ...prev,
          modules: prev.modules.map(module =>
            module.id === moduleId
              ? { ...module, components: [...module.components, newComponent] }
              : module
          )
        }));
        
        logger.debug(`Componente ${type} creado localmente en módulo temporal`);
        return;
      }

      // Intentar crear en el backend si el módulo tiene ID real
      const getDefaultContentByType = (componentType: string): any => {
        switch (componentType) {
          case 'banner':
            return { title: `Nuevo ${componentType}`, img: '', subtitle: null, description: null };
          case 'video':
            return { title: `Nuevo ${componentType}`, src: '', poster: '', description: null, duration: null, autoplay: false, controls: true };
          case 'reading':
            return { title: `Nuevo ${componentType}`, text: '', format: 'html' };
          case 'image':
            return { title: `Nuevo ${componentType}`, img: '', alt: '', caption: null, description: null };
          case 'document':
            return { title: `Nuevo ${componentType}`, file_url: '', file_name: '', file_type: '', description: null, downloadable: true };
          case 'audio':
            return { title: `Nuevo ${componentType}`, src: '', description: null, duration: null, autoplay: false, controls: true };
          case 'quiz':
            return { title: `Nuevo ${componentType}`, questions: [], passing_score: 70, time_limit: null, attempts_allowed: 3, show_correct_answers: true };
          case 'interactive':
            return { title: `Nuevo ${componentType}`, type: 'generic', data: [], instructions: null };
          default:
            return { title: `Nuevo ${componentType}` };
        }
      };

      const componentData: CreateComponentData = {
        type,
        title: `Nuevo ${type}`,
        content: getDefaultContentByType(type),
        orderIndex: targetModule.components.length,
        metadata: {}
      };

      const result = await courseService.createComponent(parseInt(moduleId), componentData);
      
      if (result.success && result.component) {
        // Crear componente con el ID real del backend
        const newComponent: ComponentItem = {
          id: result.component.id.toString(),
          type: result.component.type,
          title: result.component.title,
          content: result.component.content || '',
          isMandatory: shouldComponentBeMandatory(type),
          order: result.component.orderIndex,
          metadata: result.component.metadata || {}
        };

        setCourse(prev => ({
          ...prev,
          modules: prev.modules.map(module =>
            module.id === moduleId
              ? { ...module, components: [...module.components, newComponent] }
              : module
          )
        }));
        
        logger.course(`Componente ${type} creado en backend`);
      } else {
        // Si falla el backend, crear localmente
        console.error('Error del backend:', result.error);
        const newComponent: ComponentItem = {
          id: `component-temp-${Date.now()}`,
          type,
          title: `Nuevo ${type}`,
          content: '',
          isMandatory: shouldComponentBeMandatory(type),
          order: targetModule.components.length,
          metadata: {}
        };

        setCourse(prev => ({
          ...prev,
          modules: prev.modules.map(module =>
            module.id === moduleId
              ? { ...module, components: [...module.components, newComponent] }
              : module
          )
        }));
      }
    } catch (error) {
      console.error('Error al agregar componente:', error);
      // Crear componente localmente como fallback
      const newComponent: ComponentItem = {
        id: `component-temp-${Date.now()}`,
        type,
        title: `Nuevo ${type}`,
        content: '',
        isMandatory: true,
        order: targetModule.components.length,
        metadata: {}
      };

      setCourse(prev => ({
        ...prev,
        modules: prev.modules.map(module =>
          module.id === moduleId
            ? { ...module, components: [...module.components, newComponent] }
            : module
        )
      }));
    }
  };

  // Mover componente dentro del módulo
  const moveComponent = useCallback((dragIndex: number, dropIndex: number, moduleId: string) => {
    setCourse(prev => ({
      ...prev,
      modules: prev.modules.map(module => {
        if (module.id !== moduleId) return module;
        
        const draggedComponent = module.components[dragIndex];
        const newComponents = [...module.components];
        newComponents.splice(dragIndex, 1);
        newComponents.splice(dropIndex, 0, draggedComponent);
        
        return { ...module, components: newComponents };
      })
    }));
  }, []);

  // Eliminar componente
  // Función para actualizar imagen del banner del módulo
  const handleModuleBannerUpload = async (moduleId: string, file: File) => {
    try {
      const result = await uploadService.uploadFile(file, 'image');
      if (result.success && result.fileUrl) {
        setCourse(prev => ({
          ...prev,
          modules: prev.modules.map(m =>
            m.id === moduleId ? { ...m, bannerImg: result.fileUrl } : m
          )
        }));
        setEditingModuleBanner(null);
      }
    } catch (error) {
      console.error('Error uploading module banner:', error);
    }
  };

  const deleteComponentLocal = async (componentId: string, moduleId: string) => {
    // Si es un componente temporal (no tiene ID numérico), eliminarlo solo localmente
    if (componentId.startsWith('component-temp-')) {
      setCourse(prev => ({
        ...prev,
        modules: prev.modules.map(module =>
          module.id === moduleId
            ? { ...module, components: module.components.filter(c => c.id !== componentId) }
            : module
        )
      }));
      logger.debug('Componente temporal eliminado localmente');
      return;
    }
    
    // Si es un componente real, intentar eliminar del backend
    const numericId = parseInt(componentId);
    if (isNaN(numericId)) {
      console.error('ID de componente inválido:', componentId);
      return;
    }
    
    const result = await deleteComponent(numericId);
    
    if (result.success) {
      setCourse(prev => ({
        ...prev,
        modules: prev.modules.map(module =>
          module.id === moduleId
            ? { ...module, components: module.components.filter(c => c.id !== componentId) }
            : module
        )
      }));
      logger.course('Componente eliminado del backend');
    }
  };

  // Actualizar componente
  const handleComponentUpdate = (updatedComponent: ComponentItem) => {
    setCourse(prev => ({
      ...prev,
      modules: prev.modules.map(module =>
        module.id === editingComponent?.moduleId
          ? {
              ...module,
              components: module.components.map(c =>
                c.id === updatedComponent.id ? updatedComponent : c
              )
            }
          : module
      )
    }));
    setEditingComponent(null);
    logger.course('Componente actualizado:', updatedComponent.title);
  };

  // Agregar actividad
  const addActivity = () => {
    const newActivity: Activity = {
      id: `activity-${Date.now()}`,
      title: `Nueva Actividad`,
      description: '',
      type: 'assignment',
      maxScore: 100,
      weight: 1,
      isMandatory: true,
      order: course.activities.length
    };
    setCourse(prev => ({
      ...prev,
      activities: [...prev.activities, newActivity]
    }));
  };


  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header con botones de acción */}
          <div className="flex justify-between items-center mb-4">
            <div>
              {course.modules.length > 0 && (
                <button
                  onClick={() => {
                    setPreviewCurrentModuleId(course.modules[0].id);
                    setPreviewModuleId(course.modules[0].id);
                    setShowPreview(true);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  title="Vista previa completa del curso"
                >
                  <Eye className="w-4 h-4" />
                  <span>Vista Previa del Curso</span>
                </button>
              )}
            </div>
            
            {/* Indicador de auto-guardado */}
            {currentCourseId && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                    <span>Guardando...</span>
                  </>
                ) : lastSaved ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Guardado hace {getTimeSinceLastSave()}</span>
                  </>
                ) : null}
              </div>
            )}
          </div>
          
          {/* Botón móvil para agregar módulo */}
          <div className="lg:hidden mb-4">
            <Button
              onClick={addModuleLocal}
              disabled={isLoading}
              variant="primary"
              size="lg"
              fullWidth
              loading={isLoading}
              leftIcon={!isLoading ? <Plus className="w-5 h-5" /> : undefined}
            >
              {isLoading ? 'Creando...' : 'Agregar Módulo'}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Panel lateral */}
            <div className="col-span-1 space-y-4">
              {/* Paleta de componentes */}
              <ComponentPalette 
                onAddComponent={addComponentLocal}
                currentModuleId={selectedModuleId}
              />

              {/* Error display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                    <p className="text-sm text-red-700">{error}</p>
                    <button
                      onClick={clearError}
                      className="ml-auto text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Acciones rápidas */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Acciones Rápidas
                </h3>
                <div className="space-y-2">
                  <Button
                    onClick={addModuleLocal}
                    disabled={isLoading}
                    variant="primary"
                    size="md"
                    fullWidth
                    loading={isLoading}
                    leftIcon={!isLoading ? <Plus className="w-4 h-4" /> : undefined}
                  >
                    {isLoading ? 'Creando...' : 'Módulo'}
                  </Button>
                  <Button
                    onClick={addActivity}
                    variant="acent"
                    size="md"
                    fullWidth
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    Actividad
                  </Button>
                </div>
              </div>

              {/* Estadísticas del curso */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Resumen del Curso
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Módulos:</span>
                    <span className="font-medium text-gray-900">
                      {course.modules.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Componentes:</span>
                    <span className="font-medium text-gray-900">
                      {course.modules.reduce((acc, m) => acc + m.components.length, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Actividades:</span>
                    <span className="font-medium text-gray-900">
                      {course.activities.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Área principal de construcción */}
            <div className="col-span-1 lg:col-span-3 space-y-4">
              {/* Módulos */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Módulos del Curso
                </h2>
                {course.modules.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300 p-12 text-center">
                    <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">
                      No hay módulos creados aún
                    </p>
                    <Button
                      onClick={addModuleLocal}
                      disabled={isLoading}
                      variant="primary"
                      size="md"
                    >
                      Crear Primer Módulo
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {course.modules.map((module, moduleIndex) => (
                      <motion.div
                        key={module.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`bg-white rounded-lg shadow-sm border-2 transition-all ${
                          selectedModuleId === module.id
                            ? 'border-primary-500'
                            : 'border-gray-200'
                        }`}
                      >
                        <div
                          className="p-4 cursor-pointer"
                          onClick={() => setSelectedModuleId(module.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <button className="text-gray-400 hover:text-gray-600">
                                <Menu className="w-5 h-5" />
                              </button>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="text"
                                    value={module.title}
                                    onChange={(e) => {
                                      setCourse(prev => ({
                                        ...prev,
                                        modules: prev.modules.map(m =>
                                          m.id === module.id ? { ...m, title: e.target.value } : m
                                        )
                                      }));
                                    }}
                                    className="text-lg font-medium bg-transparent border-none outline-none text-gray-900 flex-1"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingModuleBanner(module.id);
                                    }}
                                    className="text-gray-400 hover:text-blue-500 p-1 rounded transition-colors"
                                    title="Configurar imagen del módulo"
                                  >
                                    <ImageIcon className="w-4 h-4" />
                                  </button>
                                </div>
                                <input
                                  type="text"
                                  value={module.subtitle || ''}
                                  onChange={(e) => {
                                    setCourse(prev => ({
                                      ...prev,
                                      modules: prev.modules.map(m =>
                                        m.id === module.id ? { ...m, subtitle: e.target.value } : m
                                      )
                                    }));
                                  }}
                                  placeholder="Subtítulo del módulo (opcional)"
                                  className="text-sm text-gray-600 bg-transparent border-none outline-none w-full mt-1"
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <input
                                  type="text"
                                  value={module.description}
                                  onChange={(e) => {
                                    setCourse(prev => ({
                                      ...prev,
                                      modules: prev.modules.map(m =>
                                        m.id === module.id ? { ...m, description: e.target.value } : m
                                      )
                                    }));
                                  }}
                                  placeholder="Descripción del módulo"
                                  className="text-sm text-gray-600 bg-transparent border-none outline-none w-full"
                                  onClick={(e) => e.stopPropagation()}
                                />
                                
                                {/* Checkbox para activar/desactivar sistema inteligente */}
                                <div className="flex items-center mt-2 space-x-2">
                                  <input
                                    type="checkbox"
                                    id={`smart-progress-${module.id}`}
                                    checked={module.enableSmartProgress ?? true}
                                    onChange={(e) => {
                                      setCourse(prev => ({
                                        ...prev,
                                        modules: prev.modules.map(m =>
                                          m.id === module.id ? { ...m, enableSmartProgress: e.target.checked } : m
                                        )
                                      }));
                                    }}
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <label 
                                    htmlFor={`smart-progress-${module.id}`}
                                    className="text-[12px] text-gray-600 cursor-pointer"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                  Sistema de prerrequisitos inteligente
                                  </label>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPreviewModuleId(module.id);
                                  setPreviewCurrentModuleId(module.id);
                                  setShowPreview(true);
                                }}
                                className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                                title="Vista previa del módulo"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Mover módulo arriba
                                  if (moduleIndex > 0) {
                                    const newModules = [...course.modules];
                                    [newModules[moduleIndex - 1], newModules[moduleIndex]] = 
                                    [newModules[moduleIndex], newModules[moduleIndex - 1]];
                                    setCourse(prev => ({ ...prev, modules: newModules }));
                                  }
                                }}
                                disabled={moduleIndex === 0}
                                className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                              >
                                <ChevronUp className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Mover módulo abajo
                                  if (moduleIndex < course.modules.length - 1) {
                                    const newModules = [...course.modules];
                                    [newModules[moduleIndex], newModules[moduleIndex + 1]] = 
                                    [newModules[moduleIndex + 1], newModules[moduleIndex]];
                                    setCourse(prev => ({ ...prev, modules: newModules }));
                                  }
                                }}
                                disabled={moduleIndex === course.modules.length - 1}
                                className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                              >
                                <ChevronDown className="w-4 h-4" />
                              </button>
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  const result = await deleteUnit(parseInt(module.id));
                                  
                                  if (result.success) {
                                    setCourse(prev => ({
                                      ...prev,
                                      modules: prev.modules.filter(m => m.id !== module.id)
                                    }));
                                    if (selectedModuleId === module.id) {
                                      setSelectedModuleId(null);
                                    }
                                  }
                                }}
                                className="p-1 text-gray-500 hover:text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Componentes del módulo */}
                        {selectedModuleId === module.id && (
                          <div className="border-t border-gray-200 p-4">
                            <div className="space-y-2">
                              {module.components.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                  <p className="mb-2">No hay componentes en este módulo</p>
                                  <p className="text-sm">Selecciona un componente del panel lateral para agregarlo</p>
                                </div>
                              ) : (
                                module.components.map((component, index) => (
                                  <DraggableComponent
                                    key={component.id}
                                    component={component}
                                    index={index}
                                    moduleId={module.id}
                                    moduleComponents={module.components}
                                    module={module}
                                    moveComponent={moveComponent}
                                    onEdit={() => {
                                      setEditingComponent({ component, moduleId: module.id });
                                    }}
                                    onDelete={() => deleteComponentLocal(component.id, module.id)}
                                    isFinalQuiz={isFinalQuiz}
                                    canActivateFinalQuiz={canActivateFinalQuiz}
                                    getComponentLabel={getComponentLabel}
                                  />
                                ))
                              )}
                            </div>

                            {/* Agregar Quiz al módulo */}
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <Button
                                onClick={() => addComponentLocal(ComponentTypes.QUIZ, module.id)}
                                variant="secondary"
                                size="sm"
                                fullWidth
                                leftIcon={<ClipboardList className="w-4 h-4" />}
                              >
                                Quiz al Módulo
                              </Button>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actividades del Profesor */}
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Actividades Adicionales
                </h2>
                {course.activities.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300 p-12 text-center">
                    <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">
                      No hay actividades creadas aún
                    </p>
                    <Button
                      onClick={addActivity}
                      variant="acent"
                      size="md"
                    >
                      Crear Primera Actividad
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {course.activities.map((activity) => (
                      <div
                        key={activity.id}
                        className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <input
                              type="text"
                              value={activity.title}
                              onChange={(e) => {
                                setCourse(prev => ({
                                  ...prev,
                                  activities: prev.activities.map(a =>
                                    a.id === activity.id ? { ...a, title: e.target.value } : a
                                  )
                                }));
                              }}
                              className="text-lg font-medium bg-transparent border-none outline-none text-gray-900 w-full"
                            />
                            <textarea
                              value={activity.description}
                              onChange={(e) => {
                                setCourse(prev => ({
                                  ...prev,
                                  activities: prev.activities.map(a =>
                                    a.id === activity.id ? { ...a, description: e.target.value } : a
                                  )
                                }));
                              }}
                              placeholder="Descripción de la actividad"
                              className="mt-1 text-sm text-gray-600 bg-transparent border-none outline-none resize-none w-full"
                              rows={2}
                            />
                            <div className="mt-3 flex items-center space-x-4">
                              <select
                                value={activity.type}
                                onChange={(e) => {
                                  setCourse(prev => ({
                                    ...prev,
                                    activities: prev.activities.map(a =>
                                      a.id === activity.id ? { ...a, type: e.target.value as any } : a
                                    )
                                  }));
                                }}
                                className="text-sm bg-gray-50 border border-gray-300 rounded-lg px-3 py-1 text-gray-900"
                              >
                                <option value="assignment">Tarea</option>
                                <option value="project">Proyecto</option>
                                <option value="essay">Ensayo</option>
                                <option value="presentation">Presentación</option>
                              </select>
                              <input
                                type="number"
                                value={activity.maxScore}
                                onChange={(e) => {
                                  setCourse(prev => ({
                                    ...prev,
                                    activities: prev.activities.map(a =>
                                      a.id === activity.id ? { ...a, maxScore: Number(e.target.value) } : a
                                    )
                                  }));
                                }}
                                className="text-sm bg-gray-50 border border-gray-300 rounded-lg px-3 py-1 text-gray-900 w-24"
                                placeholder="Puntaje"
                              />
                              <input
                                type="date"
                                value={activity.dueDate || ''}
                                onChange={(e) => {
                                  setCourse(prev => ({
                                    ...prev,
                                    activities: prev.activities.map(a =>
                                      a.id === activity.id ? { ...a, dueDate: e.target.value } : a
                                    )
                                  }));
                                }}
                                className="text-sm bg-gray-50 border border-gray-300 rounded-lg px-3 py-1 text-gray-900"
                              />
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={activity.isMandatory}
                                  onChange={(e) => {
                                    setCourse(prev => ({
                                      ...prev,
                                      activities: prev.activities.map(a =>
                                        a.id === activity.id ? { ...a, isMandatory: e.target.checked } : a
                                      )
                                    }));
                                  }}
                                  className="mr-2"
                                />
                                <span className="text-sm text-gray-700">Obligatorio</span>
                              </label>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setCourse(prev => ({
                                ...prev,
                                activities: prev.activities.filter(a => a.id !== activity.id)
                              }));
                            }}
                            className="ml-4 p-1 text-gray-500 hover:text-red-600"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Vista Previa */}
      {showPreview && previewModuleId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Vista Previa del Curso
              </h3>
              <button
                onClick={() => {
                  setShowPreview(false);
                  setPreviewModuleId(null);
                  setPreviewCurrentModuleId(null);
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex h-[calc(90vh-120px)]">
              {/* Navegación lateral de módulos */}
              <div className="w-72 bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
                <div className="p-4">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Módulos del Curso ({course.modules.length})
                  </h4>
                  <div className="space-y-2">
                    {course.modules
                      .sort((a, b) => a.order - b.order)
                      .map((module) => (
                        <button
                          key={module.id}
                          onClick={() => setPreviewCurrentModuleId(module.id)}
                          className={`w-full p-3 rounded-lg text-left transition-colors ${
                            previewCurrentModuleId === module.id
                              ? 'bg-blue-100 dark:bg-blue-900 border-l-4 border-blue-500 text-blue-800 dark:text-blue-200'
                              : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {module.title}
                              </p>
                              {module.subtitle && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                                  {module.subtitle}
                                </p>
                              )}
                              <div className="flex items-center mt-2">
                                <span className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
                                  {module.components.length} componentes
                                </span>
                                {module.enableSmartProgress && (
                                  <Shield className="w-3 h-3 text-green-500 ml-2" title="Prerrequisitos inteligentes activados" />
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))
                    }
                  </div>
                  {course.modules.length === 0 && (
                    <div className="text-center py-8">
                      <FolderOpen className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        No hay módulos creados aún
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Área principal de contenido */}
              <div className="flex-1 overflow-y-auto">
                <VideoProvider>
                  {(() => {
                    const currentModule = course.modules.find(m => m.id === previewCurrentModuleId);
                    if (!currentModule) {
                      return (
                        <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-900">
                          <div className="text-center">
                            <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">
                              Selecciona un módulo para ver la vista previa
                            </p>
                            <p className="text-gray-500 dark:text-gray-400">
                              Usa la navegación lateral para explorar el contenido
                            </p>
                          </div>
                        </div>
                      );
                    }
                    
                    return (
                      <div className="bg-gray-50 dark:bg-gray-900 min-h-full">
                        {/* Banner del módulo */}
                        <Banner 
                          img={currentModule.bannerImg ? buildMediaUrl(currentModule.bannerImg, currentCourseId, undefined, 'images') : '/team.jpeg'}
                          title={currentModule.title}
                          subtitle={currentModule.subtitle}
                          description={currentModule.description}
                        />
                        
                        {/* Información del módulo */}
                        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                Módulo {currentModule.order} de {course.modules.length}
                              </span>
                              <span className="text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
                                {currentModule.components.length} componentes
                              </span>
                              {currentModule.enableSmartProgress && (
                                <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full flex items-center">
                                  <Shield className="w-3 h-3 mr-1" />
                                  Prerrequisitos activados
                                </span>
                              )}
                            </div>
                            
                            {/* Navegación rápida */}
                            <div className="flex items-center space-x-2">
                              {(() => {
                                const currentIndex = course.modules.findIndex(m => m.id === previewCurrentModuleId);
                                const prevModule = currentIndex > 0 ? course.modules[currentIndex - 1] : null;
                                const nextModule = currentIndex < course.modules.length - 1 ? course.modules[currentIndex + 1] : null;
                                
                                return (
                                  <>
                                    <button
                                      onClick={() => prevModule && setPreviewCurrentModuleId(prevModule.id)}
                                      disabled={!prevModule}
                                      className="p-1 text-gray-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                      title="Módulo anterior"
                                    >
                                      <ChevronUp className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => nextModule && setPreviewCurrentModuleId(nextModule.id)}
                                      disabled={!nextModule}
                                      className="p-1 text-gray-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                      title="Módulo siguiente"
                                    >
                                      <ChevronDown className="w-4 h-4" />
                                    </button>
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                        </div>
                        
                        {/* Componentes del módulo */}
                        {currentModule.components.length === 0 ? (
                          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                            <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-lg mb-2">Este módulo no tiene componentes aún</p>
                            <p>Agrega contenido desde el constructor para ver la vista previa</p>
                          </div>
                        ) : (
                          currentModule.components
                            .sort((a, b) => a.order - b.order)
                            .map((component) => (
                              <div key={`preview-${component.id}`}>
                                {renderComponentPreview(component)}
                              </div>
                            ))
                        )}
                      </div>
                    );
                  })()}
                </VideoProvider>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de edición de componente */}
      {editingComponent && (
        <SpecificComponentModal
          component={editingComponent.component}
          moduleId={editingComponent.moduleId}
          onSave={handleComponentUpdate}
          onCancel={() => setEditingComponent(null)}
        />
      )}

      {/* Modal de configuración de imagen del módulo */}
      {editingModuleBanner && (() => {
        const editingModule = course.modules.find(m => m.id === editingModuleBanner);
        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Configurar imagen del módulo
                  </h3>
                  <button
                    onClick={() => setEditingModuleBanner(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {editingModule?.title}
                </p>
              </div>
              
              <div className="p-6 space-y-4">
                {editingModule?.bannerImg ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <img
                        src={buildMediaUrl(editingModule.bannerImg, currentCourseId, undefined, 'images')}
                        alt="Banner actual"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => {
                          setCourse(prev => ({
                            ...prev,
                            modules: prev.modules.map(m =>
                              m.id === editingModuleBanner ? { ...m, bannerImg: '' } : m
                            )
                          }));
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No hay imagen configurada
                  </p>
                )}
                
                <div>
                  <input
                    type="file"
                    id="module-banner-upload"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && editingModuleBanner) {
                        handleModuleBannerUpload(editingModuleBanner, file);
                      }
                    }}
                    className="hidden"
                  />
                  <label
                    htmlFor="module-banner-upload"
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    {editingModule?.bannerImg ? 'Cambiar imagen' : 'Subir imagen'}
                  </label>
                </div>
                
                <p className="text-xs text-gray-500">
                  Recomendado: 1200x400px, JPG/PNG, máximo 5MB
                </p>
              </div>
            </div>
          </div>
        );
      })()}
    </DndProvider>
  );
};

export default TeacherCourseBuilder;