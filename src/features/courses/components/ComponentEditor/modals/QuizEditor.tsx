import React, { useState } from 'react';
import { Plus, Trash2, Clock, Award, HelpCircle, Settings } from 'lucide-react';
import Button from '../../../../../components/ui/Button/Button';
import { 
  FormField, 
  TextInput, 
  PreviewSection,
  SettingsSection,
  CheckboxField
} from '../shared';
import Quiz from '../../Quiz';

interface QuizQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  question: string;
  options?: string[];
  correct_answer: string | number;
  explanation?: string;
  points: number;
}

interface QuizContent {
  title: string;
  questions: QuizQuestion[];
  passing_score: number;
  time_limit?: number | null;
  attempts_allowed: number;
  show_correct_answers: boolean;
}

interface ComponentData {
  id: string;
  type: string;
  title: string;
  content?: QuizContent;
  metadata?: any;
}

interface QuizEditorProps {
  component: ComponentData;
  onUpdate: (updates: Partial<ComponentData>) => void;
  moduleId: string;
}

export const QuizEditor: React.FC<QuizEditorProps> = ({
  component,
  onUpdate,
  moduleId
}) => {
  const [activeTab, setActiveTab] = useState<'questions' | 'settings'>('questions');
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  
  const content = component.content || {
    title: component.title,
    questions: [],
    passing_score: 70,
    time_limit: null,
    attempts_allowed: 3,
    show_correct_answers: true
  };

  const updateContent = (updates: Partial<QuizContent>) => {
    const newContent = { ...content, ...updates };
    onUpdate({ content: newContent });
  };

  const addQuestion = (type: QuizQuestion['type']) => {
    const newQuestion: QuizQuestion = {
      id: `question-${Date.now()}`,
      type,
      question: '',
      correct_answer: type === 'multiple_choice' ? 0 : type === 'true_false' ? 'true' : '',
      points: 1
    };

    if (type === 'multiple_choice') {
      newQuestion.options = ['Opción 1', 'Opción 2', 'Opción 3', 'Opción 4'];
    }

    updateContent({
      questions: [...(content.questions || []), newQuestion]
    });
    setEditingQuestion(newQuestion.id);
  };

  const updateQuestion = (questionId: string, updates: Partial<QuizQuestion>) => {
    const updatedQuestions = (content.questions || []).map(q =>
      q.id === questionId ? { ...q, ...updates } : q
    );
    updateContent({ questions: updatedQuestions });
  };

  const deleteQuestion = (questionId: string) => {
    const updatedQuestions = (content.questions || []).filter(q => q.id !== questionId);
    updateContent({ questions: updatedQuestions });
    setEditingQuestion(null);
  };

  const addOption = (questionId: string) => {
    const question = (content.questions || []).find(q => q.id === questionId);
    if (question && question.options) {
      const newOptions = [...question.options, `Opción ${question.options.length + 1}`];
      updateQuestion(questionId, { options: newOptions });
    }
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    const question = (content.questions || []).find(q => q.id === questionId);
    if (question && question.options && question.options.length > 2) {
      const newOptions = question.options.filter((_, index) => index !== optionIndex);
      const updates: Partial<QuizQuestion> = { options: newOptions };
      
      // Adjust correct answer if necessary
      if (question.correct_answer === optionIndex) {
        updates.correct_answer = 0;
      } else if (typeof question.correct_answer === 'number' && question.correct_answer > optionIndex) {
        updates.correct_answer = question.correct_answer - 1;
      }
      
      updateQuestion(questionId, updates);
    }
  };

  const getTotalPoints = () => {
    return (content.questions || []).reduce((sum, q) => sum + (q.points || 1), 0);
  };

  // Convert QuizEditor format to Quiz component format
  const convertToQuizFormat = () => {
    return (content.questions || []).map(q => ({
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
    }));
  };

  const renderQuestionEditor = (question: QuizQuestion) => {
    return (
      <div className="space-y-4 border border-gray-300 rounded-lg p-4 bg-white">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900">
            Pregunta {(content.questions || []).findIndex(q => q.id === question.id) + 1}
          </h4>
          <div className="flex items-center space-x-2">
            <select
              value={question.type}
              onChange={(e) => updateQuestion(question.id, { 
                type: e.target.value as QuizQuestion['type'],
                correct_answer: e.target.value === 'multiple_choice' ? 0 : 
                               e.target.value === 'true_false' ? 'true' : '',
                options: e.target.value === 'multiple_choice' ? ['Opción 1', 'Opción 2'] : undefined
              })}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="multiple_choice">Opción múltiple</option>
              <option value="true_false">Verdadero/Falso</option>
              <option value="short_answer">Respuesta corta</option>
            </select>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteQuestion(question.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pregunta *
          </label>
          <textarea
            value={question.question}
            onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            rows={3}
            placeholder="Escribe tu pregunta aquí..."
          />
        </div>

        {question.type === 'multiple_choice' && question.options && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Opciones de respuesta
            </label>
            <div className="space-y-2">
              {question.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name={`correct-${question.id}`}
                    checked={question.correct_answer === index}
                    onChange={() => updateQuestion(question.id, { correct_answer: index })}
                    className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                  />
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...question.options!];
                      newOptions[index] = e.target.value;
                      updateQuestion(question.id, { options: newOptions });
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder={`Opción ${index + 1}`}
                  />
                  {question.options.length > 2 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(question.id, index)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              {question.options.length < 6 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => addOption(question.id)}
                  className="text-primary-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar opción
                </Button>
              )}
            </div>
          </div>
        )}

        {question.type === 'true_false' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Respuesta correcta
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name={`tf-${question.id}`}
                  checked={question.correct_answer === 'true'}
                  onChange={() => updateQuestion(question.id, { correct_answer: 'true' })}
                  className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                />
                <span className="ml-2">Verdadero</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name={`tf-${question.id}`}
                  checked={question.correct_answer === 'false'}
                  onChange={() => updateQuestion(question.id, { correct_answer: 'false' })}
                  className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                />
                <span className="ml-2">Falso</span>
              </label>
            </div>
          </div>
        )}

        {question.type === 'short_answer' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Respuesta correcta
            </label>
            <input
              type="text"
              value={question.correct_answer}
              onChange={(e) => updateQuestion(question.id, { correct_answer: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Respuesta esperada"
            />
            <p className="text-xs text-gray-500 mt-1">
              Para respuestas cortas, se comparará exactamente con esta respuesta
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Puntos
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={question.points}
              onChange={(e) => updateQuestion(question.id, { points: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Explicación (opcional)
          </label>
          <textarea
            value={question.explanation || ''}
            onChange={(e) => updateQuestion(question.id, { explanation: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            rows={2}
            placeholder="Explica por qué esta es la respuesta correcta..."
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <FormField label="Título del Quiz" required>
        <TextInput
          value={content.title}
          onChange={(value) => updateContent({ title: value })}
          placeholder="Título del quiz"
        />
      </FormField>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('questions')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'questions'
              ? 'bg-white text-primary-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <HelpCircle className="w-4 h-4 inline mr-2" />
          Preguntas ({(content.questions || []).length})
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'settings'
              ? 'bg-white text-primary-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Settings className="w-4 h-4 inline mr-2" />
          Configuración
        </button>
      </div>

      {activeTab === 'questions' && (
        <div className="space-y-6">
          {/* Agregar preguntas */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() => addQuestion('multiple_choice')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Opción múltiple
            </Button>
            <Button
              variant="secondary"
              onClick={() => addQuestion('true_false')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Verdadero/Falso
            </Button>
            <Button
              variant="secondary"
              onClick={() => addQuestion('short_answer')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Respuesta corta
            </Button>
          </div>

          {/* Lista de preguntas */}
          {(content.questions || []).length === 0 ? (
            <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
              <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No hay preguntas en este quiz</p>
              <p className="text-sm text-gray-500">
                Agrega preguntas usando los botones de arriba
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {(content.questions || []).map((question, index) => (
                <div key={question.id}>
                  {editingQuestion === question.id ? (
                    <div>
                      {renderQuestionEditor(question)}
                      <div className="mt-4 flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          onClick={() => setEditingQuestion(null)}
                        >
                          Cerrar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className="border border-gray-200 rounded-lg p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => setEditingQuestion(question.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {index + 1}. {question.question || 'Sin pregunta'}
                          </h4>
                          <p className="text-sm text-gray-500 mt-1">
                            {question.type === 'multiple_choice' && 'Opción múltiple'} 
                            {question.type === 'true_false' && 'Verdadero/Falso'}
                            {question.type === 'short_answer' && 'Respuesta corta'}
                            {' • '} {question.points} punto{question.points !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteQuestion(question.id);
                          }}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6">
          <SettingsSection title="Calificación">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Puntaje para aprobar (%)">
                <TextInput
                  type="number"
                  min="0"
                  max="100"
                  value={content.passing_score}
                  onChange={(value) => updateContent({ passing_score: parseInt(value) || 70 })}
                />
              </FormField>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Intentos permitidos
                </label>
                <select
                  value={content.attempts_allowed}
                  onChange={(e) => updateContent({ attempts_allowed: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value={1}>1 intento</option>
                  <option value={2}>2 intentos</option>
                  <option value={3}>3 intentos</option>
                  <option value={5}>5 intentos</option>
                  <option value={-1}>Ilimitados</option>
                </select>
              </div>
            </div>
          </SettingsSection>

          <SettingsSection title="Tiempo">
            <div className="space-y-4">
              <CheckboxField
                checked={content.time_limit !== null}
                onChange={(checked) => updateContent({ 
                  time_limit: checked ? 30 : null 
                })}
                label="Límite de tiempo - Establecer un tiempo máximo para completar el quiz"
              />
              
              {content.time_limit !== null && (
                <FormField label="Tiempo límite (minutos)">
                  <TextInput
                    type="number"
                    min="5"
                    max="180"
                    value={content.time_limit}
                    onChange={(value) => updateContent({ time_limit: parseInt(value) || 30 })}
                  />
                </FormField>
              )}
            </div>
          </SettingsSection>

          <SettingsSection title="Retroalimentación">
            <CheckboxField
              checked={content.show_correct_answers}
              onChange={(checked) => updateContent({ show_correct_answers: checked })}
              label="Mostrar respuestas correctas - Los estudiantes verán las respuestas correctas después de completar el quiz"
            />
          </SettingsSection>

          <PreviewSection title="📊 Resumen del quiz" className="bg-blue-50">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-blue-700">
                <span className="font-medium">{(content.questions || []).length}</span> preguntas
              </div>
              <div className="text-blue-700">
                <span className="font-medium">{getTotalPoints()}</span> puntos totales
              </div>
              <div className="text-blue-700">
                <span className="font-medium">{content.passing_score}%</span> para aprobar
              </div>
              <div className="text-blue-700">
                <span className="font-medium">
                  {content.time_limit ? `${content.time_limit} min` : 'Sin límite'}
                </span> de tiempo
              </div>
            </div>
          </PreviewSection>
        </div>
      )}

      {/* Vista previa del quiz */}
      {(content.questions || []).length > 0 && (
        <PreviewSection title="Vista previa del quiz">
          <div className="max-h-96 overflow-y-auto">
            <Quiz
              questions={convertToQuizFormat()}
              courseTitle={content.title}
              passingScore={content.passing_score}
              enableTimer={content.time_limit !== null}
              showExplanations={content.show_correct_answers}
              maxAttempts={content.attempts_allowed}
              className="!my-0 !bg-transparent !px-0"
            />
          </div>
        </PreviewSection>
      )}
    </div>
  );
};