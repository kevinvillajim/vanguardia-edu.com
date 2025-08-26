import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { debounce } from 'lodash';
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
import { courseService } from '../../services/courseService';

// Importar tipos del domain
import { Course, CourseUnit, CourseModule, CourseComponent, CreateCourseData, CourseStatus } from '../../domain/entities/Course';
import { CourseDifficulty } from '../../shared/types';
import { useCategories } from '../../hooks/useCategories';
import { useCourseValidation } from '../../hooks/useValidation';
import { CourseValidator } from '../../shared/validation';
import { useHybridAutoSave } from '../../hooks/useHybridAutoSave';
import { Loader } from 'lucide-react';
import { FileUploadSection } from '../../features/courses/components/ComponentEditor/shared/FileUploadSection';
import { CoursePreviewModal } from '../../shared/components/CoursePreviewModal/CoursePreviewModal';

// Interface específica para el formulario de configuración
export interface CourseFormData extends Omit<CreateCourseData, 'categoryId'> {
  categoryId: number | null; // Permite null para "sin categoría"
  learningObjectives: string[]; // Requerido en el form
  prerequisites: string[]; // Requerido en el form
}

// Usar las entidades del domain directamente
export type CourseBuilderData = Course;
export type UnitData = CourseUnit;
export type ModuleData = CourseModule;
export type ComponentData = CourseComponent;

const TABS = [
  { id: 'settings', label: 'Configuración', icon: Settings },
  { id: 'builder', label: 'Constructor', icon: Hammer },
  { id: 'preview', label: 'Vista Previa', icon: Eye }
] as const;

type TabId = typeof TABS[number]['id'];

