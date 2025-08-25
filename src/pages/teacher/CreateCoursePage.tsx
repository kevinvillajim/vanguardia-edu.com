import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../shared/store/authStore';
import { DashboardLayout } from '../../shared/layouts/dashboard/DashboardLayout';
import { TeacherCourseBuilder } from '../../features/courses/components/TeacherCourseBuilder/TeacherCourseBuilder';
import { Card, Button } from '../../shared/components';
import { 
  Hammer, Eye, Settings, X, Shield, ChevronUp, ChevronDown, FolderOpen, Plus, 
  Trash2, Upload, Image as ImageIcon, Save, AlertCircle, CheckCircle, 
  BookOpen, Target, Star, Clock, Users, Globe, Lock, Zap
} from 'lucide-react';
import { logger } from '../../shared/utils/logger';
import Banner from '../../features/courses/components/Banner';
import Video, { VideoProvider } from '../../features/courses/components/Video';
import Paragraph from '../../features/courses/components/Paragraph';
import Image from '../../features/courses/components/Image';
import Quiz from '../../features/courses/components/Quiz';
import Document from '../../features/courses/components/Document';
import { AudioPlayer } from '../../shared/components/media/AudioPlayer';
import { buildMediaUrl } from '../../shared/utils/mediaUtils';

export interface CourseData {
  title: string;
  description: string;
  category_id: number | null;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  banner_image?: string;
  learning_objectives: string[];
  prerequisites: string[];
  modules: ModuleData[];
}

export interface ModuleData {
  id?: number;
  title: string;
  description: string;
  order: number;
  lessons: LessonData[];
}

export interface LessonData {
  id?: number;
  title: string;
  description: string;
  type: 'video' | 'text' | 'quiz' | 'interactive';
  duration_minutes: number;
  order: number;
  is_preview: boolean;
  content: LessonContent[];
}

export interface LessonContent {
  id?: number;
  type: 'text' | 'video' | 'image' | 'quiz' | 'code' | 'interactive';
  content: any;
  order: number;
}

const TABS = [
  { id: 'builder', label: 'Constructor', icon: Hammer },
  { id: 'preview', label: 'Vista Previa', icon: Eye },
  { id: 'settings', label: 'Configuración', icon: Settings }
] as const;

type TabId = typeof TABS[number]['id'];

