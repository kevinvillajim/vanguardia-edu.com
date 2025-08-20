import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { interactiveCourseService } from '../../../../services/interactiveCourse/interactiveCourseService';

interface ModuleComponent {
  id: string;
  type: 'banner' | 'video' | 'reading' | 'image' | 'document' | 'quiz';
  title: string;
  content?: string;
  fileUrl?: string;
  duration?: number;
  isCompleted: boolean;
  isMandatory: boolean;
  order: number;
}

interface CourseModule {
  id: string;
  title: string;
  description: string;
  components: ModuleComponent[];
  quiz?: {
    id: string;
    title: string;
    questions: number;
    timeLimit?: number;
    attempts: number;
    maxAttempts: number;
    bestScore?: number;
    isPassed: boolean;
  };
  progress: number;
  order: number;
}

interface CourseActivity {
  id: string;
  title: string;
  description: string;
  type: 'assignment' | 'project' | 'essay' | 'presentation';
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded' | 'returned';
  score?: number;
  maxScore: number;
  feedback?: string;
}

interface CourseMaterial {
  id: string;
  title: string;
  description: string;
  type: 'pdf' | 'document' | 'video' | 'link';
  fileUrl: string;
  fileName?: string;
}

interface CourseData {
  id: string;
  title: string;
  description: string;
  modules: CourseModule[];
  activities: CourseActivity[];
  materials: CourseMaterial[];
  progress: {
    overall: number;
    interactive: number;
    activities: number;
  };
  grades: {
    interactiveAverage: number;
    activitiesAverage: number;
    finalScore: number;
  };
  certificates: {
    virtual: boolean;
    complete: boolean;
  };
}