export const CreateCoursePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [activeTab, setActiveTab] = useState<TabId>('settings');
  const [courseData, setCourseData] = useState<CourseFormData>({
    title: '',
    description: '',
    categoryId: null,
    difficulty_level: CourseDifficulty.BEGINNER,
    duration_hours: 0,
    bannerImage: undefined,
    learningObjectives: [],
    prerequisites: []
  });
  
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [courseCreated, setCourseCreated] = useState(false);
  const [currentCourseId, setCurrentCourseId] = useState<number | null>(null);
  
  // Sistema de auto-guardado híbrido
  const autoSave = useHybridAutoSave({
    courseId: currentCourseId,
    enabled: courseCreated, // Solo activar después de crear el curso
    onSaveSuccess: () => {
      logger.success('✅ Borrador guardado automáticamente');
      setIsDirty(false);
    },
    onSaveError: (error) => {
      logger.error('❌ Error guardando borrador:', error);
    }
  });
  // Sistema de validación centralizado
  const courseValidation = useCourseValidation({
    title: courseData.title,
    description: courseData.description,
    difficulty_level: courseData.difficulty_level,
    duration_hours: courseData.duration_hours,
    learningObjectives: courseData.learningObjectives,
    prerequisites: courseData.prerequisites
  });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [previewCurrentModuleId, setPreviewCurrentModuleId] = useState<string | null>(null);
  const [builderData, setBuilderData] = useState<any>(null); // Datos reales del constructor
  // Cargar categorías desde el backend
  const { 
    categories, 
    loading: categoriesLoading, 
    error: categoriesError,
    createCategory 
  } = useCategories({ 
    isActive: true,
    sortBy: 'name',
    sortDirection: 'asc'
  }, 'teacher');
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);

  // Inicializar el primer módulo cuando se cambia a vista previa
  // Función para sincronizar datos básicos del curso con el backend (con debounce)
  const updateCourseBasicDataDebounced = useRef(
    debounce(async (courseId: number, courseData: any) => {
      try {
        await courseService.updateCourse(courseId, {
          title: courseData.title,
          description: courseData.description,
          shortDescription: courseData.shortDescription,
          difficulty_level: courseData.difficulty_level,
          duration_hours: courseData.duration_hours,
          bannerImage: courseData.bannerImage,
          learningObjectives: courseData.learningObjectives,
          prerequisites: courseData.prerequisites,
          categoryId: courseData.categoryId
        });

        logger.debug('✅ Datos básicos del curso actualizados');
      } catch (error) {
        logger.error('❌ Error actualizando datos básicos del curso:', error);
      }
    }, 2000) // 2 segundos de debounce
  ).current;

  const updateCourseBasicData = useCallback(() => {
    if (!currentCourseId || !courseCreated) return;
    updateCourseBasicDataDebounced(currentCourseId, courseData);
  }, [currentCourseId, courseCreated, courseData, updateCourseBasicDataDebounced]);

  useEffect(() => {
    if (activeTab === 'preview' && builderData?.modules?.length > 0 && !previewCurrentModuleId) {
      setPreviewCurrentModuleId(builderData.modules[0].id);
    }
  }, [activeTab, builderData?.modules?.length, previewCurrentModuleId]);

  // Actualizar datos de auto-guardado cuando cambien los datos del curso o builder
  useEffect(() => {
    if (courseCreated && (courseData.title || builderData)) {
      const draftData = {
        courseData,
        builderData,
        timestamp: new Date().toISOString()
      };
      
      autoSave.updateData(draftData);
      if (isDirty) {
        autoSave.notifyChange(true); // Cambio sustancial
        // También actualizar los datos básicos del curso en el backend
        updateCourseBasicData();
      }
    }
  }, [courseData, builderData, isDirty, courseCreated, updateCourseBasicData]);

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
    if (!currentCourseId || !courseCreated) {
      logger.warn('⚠️ No se puede guardar: curso no creado');
      return;
    }
    
    setSaving(true);
    try {
      await autoSave.forceSave();
      logger.success('✅ Borrador guardado manualmente');
    } catch (error) {
      logger.error('❌ Error guardando borrador manual:', error);
    } finally {
      setSaving(false);
    }
  };

  const loadDraft = async () => {
    if (!currentCourseId) return;
    
    try {
      const draftData = await autoSave.loadLatestDraft();
      if (draftData) {
        if (draftData.courseData) {
          setCourseData(draftData.courseData);
        }
        if (draftData.builderData) {
          setBuilderData(draftData.builderData);
        }
        logger.info('ℹ️ Borrador cargado exitosamente');
      }
    } catch (error) {
      logger.error('❌ Error cargando borrador:', error);
    }
  };

  const validateCourse = async (): Promise<string[]> => {
    const errors: string[] = [];
    
    // Validar datos básicos del curso usando el sistema centralizado
    const isBasicDataValid = await courseValidation.validateAll();
    if (!isBasicDataValid) {
      Object.values(courseValidation.errors).forEach(fieldErrors => {
        errors.push(...fieldErrors);
      });
    }
    
    // Validar estructura del constructor (módulos y componentes)
    if (!builderData?.modules || builderData.modules.length === 0) {
      errors.push('El curso debe tener al menos un módulo');
    }
    
    if (builderData?.modules) {
      builderData.modules.forEach((module: any, moduleIndex: number) => {
        if (!module.title?.trim()) {
          errors.push(`El módulo ${moduleIndex + 1} debe tener un título`);
        }
        
        if (!module.components || module.components.length === 0) {
          errors.push(`El módulo "${module.title || `Módulo ${moduleIndex + 1}`}" debe tener al menos un componente`);
        }
      });
    }
    
    return errors;
  };

  const handlePublish = async () => {
    const errors = await validateCourse();
    setValidationErrors(errors);
    
    if (errors.length === 0) {
      setShowPublishModal(true);
    }
  };

  const handleSaveAndExit = async () => {
    await saveDraft();
    navigate('/teacher/dashboard');
  };

  const updateCourseData = (updates: Partial<CourseFormData>) => {
    const newData = { ...courseData, ...updates };
    setCourseData(newData);
    
    // Sincronizar con el sistema de validación
    courseValidation.setData({
      title: newData.title,
      description: newData.description,
      difficulty_level: newData.difficulty_level,
      duration_hours: newData.duration_hours,
      learningObjectives: newData.learningObjectives,
      prerequisites: newData.prerequisites
    });
    
    setIsDirty(true);
  };

  // Función para manejar cambios en los datos del constructor
  const handleBuilderDataChange = async (data: any) => {
    setBuilderData(data);
    setIsDirty(true);
    
    // Sincronizar builder data con backend si el curso ya existe
    if (currentCourseId && data) {
      await syncBuilderDataToBackend(data);
    }
  };

  // Función para sincronizar los datos del builder con la base de datos
  const syncBuilderDataToBackend = async (builderData: any) => {
    if (!currentCourseId || !builderData?.modules) return;

    try {
      logger.debug('🔄 Sincronizando builder data con backend...');
      
      // Procesar cada módulo
      for (const module of builderData.modules) {
        // Si el módulo no tiene backendModuleId, crearlo
        if (!module.backendModuleId) {
          try {
            const unitResult = await courseService.createUnit(currentCourseId, {
              title: module.title || 'Unidad sin título',
              description: module.description || '',
              order: module.order || 0
            });
            
            if (unitResult.success && unitResult.unit?.id) {
              // Crear módulo dentro de la unidad
              const moduleResult = await courseService.createModule(unitResult.unit.id, {
                title: module.title || 'Módulo sin título',
                description: module.description || '',
                order: 0
              });
              
              if (moduleResult.success && moduleResult.module?.id) {
                module.backendModuleId = moduleResult.module.id;
              }
            }
          } catch (error) {
            logger.error('❌ Error creando módulo en backend:', error);
          }
        }

        // Procesar componentes del módulo
        if (module.components && module.backendModuleId) {
          for (const component of module.components) {
            if (!component.backendComponentId) {
              try {
                const componentResult = await courseService.createComponent(module.backendModuleId, {
                  type: component.type,
                  title: component.title || 'Componente sin título',
                  content: component.content || {},
                  order: component.order || 0
                });
                
                if (componentResult.success && componentResult.component?.id) {
                  component.backendComponentId = componentResult.component.id;
                }
              } catch (error) {
                logger.error('❌ Error creando componente en backend:', error);
              }
            }
          }
        }
      }
      
      logger.debug('✅ Sincronización completada');
    } catch (error) {
      logger.error('❌ Error sincronizando builder data:', error);
    }
  };

  // Manejar subida de banner usando FileUploadSection
  const handleBannerUpload = (fileUrl: string, metadata?: any) => {
    updateCourseData({ bannerImage: fileUrl });
    logger.success('✅ Banner subido exitosamente');
  };

  const removeBanner = () => {
    updateCourseData({ bannerImage: undefined });
    logger.info('🗑️ Banner eliminado');
  };

  // Validar configuración completa usando el sistema centralizado
  const validateSettings = async (): Promise<string[]> => {
    // Actualizar datos de validación
    courseValidation.setData({
      title: courseData.title,
      description: courseData.description,
      difficulty_level: courseData.difficulty_level,
      duration_hours: courseData.duration_hours,
      learningObjectives: courseData.learningObjectives,
      prerequisites: courseData.prerequisites
    });
    
    // Ejecutar validación
    const isValid = await courseValidation.validateAll();
    
    if (!isValid) {
      return Object.values(courseValidation.errors).flat();
    }
    
    return [];
  };

  // Funciones para manejar categorías con validación inteligente
  const addNewCategory = async () => {
    if (!newCategoryName.trim() || creatingCategory) return;
    
    const rawInput = newCategoryName.trim();
    logger.debug('🔍 Analizando nueva categoría:', rawInput);
    logger.debug('📚 Categorías disponibles:', categories.map(c => c.name));
    
    // Análisis inteligente del nombre antes de crear
    const normalizedName = normalizeAndValidateCategoryName(rawInput);
    logger.debug('✨ Nombre normalizado:', normalizedName);
    
    // Verificar si ya existe una categoría similar ANTES de enviar al backend
    const existingCategory = findSimilarCategory(normalizedName);
    if (existingCategory) {
      logger.debug('🎯 Categoría similar encontrada:', existingCategory.name);
      const confirmMessage = `Ya existe una categoría similar: "${existingCategory.name}". 
      
¿Qué deseas hacer?
- OK: Usar la categoría existente "${existingCategory.name}"
- Cancelar: No crear ninguna categoría`;
      
      if (window.confirm(confirmMessage)) {
        // Usuario eligió usar la categoría existente
        updateCourseData({ categoryId: existingCategory.id });
        setNewCategoryName('');
        setShowNewCategoryInput(false);
        logger.success('✅ Categoría existente seleccionada:', existingCategory.name);
        return;
      } else {
        // Usuario eligió cancelar completamente
        logger.debug('🚫 Usuario canceló la creación de categoría');
        setNewCategoryName('');
        setShowNewCategoryInput(false);
        return; // Salir sin crear nada
      }
    }
    
    setCreatingCategory(true);
    try {
      logger.debug('🚀 Creando nueva categoría en backend:', normalizedName);
      const newCategory = await createCategory({
        name: normalizedName,
        isActive: true
      });
      
      // Verificar que la categoría fue creada exitosamente
      if (newCategory && newCategory.id) {
        // Seleccionar automáticamente la nueva categoría
        updateCourseData({ categoryId: newCategory.id });
        setNewCategoryName('');
        setShowNewCategoryInput(false);
        
        logger.success('✅ Categoría creada exitosamente:', newCategory.name);
      } else {
        throw new Error('La categoría no se pudo crear correctamente');
      }
    } catch (error) {
      logger.error('❌ Error al crear categoría:', error);
      
      // Mostrar el mensaje de error específico si está disponible
      const errorMessage = error instanceof Error ? error.message : 'Error al crear la categoría';
      alert(errorMessage);
    } finally {
      setCreatingCategory(false);
    }
  };

  // Función para normalizar y validar nombres de categorías
  const normalizeAndValidateCategoryName = (name: string): string => {
    // Capitalizar primera letra de cada palabra y convertir el resto a minúsculas
    return name
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .trim();
  };

  // Función para encontrar categorías similares (análisis inteligente)
  const findSimilarCategory = (name: string) => {
    const normalizedInput = name.toLowerCase().replace(/\s+/g, ' ').trim();
    
    return categories.find(category => {
      const normalizedCategory = category.name.toLowerCase().replace(/\s+/g, ' ').trim();
      
      // Comparación exacta
      if (normalizedCategory === normalizedInput) return true;
      
      // Comparación sin espacios
      if (normalizedCategory.replace(/\s/g, '') === normalizedInput.replace(/\s/g, '')) return true;
      
      // Verificar si el input está contenido en la categoría (ej: "art" en "arte y música")
      if (normalizedCategory.includes(normalizedInput) || normalizedInput.includes(normalizedCategory)) return true;
      
      // Verificar por palabras individuales (ej: "art" similar a "arte")
      const inputWords = normalizedInput.split(' ');
      const categoryWords = normalizedCategory.split(' ');
      
      for (const inputWord of inputWords) {
        for (const categoryWord of categoryWords) {
          if (inputWord.length >= 3 && categoryWord.length >= 3) {
            const wordSimilarity = calculateStringSimilarity(inputWord, categoryWord);
            if (wordSimilarity > 0.75) return true;
          }
        }
      }
      
      // Comparación con similaridad alta (al menos 80% de coincidencia completa)
      const similarity = calculateStringSimilarity(normalizedCategory, normalizedInput);
      return similarity > 0.80;
    });
  };

  // Función para calcular similaridad entre strings
  const calculateStringSimilarity = (str1: string, str2: string): number => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  };

  // Algoritmo de Levenshtein para calcular distancia entre strings
  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i += 1) {
      matrix[0][i] = i;
    }
    
    for (let j = 0; j <= str2.length; j += 1) {
      matrix[j][0] = j;
    }
    
    for (let j = 1; j <= str2.length; j += 1) {
      for (let i = 1; i <= str1.length; i += 1) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  };

  const cancelNewCategory = () => {
    setNewCategoryName('');
    setShowNewCategoryInput(false);
  };

  // Crear objeto Course para vista previa
  const createPreviewCourse = (): Course => {
    const selectedCategory = categories.find(cat => cat.id === courseData.categoryId);
    
    return {
      id: 0, // ID temporal para preview
      title: courseData.title || 'Título del curso',
      description: courseData.description || 'Descripción del curso',
      bannerImage: courseData.bannerImage || null,
      category: selectedCategory || null,
      teacher: user ? {
        id: user.id,
        firstName: user.firstName || 'Profesor',
        lastName: user.lastName || 'Ejemplo',
        email: user.email,
        bio: 'Instructor de VanguardIA'
      } : null,
      level: courseData.difficulty_level as CourseDifficulty || CourseDifficulty.BEGINNER,
      status: 'draft' as CourseStatus,
      duration: (courseData.duration_hours || 0) * 60, // Convertir a minutos
      learningObjectives: courseData.learningObjectives || [],
      requirements: courseData.prerequisites || [],
      language: 'es',
      enrollmentCount: 0,
      averageRating: undefined,
      totalUnits: builderData?.units?.length || 0,
      units: builderData?.units || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: null
    };
  };

  // Función para mostrar vista previa
  const handleShowPreview = () => {
    setShowPreviewModal(true);
  };

  // Guardar configuración
  const saveSettings = async () => {
    const errors = await validateSettings();
    setValidationErrors(errors);
    
    if (errors.length > 0) {
      return;
    }
    
    setSaving(true);
    try {
      // Si el curso no está creado aún, crearlo primero
      if (!courseCreated) {
        await createCourse(true); // Cambiar automáticamente a la pestaña Constructor
        logger.success('✅ Course created and settings saved successfully');
      } else {
        // Si ya está creado, solo guardar cambios
        await saveDraft();
        logger.success('✅ Course settings saved successfully');
      }
    } catch (error) {
      logger.error('❌ Error saving settings:', error);
      alert('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  // Lógica de habilitación de pestañas
  const isTabEnabled = (tabId: TabId): boolean => {
    if (tabId === 'settings') return true;
    return courseCreated; // Builder y Preview solo después de crear curso
  };

  // Función para crear curso
  const createCourse = async (switchToBuilder: boolean = true): Promise<void> => {
    const validation = CourseValidator.validateCreation(courseData);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    setCreating(true);
    try {
      const result = await courseService.createCourse(courseData);
      
      if (result.success && result.course) {
        setCurrentCourseId(result.course.id);
        setCourseCreated(true);
        
        // Inicializar builderData directamente con la estructura del curso del backend
        setBuilderData({
          id: result.course.id,
          title: result.course.title,
          description: result.course.description,
          modules: result.course.units || [] // Los "units" del backend son "modules" en el frontend
        });
        
        if (switchToBuilder) {
          setActiveTab('builder'); // Cambiar automáticamente al builder solo si se especifica
        }
        
        // NO cargar borrador automáticamente en cursos nuevos para evitar conflictos
        // El usuario puede cargar manualmente si necesita un borrador específico
        
        logger.success('✅ Curso creado exitosamente', { courseId: result.course.id });
        setValidationErrors([]);
      } else {
        throw new Error(result.message || 'Error creando curso');
      }
    } catch (error) {
      logger.error('❌ Error creando curso:', error);
      setValidationErrors([error instanceof Error ? error.message : 'Error inesperado']);
    } finally {
      setCreating(false);
    }
  };

  // Función para publicar curso
  const handlePublishCourse = async (): Promise<void> => {
    if (!currentCourseId) return;

    // Validar que el curso esté completo para publicación
    const validation = await validateCourse();
    if (validation.length > 0) {
      setValidationErrors(validation);
      setShowPublishModal(true);
      return;
    }

    setPublishing(true);
    try {
      // Forzar guardado y sincronización antes de publicar
      await autoSave.forceSave();
      
      // Sincronizar builder data con backend si existe
      if (builderData) {
        await syncBuilderDataToBackend(builderData);
      }
      
      await courseService.publishCourse(currentCourseId);
      
      logger.success('✅ Curso publicado exitosamente');
      navigate('/teacher/courses');
    } catch (error) {
      logger.error('❌ Error publicando curso:', error);
      alert('Error al publicar el curso');
    } finally {
      setPublishing(false);
    }
  };

  // Función mejorada para guardar y salir
  const handleSaveAndExitNew = async (): Promise<void> => {
    setSaving(true);
    try {
      if (courseCreated && currentCourseId) {
        // Si hay curso creado, forzar guardado de borrador
        // Aquí se integrará el sistema híbrido de auto-guardado
        await saveDraft();
      } else {
        // Si no hay curso creado, guardar en localStorage
        localStorage.setItem('course_draft', JSON.stringify(courseData));
      }
      
      logger.success('✅ Cambios guardados');
      navigate('/teacher/dashboard');
    } catch (error) {
      logger.error('❌ Error guardando:', error);
      alert('Error al guardar los cambios');
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
            onBuilderDataChange={handleBuilderDataChange}
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
                {!courseCreated ? (
                  <Button
                    onClick={createCourse}
                    variant="primary"
                    disabled={creating || !courseData.title || !courseData.description}
                    leftIcon={creating ? undefined : <Plus className="w-4 h-4" />}
                    loading={creating}
                  >
                    {creating ? 'Creando...' : 'Crear Curso'}
                  </Button>
                ) : (
                  <Button
                    onClick={saveSettings}
                    variant="primary"
                    disabled={saving}
                    leftIcon={saving ? undefined : <Save className="w-4 h-4" />}
                    loading={saving}
                  >
                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                )}
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
              
              <FileUploadSection
                fileUrl={courseData.bannerImage}
                onUploadComplete={handleBannerUpload}
                onRemoveFile={removeBanner}
                fileType="image"
                label="Imagen del Curso (Banner)"
                required={false}
                allowFullscreen={true}
                previewClassName="w-full h-48 object-cover rounded-lg shadow-sm"
              />
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
                    Descripción del curso *
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoría del curso
                    </label>
                    <div className="space-y-2">
                      <select
                        value={courseData.categoryId || ''}
                        onChange={(e) => updateCourseData({ categoryId: e.target.value ? parseInt(e.target.value) : null })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={categoriesLoading}
                      >
                        <option value="">Seleccionar categoría</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                      </select>
                      {categoriesLoading && (
                        <div className="mt-1 text-xs text-gray-500">
                          Cargando categorías...
                        </div>
                      )}
                      {categoriesError && (
                        <div className="mt-1 text-xs text-red-500">
                          Error al cargar categorías
                        </div>
                      )}
                      
                      {/* Los profesores pueden crear categorías durante la creación de cursos */}
                      {!showNewCategoryInput ? (
                        <button
                          type="button"
                          onClick={() => setShowNewCategoryInput(true)}
                          className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Añadir nueva categoría
                        </button>
                      ) : showNewCategoryInput ? (
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
                              disabled={!newCategoryName.trim() || creatingCategory}
                              className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {creatingCategory ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
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
                      ) : null}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duración estimada *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={courseData.duration_hours || ''}
                        onChange={(e) => updateCourseData({ duration_hours: parseFloat(e.target.value) || 0 })}
                        min="0.5"
                        max="200"
                        step="0.5"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-16"
                        placeholder="2.5"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="ml-1 text-sm text-gray-500">horas</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Duración total estimada del curso (ej: 2.5 horas)
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nivel de dificultad *
                    </label>
                    <select
                      value={courseData.difficulty_level}
                      onChange={(e) => updateCourseData({ difficulty_level: e.target.value as CourseDifficulty })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={CourseDifficulty.BEGINNER}>🟢 Principiante</option>
                      <option value={CourseDifficulty.INTERMEDIATE}>🟡 Intermedio</option>
                      <option value={CourseDifficulty.ADVANCED}>🔴 Avanzado</option>
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
                {courseData.learningObjectives.map((objective, index) => (
                  <div key={index} className="flex items-start space-x-3 group">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mt-2">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={objective}
                        onChange={(e) => {
                          const newObjectives = [...courseData.learningObjectives];
                          newObjectives[index] = e.target.value;
                          updateCourseData({ learningObjectives: newObjectives });
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ej: Implementar protocolos de seguridad en sus puestos de trabajo"
                        maxLength={150}
                      />
                    </div>
                    <button
                      onClick={() => {
                        const newObjectives = courseData.learningObjectives.filter((_, i) => i !== index);
                        updateCourseData({ learningObjectives: newObjectives });
                      }}
                      className="flex-shrink-0 p-2 text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                      title="Eliminar objetivo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                {courseData.learningObjectives.length < 8 && (
                  <button
                    onClick={() => updateCourseData({ 
                      learningObjectives: [...courseData.learningObjectives, ''] 
                    })}
                    className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar objetivo de aprendizaje
                  </button>
                )}
                
                {courseData.learningObjectives.length === 0 && (
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
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
                  <Clock className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{courseData.duration_hours || 0}h</div>
                  <div className="text-sm text-gray-600">Duración</div>
                </div>
                
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <Target className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{courseData.learningObjectives.length}</div>
                  <div className="text-sm text-gray-600">Objetivos</div>
                </div>
                
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <Globe className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">
                    {courseData.difficulty_level === CourseDifficulty.BEGINNER ? '🟢' : 
                     courseData.difficulty_level === CourseDifficulty.INTERMEDIATE ? '🟡' : '🔴'}
                  </div>
                  <div className="text-sm text-gray-600 capitalize">{courseData.difficulty_level}</div>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-white rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Estado del curso:</span>
                  <span className={`font-medium ${
                    courseData.title && courseData.description && courseData.duration_hours > 0 && courseData.learningObjectives.length > 0
                      ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    {courseData.title && courseData.description && courseData.duration_hours > 0 && courseData.learningObjectives.length > 0
                      ? '✅ Configuración completa' : '⚠️ Configuración pendiente'}
                  </span>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end items-center pt-6 border-t">             
              <div className="flex space-x-3">
                <Button
                  onClick={handleShowPreview}
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
                  <span>•</span>
                  <span>
                    {!courseCreated ? "Paso 1: Configuración básica" : "Editando contenido del curso"}
                  </span>
                  {/* Auto-save status indicator */}
                  {courseCreated && autoSave.isActive && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        {autoSave.status === 'saving' && (
                          <>
                            <Loader className="w-3 h-3 animate-spin" />
                            <span className="text-primary-600">Guardando...</span>
                          </>
                        )}
                        {autoSave.status === 'saved' && (
                          <>
                            <CheckCircle className="w-3 h-3 text-success-600" />
                            <span className="text-success-600">Guardado automático</span>
                          </>
                        )}
                        {autoSave.status === 'error' && (
                          <>
                            <AlertCircle className="w-3 h-3 text-danger-600" />
                            <span className="text-danger-600">Error guardando</span>
                          </>
                        )}
                        {autoSave.status === 'idle' && isDirty && (
                          <span className="text-accent-600">Cambios pendientes</span>
                        )}
                      </div>
                    </>
                  )}
                  {/* Fallback for manual saving when auto-save is not active */}
                  {(!courseCreated || !autoSave.isActive) && saving && (
                    <>
                      <span>•</span>
                      <span className="text-primary-600">Guardando...</span>
                    </>
                  )}
                  {(!courseCreated || !autoSave.isActive) && isDirty && !saving && (
                    <>
                      <span>•</span>
                      <span className="text-accent-600">Cambios sin guardar</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Botón Publicar - solo visible después de crear curso */}
              {courseCreated && (
                <Button
                  variant="success"
                  size="sm"
                  onClick={handlePublishCourse}
                  disabled={!currentCourseId || publishing}
                  leftIcon={<Globe className="w-4 h-4" />}
                  loading={publishing}
                >
                  {publishing ? 'Publicando...' : 'Publicar Curso'}
                </Button>
              )}
              
              {/* Botón Guardar y Salir - siempre visible */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveAndExitNew}
                loading={saving}
                leftIcon={<Save className="w-4 h-4" />}
              >
                {saving ? 'Guardando...' : 'Guardar y Salir'}
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 border-b border-gray-200">
            {TABS.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => isTabEnabled(tab.id) && setActiveTab(tab.id)}
                disabled={!isTabEnabled(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'bg-primary-500 text-white'
                    : isTabEnabled(tab.id)
                    ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    : 'text-gray-400 cursor-not-allowed bg-gray-50'
                }`}
                whileHover={isTabEnabled(tab.id) ? { y: -1 } : {}}
                whileTap={isTabEnabled(tab.id) ? { y: 0 } : {}}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
                {!isTabEnabled(tab.id) && <Lock className="w-3 h-3 ml-1" />}
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

      {/* Modal de Vista Previa */}
      <CoursePreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        course={createPreviewCourse()}
        title="Vista Previa del Curso"
      />
    </DashboardLayout>
  );
};

export default CreateCoursePage;