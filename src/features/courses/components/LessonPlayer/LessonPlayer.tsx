import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface LessonPlayerProps {
  lesson: {
    id: number;
    title: string;
    description: string;
    type: 'video' | 'text' | 'quiz' | 'interactive';
    duration_minutes: number;
    content: any[];
  };
  onProgressUpdate: (progress: number) => void;
  onComplete: () => void;
  isCompleted: boolean;
}

export const LessonPlayer: React.FC<LessonPlayerProps> = ({
  lesson,
  onProgressUpdate,
  onComplete,
  isCompleted
}) => {
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const progressInterval = useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, []);

  const startProgress = () => {
    if (progressInterval.current) return;
    
    setIsPlaying(true);
    progressInterval.current = setInterval(() => {
      setCurrentTime(prev => {
        const newTime = prev + 1;
        const newProgress = Math.min((newTime / (lesson.duration_minutes * 60)) * 100, 100);
        setProgress(newProgress);
        onProgressUpdate(newProgress);
        
        if (newProgress >= 100) {
          stopProgress();
        }
        
        return newTime;
      });
    }, 1000);
  };

  const stopProgress = () => {
    setIsPlaying(false);
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = undefined;
    }
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      stopProgress();
    } else {
      startProgress();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderContent = () => {
    switch (lesson.type) {
      case 'video':
        return (
          <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden relative">
            {/* Video Placeholder */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="text-8xl mb-4">🎥</div>
                <h3 className="text-2xl font-bold mb-2">{lesson.title}</h3>
                <p className="text-gray-300 mb-6 max-w-md">{lesson.description}</p>
                
                {/* Play Controls */}
                <div className="space-y-4">
                  <button
                    onClick={togglePlayPause}
                    disabled={isCompleted}
                    className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white px-8 py-4 rounded-full text-xl font-semibold transition-colors duration-200 disabled:opacity-50"
                  >
                    {isCompleted ? '✅ Completado' : isPlaying ? '⏸️ Pausar' : '▶️ Reproducir'}
                  </button>
                  
                  {/* Progress Bar */}
                  <div className="w-full max-w-md mx-auto">
                    <div className="flex justify-between text-sm text-gray-300 mb-2">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(lesson.duration_minutes * 60)}</span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-[var(--color-primary)] h-2 rounded-full transition-all duration-200"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'text':
        return (
          <div className="bg-white rounded-lg p-8 max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">{lesson.title}</h2>
              <div className="text-gray-600 mb-8">{lesson.description}</div>
              
              {/* Simulated text content */}
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-gray-900">Introducción a la Ciberseguridad</h3>
                
                <p className="text-gray-700 leading-relaxed">
                  La ciberseguridad es la práctica de proteger sistemas, redes y programas de ataques digitales. 
                  Estos ciberataques generalmente apuntan a acceder, cambiar o destruir información confidencial; 
                  extorsionar dinero de los usuarios; o interrumpir los procesos de negocio normales.
                </p>
                
                <h4 className="text-xl font-semibold text-gray-900">Tipos de Amenazas</h4>
                
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li><strong>Malware:</strong> Software malicioso diseñado para dañar o acceder ilegalmente a sistemas</li>
                  <li><strong>Phishing:</strong> Intentos de engañar a los usuarios para que revelen información confidencial</li>
                  <li><strong>Ransomware:</strong> Tipo de malware que cifra archivos y exige rescate</li>
                  <li><strong>Ataques DDoS:</strong> Sobrecarga de sistemas para hacerlos inaccesibles</li>
                </ul>
                
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-6">
                  <h5 className="font-semibold text-blue-900">💡 Tip Importante</h5>
                  <p className="text-blue-800 mt-2">
                    Siempre mantén actualizado tu software y usa contraseñas fuertes y únicas para cada cuenta.
                  </p>
                </div>
                
                <p className="text-gray-700">
                  Para considerarse completado este contenido, asegúrate de leer todo el material y 
                  hacer clic en "Marcar como completado" al final.
                </p>
                
                <div className="text-center pt-8">
                  <button
                    onClick={() => {
                      setProgress(100);
                      onProgressUpdate(100);
                    }}
                    disabled={isCompleted}
                    className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 disabled:opacity-50"
                  >
                    {isCompleted ? '✅ Completado' : '✓ Marcar como Completado'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'quiz':
        return (
          <div className="bg-white rounded-lg p-8 max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🧠</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{lesson.title}</h2>
              <p className="text-gray-600">{lesson.description}</p>
            </div>
            
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-yellow-900 mb-4">
                  Quiz: Fundamentos de Ciberseguridad
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-yellow-800 mb-3">
                      <strong>Pregunta 1:</strong> ¿Qué es el phishing?
                    </p>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-yellow-800">
                        <input type="radio" name="q1" className="text-yellow-600" />
                        <span>Un tipo de malware</span>
                      </label>
                      <label className="flex items-center gap-2 text-yellow-800">
                        <input type="radio" name="q1" className="text-yellow-600" />
                        <span>Un intento de engañar para obtener información confidencial</span>
                      </label>
                      <label className="flex items-center gap-2 text-yellow-800">
                        <input type="radio" name="q1" className="text-yellow-600" />
                        <span>Un tipo de firewall</span>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="text-center mt-6">
                  <button
                    onClick={() => {
                      setProgress(100);
                      onProgressUpdate(100);
                    }}
                    disabled={isCompleted}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 disabled:opacity-50"
                  >
                    {isCompleted ? '✅ Quiz Completado' : 'Enviar Respuestas'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'interactive':
        return (
          <div className="bg-white rounded-lg p-8 max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🎮</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{lesson.title}</h2>
              <p className="text-gray-600">{lesson.description}</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-8">
              <h3 className="text-xl font-semibold text-purple-900 mb-6">
                Simulador: Identificación de Amenazas
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <h4 className="font-medium text-purple-800">Escenario</h4>
                  <p className="text-purple-700 bg-white/50 p-4 rounded-lg">
                    Has recibido un email que dice ser de tu banco, solicitando que verifiques 
                    tu cuenta haciendo clic en un enlace. ¿Qué harías?
                  </p>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium text-purple-800">Opciones</h4>
                  <div className="space-y-2">
                    {[
                      'Hacer clic en el enlace inmediatamente',
                      'Verificar la dirección del remitente',
                      'Contactar al banco directamente',
                      'Ignorar el email'
                    ].map((option, index) => (
                      <button
                        key={index}
                        className="w-full text-left p-3 bg-white rounded-lg hover:bg-purple-100 transition-colors duration-200 text-purple-800"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <button
                  onClick={() => {
                    setProgress(100);
                    onProgressUpdate(100);
                  }}
                  disabled={isCompleted}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 disabled:opacity-50"
                >
                  {isCompleted ? '✅ Actividad Completada' : 'Finalizar Actividad'}
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-96">
            <div className="text-center text-gray-500">
              <div className="text-6xl mb-4">❓</div>
              <p>Tipo de contenido no soportado</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="h-full bg-gray-100 overflow-y-auto">
      <div className="min-h-full flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-5xl"
        >
          {renderContent()}
        </motion.div>
      </div>
    </div>
  );
};