// Componente de Progreso de Curso (estilo backup)
const CourseProgress: React.FC<{
  courseModule: CourseModule;
  isOpen: boolean;
  onToggle: () => void;
  courseId: string;
}> = ({ courseModule, isOpen, onToggle, courseId }) => {
  const getColor = (value: number) => {
    if (value <= 33) return "bg-red-500";
    if (value <= 66) return "bg-yellow-500";
    if (value <= 99) return "bg-green-500";
    return "bg-blue-500";
  };

  const progressValue = Math.min(courseModule.progress, 100);
  const color = getColor(progressValue);

  return (
    <div className="bg-[#737272] border-b-2 border-[#ADADAD] px-[1.5rem] py-[1rem]">
      <div
        className="flex justify-between cursor-pointer"
        onClick={onToggle}
      >
        <span className="text-white font-bold cursor-pointer animatedBig">
          {courseModule.title}
        </span>
        <div className="w-[30px] h-[30px] rounded-md bg-[#909090] flex justify-center items-center animatedBg">
          <span className="material-symbols-outlined text-white">
            {isOpen ? "keyboard_arrow_down" : "keyboard_arrow_up"}
          </span>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="mt-2 mb-2">
        <div className="w-full bg-gray-300 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${color} transition-all duration-300`}
            style={{ width: `${progressValue}%` }}
          />
        </div>
        <span className="text-white text-xs">{progressValue}% completado</span>
      </div>

      <div
        className={`pl-[1rem] text-white text-xs mt-[1rem] flex flex-col gap-3 ${
          isOpen ? "block" : "hidden"
        }`}
      >
        {courseModule.components.map((component, index) => (
          <div
            key={component.id}
            className="animatedBig cursor-pointer flex items-center gap-2"
          >
            <span className={`w-2 h-2 rounded-full ${component.isCompleted ? 'bg-green-500' : 'bg-gray-400'}`} />
            <p>{component.title}</p>
            {component.type === 'quiz' && (
              <span className="text-yellow-400 text-xs">(Quiz)</span>
            )}
          </div>
        ))}
        
        {courseModule.quiz && (
          <div className="animatedBig cursor-pointer flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${courseModule.quiz.isPassed ? 'bg-green-500' : 'bg-gray-400'}`} />
            <p>{courseModule.quiz.title}</p>
            <span className="text-blue-400 text-xs">
              ({courseModule.quiz.attempts}/{courseModule.quiz.maxAttempts} intentos)
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// Componente de Material (estilo backup)
const Material: React.FC<{
  material: CourseMaterial;
}> = ({ material }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return '/pdf.webp';
      case 'document':
        return '/pdf.webp';
      case 'video':
        return '/play.webp';
      default:
        return '/pdf.webp';
    }
  };

  return (
    <div className="bg-[#737272] border-b-2 border-[#ADADAD] px-[1.5rem] py-[1rem]">
      <div className="flex items-center gap-3">
        <img 
          src={getIcon(material.type)} 
          alt={material.type}
          className="w-8 h-8 object-cover"
        />
        <div className="flex-1">
          <h4 className="text-white font-bold text-sm">{material.title}</h4>
          <p className="text-gray-300 text-xs">{material.description}</p>
        </div>
        <a
          href={material.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#22c55e] text-white px-3 py-1 rounded text-xs hover:bg-green-600 transition-colors"
        >
          Abrir
        </a>
      </div>
    </div>
  );
};

// Componente de Sidebar de Curso (estilo backup)
const SideBarCourse: React.FC<{
  courseData: CourseData;
  activeTab: 'content' | 'material';
  onTabChange: (tab: 'content' | 'material') => void;
  openModuleIndex: number;
  onModuleToggle: (index: number) => void;
}> = ({ courseData, activeTab, onTabChange, openModuleIndex, onModuleToggle }) => {
  return (
    <div className="h-screen bg-[#737272] overflow-auto">
      <header className="flex justify-center md:flex-row flex-col">
        <div
          className={`bg-[#353535] py-[1rem] px-[1.5rem] flex gap-2 items-center w-[100%] justify-center cursor-pointer animatedBig ${
            activeTab === 'content' ? "border-b-4 border-[#22c55e]" : ""
          }`}
          onClick={() => onTabChange('content')}
        >
          <span className="material-symbols-outlined text-[white]">
            library_books
          </span>
          <span className="text-[white]">Contenido del Curso</span>
        </div>
        <div
          className={`bg-[#353535] py-[1rem] px-[1.5rem] flex gap-2 items-center w-[100%] justify-center cursor-pointer animatedBig ${
            activeTab === 'material' ? "border-b-4 border-[#22c55e]" : ""
          }`}
          onClick={() => onTabChange('material')}
        >
          <span className="material-symbols-outlined text-[white]">
            import_contacts
          </span>
          <span className="text-[white]">Material</span>
        </div>
      </header>
      
      <div className={`w-[100%] ${activeTab === 'content' ? "block" : "hidden"}`}>
        {courseData.modules.map((module, index) => (
          <CourseProgress
            key={module.id}
            courseModule={module}
            isOpen={index === openModuleIndex}
            onToggle={() => onModuleToggle(index)}
            courseId={courseData.id}
          />
        ))}
      </div>
      
      <div className={`w-[100%] ${activeTab === 'material' ? "block" : "hidden"}`}>
        {courseData.materials.map((material) => (
          <Material
            key={material.id}
            material={material}
          />
        ))}
      </div>
    </div>
  );
};

// Componente de Contenido del Curso (estilo backup)
const ContentCourse: React.FC<{
  title: string;
  children: React.ReactNode;
  showSidebar: boolean;
  onToggleSidebar: () => void;
}> = ({ title, children, showSidebar, onToggleSidebar }) => {
  return (
    <div>
      <div className="p-[1rem] w-[100%] flex gap-3 bg-[#4a4a4a] text-white items-center">
        <span
          className="material-symbols-outlined cursor-pointer p-[0.3rem] rounded-lg animatedBg3"
          onClick={onToggleSidebar}
        >
          {showSidebar ? "menu_open" : "menu"}
        </span>
        <span>{title} - Curso Online</span>
      </div>
      <div className="p-[1rem]">{children}</div>
    </div>
  );
};

// Componente principal
export const StudentCourseViewBackup: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para la UI (manteniendo el comportamiento del backup)
  const [showSidebar, setShowSidebar] = useState(true);
  const [activeTab, setActiveTab] = useState<'content' | 'material'>('content');
  const [openModuleIndex, setOpenModuleIndex] = useState(0);

  useEffect(() => {
    if (id) {
      fetchCourseData();
    }
  }, [id]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cargar datos del backend usando la nueva API V2
      const response = await interactiveCourseService.getStudentCourseView(id!);
      
      // Transformar los datos al formato compatible con backup
      const transformedData = interactiveCourseService.transformCourseDataForBackup(response);
      setCourseData(transformedData);
      
      // Cargar el índice del módulo abierto desde localStorage (estilo backup)
      const savedIndex = interactiveCourseService.getOpenModuleIndex(id!);
      setOpenModuleIndex(savedIndex);
      
    } catch (err: any) {
      console.error('Error fetching course data:', err);
      setError(err.message || 'Error al cargar el curso');
    } finally {
      setLoading(false);
    }
  };

  const handleModuleToggle = (index: number) => {
    setOpenModuleIndex(index);
    // Guardar en localStorage como en el backup usando el servicio
    interactiveCourseService.saveOpenModuleIndex(id!, index);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#191b20] flex items-center justify-center">
        <div className="text-white">Cargando curso...</div>
      </div>
    );
  }

  if (error || !courseData) {
    return (
      <div className="min-h-screen bg-[#191b20] flex items-center justify-center">
        <div className="text-red-500">{error || 'Curso no encontrado'}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex">
        <div className={showSidebar ? "w-[55%] md:w-[30%]" : "hidden"}>
          <SideBarCourse
            courseData={courseData}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            openModuleIndex={openModuleIndex}
            onModuleToggle={handleModuleToggle}
          />
        </div>
        <div className="w-[100%] bg-[#191b20]">
          <ContentCourse
            title={courseData.title}
            showSidebar={showSidebar}
            onToggleSidebar={() => setShowSidebar(!showSidebar)}
          >
            {/* Contenido principal del módulo activo */}
            <div className="text-white">
              {courseData.modules[openModuleIndex] && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">
                    {courseData.modules[openModuleIndex].title}
                  </h2>
                  <p className="text-gray-300 mb-6">
                    {courseData.modules[openModuleIndex].description}
                  </p>
                  
                  {/* Componentes del módulo */}
                  <div className="space-y-4">
                    {courseData.modules[openModuleIndex].components.map((component) => (
                      <div
                        key={component.id}
                        className="bg-[#2a2a2a] p-4 rounded-lg"
                      >
                        <h3 className="text-lg font-semibold mb-2">{component.title}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm bg-blue-600 px-2 py-1 rounded">
                            {component.type}
                          </span>
                          {component.isCompleted && (
                            <span className="text-sm bg-green-600 px-2 py-1 rounded">
                              Completado
                            </span>
                          )}
                        </div>
                        {component.content && (
                          <p className="text-gray-300">{component.content}</p>
                        )}
                        {component.fileUrl && (
                          <a
                            href={component.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block mt-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors"
                          >
                            Ver contenido
                          </a>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Quiz del módulo */}
                  {courseData.modules[openModuleIndex].quiz && (
                    <div className="mt-6 bg-yellow-900 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-2">
                        {courseData.modules[openModuleIndex].quiz!.title}
                      </h3>
                      <p className="text-gray-300 mb-2">
                        Preguntas: {courseData.modules[openModuleIndex].quiz!.questions}
                      </p>
                      {courseData.modules[openModuleIndex].quiz!.timeLimit && (
                        <p className="text-gray-300 mb-2">
                          Tiempo límite: {courseData.modules[openModuleIndex].quiz!.timeLimit} minutos
                        </p>
                      )}
                      <p className="text-gray-300 mb-4">
                        Intentos: {courseData.modules[openModuleIndex].quiz!.attempts}/{courseData.modules[openModuleIndex].quiz!.maxAttempts}
                      </p>
                      {courseData.modules[openModuleIndex].quiz!.bestScore && (
                        <p className="text-green-400 mb-4">
                          Mejor puntuación: {courseData.modules[openModuleIndex].quiz!.bestScore}%
                        </p>
                      )}
                      <button className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded transition-colors">
                        {courseData.modules[openModuleIndex].quiz!.attempts > 0 ? 'Reintentar Quiz' : 'Iniciar Quiz'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </ContentCourse>
        </div>
      </div>
    </div>
  );
};

export default StudentCourseViewBackup;