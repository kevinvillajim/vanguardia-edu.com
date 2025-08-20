import React, { useState, useCallback } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  DocumentDuplicateIcon,
  PlayCircleIcon,
  DocumentTextIcon,
  PhotoIcon,
  MusicalNoteIcon,
  FilmIcon,
  ClipboardDocumentCheckIcon,
  Bars3Icon,
  ChevronUpIcon,
  ChevronDownIcon,
  EyeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

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
  description: string;
  components: ComponentItem[];
  quiz?: any;
  order: number;
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

// Componente de item arrastrable
const DraggableComponent: React.FC<{
  component: ComponentItem;
  index: number;
  moduleId: string;
  moveComponent: (dragIndex: number, dropIndex: number, moduleId: string) => void;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ component, index, moduleId, moveComponent, onEdit, onDelete }) => {
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
      case ComponentTypes.VIDEO: return <PlayCircleIcon className="w-5 h-5" />;
      case ComponentTypes.READING: return <DocumentTextIcon className="w-5 h-5" />;
      case ComponentTypes.IMAGE: return <PhotoIcon className="w-5 h-5" />;
      case ComponentTypes.AUDIO: return <MusicalNoteIcon className="w-5 h-5" />;
      case ComponentTypes.DOCUMENT: return <DocumentTextIcon className="w-5 h-5" />;
      case ComponentTypes.QUIZ: return <ClipboardDocumentCheckIcon className="w-5 h-5" />;
      default: return <FilmIcon className="w-5 h-5" />;
    }
  };

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`flex items-center justify-between p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg cursor-move transition-all ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-center space-x-3">
        <Bars3Icon className="w-4 h-4 text-gray-400" />
        <div className="text-gray-600 dark:text-gray-400">{getIcon()}</div>
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {component.title}
          </p>
          {component.duration && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {component.duration} minutos
            </p>
          )}
        </div>
        {component.isMandatory && (
          <span className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded">
            Obligatorio
          </span>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={onEdit}
          className="p-1 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <PencilIcon className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-1 text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
        >
          <TrashIcon className="w-4 h-4" />
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
    { type: ComponentTypes.BANNER, label: 'Banner', icon: FilmIcon },
    { type: ComponentTypes.VIDEO, label: 'Video', icon: PlayCircleIcon },
    { type: ComponentTypes.READING, label: 'Lectura', icon: DocumentTextIcon },
    { type: ComponentTypes.IMAGE, label: 'Imagen', icon: PhotoIcon },
    { type: ComponentTypes.AUDIO, label: 'Audio', icon: MusicalNoteIcon },
    { type: ComponentTypes.DOCUMENT, label: 'Documento', icon: DocumentTextIcon },
    { type: ComponentTypes.QUIZ, label: 'Quiz', icon: ClipboardDocumentCheckIcon },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
        Componentes Disponibles
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {components.map((comp) => {
          const Icon = comp.icon;
          return (
            <button
              key={comp.type}
              onClick={() => currentModuleId && onAddComponent(comp.type, currentModuleId)}
              disabled={!currentModuleId}
              className={`flex flex-col items-center justify-center p-3 border rounded-lg transition-all ${
                currentModuleId
                  ? 'border-gray-200 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 cursor-not-allowed opacity-50'
              }`}
            >
              <Icon className="w-6 h-6 text-gray-600 dark:text-gray-400 mb-1" />
              <span className="text-xs text-gray-700 dark:text-gray-300">{comp.label}</span>
            </button>
          );
        })}
      </div>
      {!currentModuleId && (
        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
          Selecciona un módulo para agregar componentes
        </p>
      )}
    </div>
  );
};

export const TeacherCourseBuilder: React.FC = () => {
  const [course, setCourse] = useState<Course>({
    title: '',
    description: '',
    modules: [],
    activities: []
  });
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Agregar nuevo módulo
  const addModule = () => {
    const newModule: Module = {
      id: `module-${Date.now()}`,
      title: `Módulo ${course.modules.length + 1}`,
      description: '',
      components: [],
      order: course.modules.length
    };
    setCourse(prev => ({
      ...prev,
      modules: [...prev.modules, newModule]
    }));
    setSelectedModuleId(newModule.id);
  };

  // Agregar componente a un módulo
  const addComponent = (type: string, moduleId: string) => {
    const newComponent: ComponentItem = {
      id: `comp-${Date.now()}`,
      type,
      title: `Nuevo ${type}`,
      isMandatory: true,
      order: 0
    };

    setCourse(prev => ({
      ...prev,
      modules: prev.modules.map(module =>
        module.id === moduleId
          ? { ...module, components: [...module.components, newComponent] }
          : module
      )
    }));
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
  const deleteComponent = (componentId: string, moduleId: string) => {
    setCourse(prev => ({
      ...prev,
      modules: prev.modules.map(module =>
        module.id === moduleId
          ? { ...module, components: module.components.filter(c => c.id !== componentId) }
          : module
      )
    }));
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

  // Clonar curso
  const cloneCourse = () => {
    if (window.confirm('¿Deseas clonar este curso? Se creará una copia con todos los módulos y actividades.')) {
      const clonedCourse = {
        ...course,
        id: undefined,
        title: `${course.title} (Copia)`,
        modules: course.modules.map(module => ({
          ...module,
          id: `module-clone-${Date.now()}-${Math.random()}`,
          components: module.components.map(comp => ({
            ...comp,
            id: `comp-clone-${Date.now()}-${Math.random()}`
          }))
        })),
        activities: course.activities.map(activity => ({
          ...activity,
          id: `activity-clone-${Date.now()}-${Math.random()}`
        }))
      };
      setCourse(clonedCourse);
      alert('Curso clonado exitosamente');
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Título del curso"
                  value={course.title}
                  onChange={(e) => setCourse(prev => ({ ...prev, title: e.target.value }))}
                  className="text-2xl font-bold bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400 w-full"
                />
                <textarea
                  placeholder="Descripción del curso"
                  value={course.description}
                  onChange={(e) => setCourse(prev => ({ ...prev, description: e.target.value }))}
                  className="mt-2 text-gray-600 dark:text-gray-400 bg-transparent border-none outline-none resize-none w-full"
                  rows={2}
                />
              </div>
              <div className="flex items-center space-x-3 ml-6">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  <EyeIcon className="w-5 h-5 mr-2" />
                  Vista Previa
                </button>
                <button
                  onClick={cloneCourse}
                  className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  <DocumentDuplicateIcon className="w-5 h-5 mr-2" />
                  Clonar Curso
                </button>
                <button className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                  <ArrowPathIcon className="w-5 h-5 mr-2" />
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Panel lateral */}
            <div className="lg:col-span-1 space-y-4">
              {/* Paleta de componentes */}
              <ComponentPalette 
                onAddComponent={addComponent}
                currentModuleId={selectedModuleId}
              />

              {/* Acciones rápidas */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Acciones Rápidas
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={addModule}
                    className="w-full flex items-center justify-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Agregar Módulo
                  </button>
                  <button
                    onClick={addActivity}
                    className="w-full flex items-center justify-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Agregar Actividad
                  </button>
                </div>
              </div>

              {/* Estadísticas del curso */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Resumen del Curso
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Módulos:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {course.modules.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Componentes:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {course.modules.reduce((acc, m) => acc + m.components.length, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Actividades:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {course.activities.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Área principal de construcción */}
            <div className="lg:col-span-3 space-y-4">
              {/* Módulos */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Módulos del Curso
                </h2>
                {course.modules.length === 0 ? (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border-2 border-dashed border-gray-300 dark:border-gray-600 p-12 text-center">
                    <FilmIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      No hay módulos creados aún
                    </p>
                    <button
                      onClick={addModule}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Crear Primer Módulo
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {course.modules.map((module, moduleIndex) => (
                      <div
                        key={module.id}
                        className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border-2 transition-all ${
                          selectedModuleId === module.id
                            ? 'border-blue-500 dark:border-blue-400'
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <div
                          className="p-4 cursor-pointer"
                          onClick={() => setSelectedModuleId(module.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                <Bars3Icon className="w-5 h-5" />
                              </button>
                              <div>
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
                                  className="text-lg font-medium bg-transparent border-none outline-none text-gray-900 dark:text-white"
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
                                  className="text-sm text-gray-600 dark:text-gray-400 bg-transparent border-none outline-none w-full"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
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
                                className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50"
                              >
                                <ChevronUpIcon className="w-4 h-4" />
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
                                className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50"
                              >
                                <ChevronDownIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCourse(prev => ({
                                    ...prev,
                                    modules: prev.modules.filter(m => m.id !== module.id)
                                  }));
                                  if (selectedModuleId === module.id) {
                                    setSelectedModuleId(null);
                                  }
                                }}
                                className="p-1 text-gray-500 hover:text-red-600 dark:hover:text-red-400"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Componentes del módulo */}
                        {selectedModuleId === module.id && (
                          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                            <div className="space-y-2">
                              {module.components.length === 0 ? (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
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
                                    moveComponent={moveComponent}
                                    onEdit={() => {
                                      // Abrir modal de edición
                                      console.log('Edit component', component);
                                    }}
                                    onDelete={() => deleteComponent(component.id, module.id)}
                                  />
                                ))
                              )}
                            </div>

                            {/* Agregar Quiz al módulo */}
                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                              <button
                                onClick={() => addComponent(ComponentTypes.QUIZ, module.id)}
                                className="w-full flex items-center justify-center px-3 py-2 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-400 rounded-lg transition-colors"
                              >
                                <ClipboardDocumentCheckIcon className="w-4 h-4 mr-2" />
                                Agregar Quiz al Módulo
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actividades del Profesor */}
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Actividades Adicionales
                </h2>
                {course.activities.length === 0 ? (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border-2 border-dashed border-gray-300 dark:border-gray-600 p-12 text-center">
                    <ClipboardDocumentCheckIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      No hay actividades creadas aún
                    </p>
                    <button
                      onClick={addActivity}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      Crear Primera Actividad
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {course.activities.map((activity) => (
                      <div
                        key={activity.id}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4"
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
                              className="text-lg font-medium bg-transparent border-none outline-none text-gray-900 dark:text-white w-full"
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
                              className="mt-1 text-sm text-gray-600 dark:text-gray-400 bg-transparent border-none outline-none resize-none w-full"
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
                                className="text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 text-gray-900 dark:text-white"
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
                                className="text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 text-gray-900 dark:text-white w-24"
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
                                className="text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 text-gray-900 dark:text-white"
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
                                <span className="text-sm text-gray-700 dark:text-gray-300">Obligatorio</span>
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
                            className="ml-4 p-1 text-gray-500 hover:text-red-600 dark:hover:text-red-400"
                          >
                            <TrashIcon className="w-5 h-5" />
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
    </DndProvider>
  );
};

export default TeacherCourseBuilder;