export const CreateCoursePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [activeTab, setActiveTab] = useState<TabId>('builder');
  const [courseData, setCourseData] = useState<CourseData>({
    title: '',
    description: '',
    category_id: null,
    difficulty_level: 'beginner',
    learning_objectives: [],
    prerequisites: [],
    modules: []
  });
  
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [previewCurrentModuleId, setPreviewCurrentModuleId] = useState<string | null>(null);
  const [builderData, setBuilderData] = useState<any>(null); // Datos reales del constructor
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [categories, setCategories] = useState([
    { id: 1, name: 'Desarrollo y Programación' },
    { id: 2, name: 'Habilidades Técnicas' },
    { id: 3, name: 'Habilidades Blandas' },
    { id: 4, name: 'Liderazgo y Gestión' },
    { id: 5, name: 'Procesos Empresariales' },
    { id: 6, name: 'Seguridad y Compliance' },
    { id: 7, name: 'Recursos Humanos' },
    { id: 8, name: 'Herramientas y Software' }
  ]); // Categorías para cursos empresarial
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Inicializar el primer módulo cuando se cambia a vista previa
  useEffect(() => {
    if (activeTab === 'preview' && builderData?.modules?.length > 0 && !previewCurrentModuleId) {
      setPreviewCurrentModuleId(builderData.modules[0].id);
    }
  }, [activeTab, builderData?.modules?.length, previewCurrentModuleId]);

  // Auto-save functionality
  useEffect(() => {
    if (isDirty && courseData.title) {
      const timer = setTimeout(() => {
        saveDraft();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [courseData, isDirty]);

  // Warn before leaving if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const saveDraft = async () => {
    if (!courseData.title) return;
    
    setSaving(true);
    try {
      localStorage.setItem('course_draft', JSON.stringify(courseData));
      setIsDirty(false);
    } catch (error) {
      console.error('Error saving draft:', error);
    } finally {
      setSaving(false);
    }
  };

  const loadDraft = () => {
    try {
      const draft = localStorage.getItem('course_draft');
      if (draft) {
        const parsedDraft = JSON.parse(draft);
        setCourseData(parsedDraft);
      }
    } catch (error) {
      console.error('Error loading draft:', error);
    }
  };

  const validateCourse = (): string[] => {
    const errors: string[] = [];
    
    if (!courseData.title.trim()) {
      errors.push('El título del curso es obligatorio');
    }
    
    if (!courseData.description.trim()) {
      errors.push('La descripción del curso es obligatoria');
    }
    
    if (courseData.modules.length === 0) {
      errors.push('El curso debe tener al menos un módulo');
    }
    
    courseData.modules.forEach((module, moduleIndex) => {
      if (!module.title.trim()) {
        errors.push(`El módulo ${moduleIndex + 1} debe tener un título`);
      }
      
      if (module.lessons.length === 0) {
        errors.push(`El módulo "${module.title}" debe tener al menos una lección`);
      }
      
      module.lessons.forEach((lesson, lessonIndex) => {
        if (!lesson.title.trim()) {
          errors.push(`La lección ${lessonIndex + 1} del módulo "${module.title}" debe tener un título`);
        }
        
        if (lesson.content.length === 0) {
          errors.push(`La lección "${lesson.title}" debe tener contenido`);
        }
      });
    });
    
    return errors;
  };

  const handlePublish = () => {
    const errors = validateCourse();
    setValidationErrors(errors);
    
    if (errors.length === 0) {
      setShowPublishModal(true);
    }
  };

  const handleSaveAndExit = async () => {
    await saveDraft();
    navigate('/teacher/dashboard');
  };

  const updateCourseData = (updates: Partial<CourseData>) => {
    setCourseData(prev => ({ ...prev, ...updates }));
    setIsDirty(true);
  };

  // Manejar subida de banner
  const handleBannerUpload = async (file: File) => {
    if (!file) return;
    
    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('Solo se permiten archivos de imagen');
      return;
    }
    
    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no puede ser mayor a 5MB');
      return;
    }
    
    setUploadingBanner(true);
    try {
      // Simular subida de archivo - en la app real usarías uploadService
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Crear URL temporal para previsualización
      const imageUrl = URL.createObjectURL(file);
      updateCourseData({ banner_image: imageUrl });
      
      logger.info('Banner uploaded successfully');
    } catch (error) {
      logger.error('Error uploading banner:', error);
      alert('Error al subir la imagen');
    } finally {
      setUploadingBanner(false);
    }
  };

  // Validar configuración completa
  const validateSettings = (): string[] => {
    const errors: string[] = [];
    
    if (!courseData.title.trim()) {
      errors.push('El título del curso es obligatorio');
    }
    
    if (!courseData.description.trim()) {
      errors.push('La descripción del curso es obligatoria');
    }
    
    if (courseData.description.length < 50) {
      errors.push('La descripción debe tener al menos 50 caracteres');
    }
    
    
    if (courseData.learning_objectives.length === 0) {
      errors.push('Debe definir al menos un objetivo de aprendizaje');
    }
    
    if (courseData.learning_objectives.some(obj => !obj.trim())) {
      errors.push('Los objetivos de aprendizaje no pueden estar vacíos');
    }
    
    return errors;
  };

  // Funciones para manejar categorías
  const addNewCategory = () => {
    if (newCategoryName.trim()) {
      const newId = Math.max(...categories.map(c => c.id)) + 1;
      const newCategory = { id: newId, name: newCategoryName.trim() };
      setCategories([...categories, newCategory]);
      setCourseData({ ...courseData, category_id: newId });
      setNewCategoryName('');
      setShowNewCategoryInput(false);
    }
  };

  const cancelNewCategory = () => {
    setNewCategoryName('');
    setShowNewCategoryInput(false);
  };

  // Guardar configuración
  const saveSettings = async () => {
    const errors = validateSettings();
    setValidationErrors(errors);
    
    if (errors.length > 0) {
      return;
    }
    
    setSaving(true);
    try {
      await saveDraft();
      logger.info('Course settings saved successfully');
      // Mostrar notificación de éxito
    } catch (error) {
      logger.error('Error saving settings:', error);
      alert('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  // Función para renderizar componentes reales del constructor
  const renderBuilderComponent = (component: any) => {
    const key = `component-${component.id}`;
    
    const getMediaUrl = (fileUrl: string | undefined, mediaType: 'images' | 'videos' | 'documents' | 'audio' = 'images') => {
      if (!fileUrl) return '';
      return buildMediaUrl(fileUrl, null, undefined, mediaType);
    };

    switch (component.type) {
      case 'banner':
        return (
          <Banner
            key={key}
            img={getMediaUrl(component.content?.img || component.fileUrl, 'images')}
            title={component.content?.title || component.title || 'Banner del Módulo'}
            subtitle={component.content?.subtitle}
            description={component.content?.description}
          />
        );
      
      case 'video':
        const videoSrc = getMediaUrl(component.content?.src || component.fileUrl, 'videos');
        const posterSrc = getMediaUrl(component.content?.poster, 'images');
        return (
          <Video
            key={key}
            src={videoSrc}
            poster={posterSrc}
            title={component.content?.title || component.title || 'Video de Ejemplo'}
            description={component.content?.description}
            duration={component.content?.duration || component.duration}
            autoplay={component.content?.autoplay || false}
            controls={component.content?.controls !== false}
          />
        );
      
      case 'reading':
        return (
          <Paragraph
            key={key}
            title={component.content?.title || component.title || 'Contenido de Lectura'}
            text={component.content?.text || component.content || 'Contenido de texto...'}
            format={component.content?.format || 'html'}
          />
        );
      
      case 'image':
        const imageSrc = getMediaUrl(component.content?.img || component.fileUrl, 'images');
        return (
          <Image
            key={key}
            img={imageSrc}
            alt={component.content?.alt || component.title || 'Imagen'}
            caption={component.content?.caption}
            description={component.content?.description}
          />
        );
      
      case 'document':
        const documentUrl = getMediaUrl(component.content?.file_url || component.fileUrl, 'documents');
        return (
          <Document
            key={key}
            title={component.content?.title || component.title || 'Documento'}
            fileUrl={documentUrl}
            fileName={component.content?.file_name || 'documento.pdf'}
            fileType={component.content?.file_type || 'application/pdf'}
            description={component.content?.description}
            downloadable={component.content?.downloadable !== false}
          />
        );
      
      case 'audio':
        const audioSrc = getMediaUrl(component.content?.src || component.fileUrl, 'audio');
        return (
          <div key={key} className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              {component.content?.title || component.title || 'Audio'}
            </h3>
            {component.content?.description && (
              <p className="text-gray-600 mb-4">{component.content.description}</p>
            )}
            <AudioPlayer
              src={audioSrc}
              title={component.content?.title || component.title || 'Audio'}
              duration={component.content?.duration || component.duration}
              autoPlay={component.content?.autoplay || false}
              showControls={component.content?.controls !== false}
            />
          </div>
        );
      
      case 'quiz':
        return (
          <Quiz
            key={key}
            title={component.content?.title || component.title || 'Quiz Interactivo'}
            questions={component.content?.questions || []}
            passingScore={component.content?.passing_score || 70}
            timeLimit={component.content?.time_limit}
            attemptsAllowed={component.content?.attempts_allowed || 3}
            showCorrectAnswers={component.content?.show_correct_answers !== false}
          />
        );
      
      default:
        return (
          <div key={key} className="p-6 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500 text-center">
              Componente de tipo "{component.type}" - En desarrollo
            </p>
          </div>
        );
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'builder':
        return (
          <TeacherCourseBuilder 
            courseData={courseData}
            onUpdate={updateCourseData}
            validationErrors={validationErrors}
            onBuilderDataChange={setBuilderData}
          />
        );
      case 'preview':
        return (
          <VideoProvider>
            <div className="h-full flex">
              {/* Navegación lateral de módulos */}
              <div className="w-72 bg-gray-100 border-r border-gray-200 overflow-y-auto">
                <div className="p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">
                    Módulos del Curso ({builderData?.modules?.length || 0})
                  </h4>
                  <div className="space-y-2">
                    {builderData?.modules
                      ?.sort((a: any, b: any) => a.order - b.order)
                      .map((module: any, index: number) => (
                        <button
                          key={module.id}
                          onClick={() => setPreviewCurrentModuleId(module.id)}
                          className={`w-full p-3 rounded-lg text-left transition-colors ${
                            previewCurrentModuleId === module.id
                              ? 'bg-blue-100 border-l-4 border-blue-500 text-blue-800'
                              : 'bg-white hover:bg-gray-50 text-gray-800'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {module.title || `Módulo ${index + 1}`}
                              </p>
                              {module.subtitle && (
                                <p className="text-xs text-gray-500 mt-1 truncate">
                                  {module.subtitle}
                                </p>
                              )}
                              <div className="flex items-center mt-2">
                                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                                  {module.components?.length || 0} componentes
                                </span>
                                {module.enableSmartProgress && (
                                  <Shield className="w-3 h-3 text-green-500 ml-2" title="Prerrequisitos activados" />
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      )) || []
                    }
                  </div>
                  {!builderData?.modules?.length && (
                    <div className="text-center py-8">
                      <FolderOpen className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">
                        No hay módulos creados aún
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Ve a la pestaña Constructor para agregar contenido
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Área principal de contenido */}
              <div className="flex-1 overflow-y-auto bg-gray-50">
                {(() => {
                  if (!builderData?.modules?.length) {
                    return (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center max-w-md">
                          <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-600 mb-2">
                            Tu curso está vacío
                          </h3>
                          <p className="text-gray-500 mb-4">
                            Para ver la vista previa, primero agrega algunos módulos y contenido desde la pestaña Constructor.
                          </p>
                          <Button
                            onClick={() => setActiveTab('builder')}
                            variant="primary"
                            leftIcon={<Hammer className="w-4 h-4" />}
                          >
                            Ir al Constructor
                          </Button>
                        </div>
                      </div>
                    );
                  }
                  
                  const currentModule = builderData.modules.find((m: any) => m.id === previewCurrentModuleId);
                  
                  if (!currentModule) {
                    return (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-lg font-medium text-gray-600 mb-2">
                            Selecciona un módulo para ver la vista previa
                          </p>
                          <p className="text-gray-500">
                            Usa la navegación lateral para explorar el contenido
                          </p>
                        </div>
                      </div>
                    );
                  }
                  
                  return (
                    <div className="min-h-full bg-gray-50">
                      {/* Banner del módulo */}
                      <Banner 
                        img={currentModule.bannerImg ? buildMediaUrl(currentModule.bannerImg, null, undefined, 'images') : '/team.jpeg'}
                        title={currentModule.title}
                        subtitle={currentModule.subtitle}
                        description={currentModule.description}
                      />
                      
                      {/* Información del módulo */}
                      <div className="bg-white border-b border-gray-200 px-6 py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600">
                              Módulo {currentModule.order} de {builderData.modules.length}
                            </span>
                            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              {currentModule.components?.length || 0} componentes
                            </span>
                            {currentModule.enableSmartProgress && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full flex items-center">
                                <Shield className="w-3 h-3 mr-1" />
                                Prerrequisitos activados
                              </span>
                            )}
                          </div>
                          
                          {/* Navegación rápida */}
                          <div className="flex items-center space-x-2">
                            {(() => {
                              const currentIndex = builderData.modules.findIndex((m: any) => m.id === previewCurrentModuleId);
                              const prevModule = currentIndex > 0 ? builderData.modules[currentIndex - 1] : null;
                              const nextModule = currentIndex < builderData.modules.length - 1 ? builderData.modules[currentIndex + 1] : null;
                              
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
                      {!currentModule.components?.length ? (
                        <div className="p-12 text-center text-gray-500">
                          <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-lg mb-2">Este módulo no tiene componentes aún</p>
                          <p>Agrega contenido desde el constructor para ver la vista previa</p>
                          <Button
                            onClick={() => setActiveTab('builder')}
                            variant="outline"
                            className="mt-4"
                            leftIcon={<Hammer className="w-4 h-4" />}
                          >
                            Agregar Contenido
                          </Button>
                        </div>
                      ) : (
                        currentModule.components
                          .sort((a: any, b: any) => a.order - b.order)
                          .map((component: any) => (
                            <div key={`preview-${component.id}`}>
                              {renderBuilderComponent(component)}
                            </div>
                          ))
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          </VideoProvider>
        );
      case 'settings':
        return (
          <div className="max-w-4xl mx-auto p-6 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Configuración del Curso</h2>
                <p className="text-gray-600 mt-1">Configura la información básica y detalles de tu curso</p>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button
                  onClick={saveSettings}
                  variant="primary"
                  disabled={saving}
                  leftIcon={saving ? undefined : <Save className="w-4 h-4" />}
                  loading={saving}
                >
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </div>
            </div>

            {/* Errores de validación */}
            {validationErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-red-800">Errores en la configuración</h3>
                    <ul className="mt-2 text-sm text-red-700 space-y-1">
                      {validationErrors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Imagen de banner */}
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center mb-4">
                <ImageIcon className="w-5 h-5 text-gray-600 mr-2" />
                <h3 className="text-lg font-semibold">Imagen del Curso</h3>
              </div>
              
              <div className="space-y-4">
                {courseData.banner_image ? (
                  <div className="relative">
                    <img
                      src={courseData.banner_image}
                      alt="Banner del curso"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => updateCourseData({ banner_image: undefined })}
                      className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                      title="Eliminar imagen"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Sube una imagen atractiva para tu curso</p>
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleBannerUpload(e.target.files[0])}
                        className="hidden"
                        disabled={uploadingBanner}
                      />
                      <Button
                        variant="outline"
                        disabled={uploadingBanner}
                        leftIcon={uploadingBanner ? undefined : <Upload className="w-4 h-4" />}
                        loading={uploadingBanner}
                        as="span"
                      >
                        {uploadingBanner ? 'Subiendo...' : 'Seleccionar Imagen'}
                      </Button>
                    </label>
                  </div>
                )}
                <p className="text-sm text-gray-500">
                  Recomendado: 1920x1080px, máximo 5MB. Formatos: JPG, PNG, WebP
                </p>
              </div>
            </div>

            {/* Información básica */}
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center mb-6">
                <BookOpen className="w-5 h-5 text-gray-600 mr-2" />
                <h3 className="text-lg font-semibold">Información Básica</h3>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título del curso *
                  </label>
                  <input
                    type="text"
                    value={courseData.title}
                    onChange={(e) => updateCourseData({ title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Curso de Seguridad Informática"
                    maxLength={100}
                  />
                  <div className="flex justify-between mt-1">
                    <p className="text-xs text-gray-500">Un título claro y descriptivo para el curso</p>
                    <span className="text-xs text-gray-400">{courseData.title.length}/100</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción de la ción *
                  </label>
                  <textarea
                    value={courseData.description}
                    onChange={(e) => updateCourseData({ description: e.target.value })}
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Describe qué habilidades desarrollarán los usuarios, qué temas se cubrirán y cómo se beneficiarán"
                    maxLength={1000}
                  />
                  <div className="flex justify-between mt-1">
                    <p className="text-xs text-gray-500">
                      Mínimo 50 caracteres. Describe claramente el valor del curso.
                    </p>
                    <span className="text-xs text-gray-400">{courseData.description.length}/1000</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoría del curso
                    </label>
                    <div className="space-y-2">
                      <select
                        value={courseData.category_id || ''}
                        onChange={(e) => updateCourseData({ category_id: e.target.value ? parseInt(e.target.value) : null })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Seleccionar categoría</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                      </select>
                      
                      {!showNewCategoryInput ? (
                        <button
                          type="button"
                          onClick={() => setShowNewCategoryInput(true)}
                          className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Añadir nueva categoría
                        </button>
                      ) : (
                        <div className="border border-gray-300 rounded-lg p-3 bg-gray-50">
                          <label className="block text-xs font-medium text-gray-700 mb-2">
                            Nueva categoría
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newCategoryName}
                              onChange={(e) => setNewCategoryName(e.target.value)}
                              placeholder="Nombre de la categoría"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  addNewCategory();
                                } else if (e.key === 'Escape') {
                                  cancelNewCategory();
                                }
                              }}
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={addNewCategory}
                              disabled={!newCategoryName.trim()}
                              className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={cancelNewCategory}
                              className="px-3 py-2 bg-gray-400 text-white rounded text-sm hover:bg-gray-500"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nivel de dificultad *
                    </label>
                    <select
                      value={courseData.difficulty_level}
                      onChange={(e) => updateCourseData({ difficulty_level: e.target.value as any })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="beginner">🟢 Principiante</option>
                      <option value="intermediate">🟡 Intermedio</option>
                      <option value="advanced">🔴 Avanzado</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Objetivos de aprendizaje */}
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center mb-6">
                <Target className="w-5 h-5 text-gray-600 mr-2" />
                <h3 className="text-lg font-semibold">Objetivos de Aprendizaje</h3>
              </div>
              
              <p className="text-gray-600 mb-4">
                Define qué habilidades específicas desarrollarán los usuarios al completar este curso.
              </p>
              
              <div className="space-y-3">
                {courseData.learning_objectives.map((objective, index) => (
                  <div key={index} className="flex items-start space-x-3 group">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mt-2">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={objective}
                        onChange={(e) => {
                          const newObjectives = [...courseData.learning_objectives];
                          newObjectives[index] = e.target.value;
                          updateCourseData({ learning_objectives: newObjectives });
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ej: Implementar protocolos de seguridad en sus puestos de trabajo"
                        maxLength={150}
                      />
                    </div>
                    <button
                      onClick={() => {
                        const newObjectives = courseData.learning_objectives.filter((_, i) => i !== index);
                        updateCourseData({ learning_objectives: newObjectives });
                      }}
                      className="flex-shrink-0 p-2 text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                      title="Eliminar objetivo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                {courseData.learning_objectives.length < 8 && (
                  <button
                    onClick={() => updateCourseData({ 
                      learning_objectives: [...courseData.learning_objectives, ''] 
                    })}
                    className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar objetivo de aprendizaje
                  </button>
                )}
                
                {courseData.learning_objectives.length === 0 && (
                  <div className="text-center py-6 text-gray-500">
                    <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p>Agrega al menos un objetivo de aprendizaje</p>
                  </div>
                )}
              </div>
            </div>

            {/* Prerrequisitos */}
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center mb-6">
                <CheckCircle className="w-5 h-5 text-gray-600 mr-2" />
                <h3 className="text-lg font-semibold">Prerrequisitos</h3>
              </div>
              
              <p className="text-gray-600 mb-4">
                Define qué conocimientos o habilidades previas necesitan los usuarios (opcional).
              </p>
              
              <div className="space-y-3">
                {courseData.prerequisites.map((prerequisite, index) => (
                  <div key={index} className="flex items-start space-x-3 group">
                    <div className="flex-shrink-0 w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-medium mt-2">
                      ✓
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={prerequisite}
                        onChange={(e) => {
                          const newPrerequisites = [...courseData.prerequisites];
                          newPrerequisites[index] = e.target.value;
                          updateCourseData({ prerequisites: newPrerequisites });
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ej: Experiencia básica con herramientas de oficina"
                        maxLength={100}
                      />
                    </div>
                    <button
                      onClick={() => {
                        const newPrerequisites = courseData.prerequisites.filter((_, i) => i !== index);
                        updateCourseData({ prerequisites: newPrerequisites });
                      }}
                      className="flex-shrink-0 p-2 text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                      title="Eliminar prerrequisito"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                {courseData.prerequisites.length < 5 && (
                  <button
                    onClick={() => updateCourseData({ 
                      prerequisites: [...courseData.prerequisites, ''] 
                    })}
                    className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-orange-500 hover:text-orange-600 transition-colors flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar prerrequisito
                  </button>
                )}

                {courseData.prerequisites.length === 0 && (
                  <div className="text-center py-6 text-gray-400">
                    <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p>No hay prerrequisitos definidos</p>
                    <p className="text-sm">El curso será accesible para todos</p>
                  </div>
                )}
              </div>
            </div>

            {/* Resumen del curso */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
              <div className="flex items-center mb-4">
                <Star className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-blue-900">Resumen del Curso</h3>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <BookOpen className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{builderData?.modules?.length || 0}</div>
                  <div className="text-sm text-gray-600">Módulos</div>
                </div>
                
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <Zap className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">
                    {builderData?.modules?.reduce((total: number, module: any) => 
                      total + (module.components?.length || 0), 0) || 0}
                  </div>
                  <div className="text-sm text-gray-600">Componentes</div>
                </div>
                
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <Target className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{courseData.learning_objectives.length}</div>
                  <div className="text-sm text-gray-600">Objetivos</div>
                </div>
                
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <Globe className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">
                    {courseData.difficulty_level === 'beginner' ? '🟢' : 
                     courseData.difficulty_level === 'intermediate' ? '🟡' : '🔴'}
                  </div>
                  <div className="text-sm text-gray-600 capitalize">{courseData.difficulty_level}</div>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-white rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Estado del curso:</span>
                  <span className={`font-medium ${
                    courseData.title && courseData.description && courseData.learning_objectives.length > 0
                      ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    {courseData.title && courseData.description && courseData.learning_objectives.length > 0
                      ? '✅ Configuración completa' : '⚠️ Configuración pendiente'}
                  </span>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-between items-center pt-6 border-t">
              <Button
                onClick={() => setActiveTab('builder')}
                variant="outline"
                leftIcon={<Hammer className="w-4 h-4" />}
              >
                Volver al Constructor
              </Button>
              
              <div className="flex space-x-3">
                <Button
                  onClick={() => setActiveTab('preview')}
                  variant="outline"
                  leftIcon={<Eye className="w-4 h-4" />}
                >
                  Vista Previa
                </Button>
                
                <Button
                  onClick={saveSettings}
                  variant="primary"
                  disabled={saving}
                  leftIcon={saving ? undefined : <Save className="w-4 h-4" />}
                  loading={saving}
                >
                  {saving ? 'Guardando...' : 'Guardar y Continuar'}
                </Button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Load draft on component mount
  useEffect(() => {
    loadDraft();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/teacher/dashboard')}
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                }
              >
                Volver
              </Button>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {courseData.title || 'Nuevo Curso'}
                </h1>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>Instructor: {user?.name}</span>
                  {saving && (
                    <>
                      <span>•</span>
                      <span className="text-primary-600">Guardando...</span>
                    </>
                  )}
                  {isDirty && !saving && (
                    <>
                      <span>•</span>
                      <span className="text-acent-600">Cambios sin guardar</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveAndExit}
                loading={saving}
              >
                Guardar y Salir
              </Button>
              
              <Button
                variant="primary"
                size="sm"
                onClick={handlePublish}
                disabled={!courseData.title || courseData.modules.length === 0}
              >
                Publicar Curso
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 border-b border-gray-200">
            {TABS.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                whileHover={{ y: -1 }}
                whileTap={{ y: 0 }}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Validation Errors */}
        <AnimatePresence>
          {validationErrors.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-red-50 border border-red-200 rounded-lg"
            >
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-medium text-red-900 mb-1">
                      Errores de validación:
                    </h4>
                    <ul className="text-sm text-red-700 space-y-1">
                      {validationErrors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setValidationErrors([])}
                    className="ml-auto text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[600px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Publish Modal */}
        <AnimatePresence>
          {showPublishModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              onClick={() => setShowPublishModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold mb-4">Publicar Curso</h3>
                <p className="text-gray-600 mb-6">
                  ¿Estás seguro de que quieres publicar este curso? Una vez publicado, estará disponible para todos los estudiantes.
                </p>
                <div className="flex gap-3 justify-end">
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowPublishModal(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    variant="primary" 
                    onClick={() => {
                      logger.course('Publishing course:', courseData);
                      navigate('/teacher/dashboard');
                    }}
                  >
                    Publicar Curso
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default CreateCoursePage;