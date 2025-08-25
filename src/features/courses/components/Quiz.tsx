import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  Home, 
  Clock, 
  Award, 
  RotateCcw,
  Eye,
  EyeOff,
  Target,
  TrendingUp,
  Play,
  HelpCircle
} from 'lucide-react';
import Button from '../../../components/ui/Button/Button';
import { useAuthStore } from '../../../shared/store/authStore';
import { createComponentLogger } from '../../../shared/utils/logger';

const logger = createComponentLogger('Quiz');

interface QuizQuestion {
  id?: string;
  question: string;
  options?: string[]; // Optional for short answer questions
  answer: number | string; // Can be number (index) for MC/TF, or string for short answer
  explanation?: string;
  points?: number;
  timeLimit?: number; // in seconds
  category?: string;
}

interface QuizAttempt {
  questionId: string;
  selectedAnswer: number | string;
  isCorrect: boolean;
  timeSpent: number;
  timestamp: Date;
}

interface QuizAnalytics {
  totalAttempts: number;
  averageScore: number;
  timeSpent: number;
  strongAreas: string[];
  weakAreas: string[];
}

interface QuizProps {
  /** Array of quiz questions */
  questions: QuizQuestion[];
  /** Legacy unit prop */
  unit?: number;
  /** Legacy course prop */
  course?: number;
  /** Course ID for analytics */
  courseId?: number;
  /** Unit ID for analytics */
  unitId?: number;
  /** Course title for display */
  courseTitle?: string;
  /** Callback when quiz is completed successfully */
  onComplete?: (score: number, analytics: QuizAnalytics) => void;
  /** URL to navigate after successful completion */
  nextUnitUrl?: string;
  /** Minimum passing score (0-100) */
  passingScore?: number;
  /** Enable time tracking */
  enableTimer?: boolean;
  /** Enable explanations after submission */
  showExplanations?: boolean;
  /** Enable review mode */
  enableReview?: boolean;
  /** Maximum attempts allowed */
  maxAttempts?: number;
  /** Custom CSS classes */
  className?: string;
}

/**
 * Advanced Quiz component with analytics, timer, and learning features
 * Follows clean architecture principles and educational best practices
 */
export const Quiz: React.FC<QuizProps> = ({
  questions,
  unit,
  course,
  courseId,
  unitId,
  courseTitle,
  onComplete,
  nextUnitUrl,
  passingScore = 70,
  enableTimer = false,
  showExplanations = true,
  enableReview = true,
  maxAttempts = 3,
  className = ''
}) => {
  // State management
  const [answers, setAnswers] = useState<{[key: number]: number | string | null}>(
    questions.reduce((acc, _, index) => ({...acc, [index]: null}), {})
  );
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [currentAttempt, setCurrentAttempt] = useState(1);
  const [score, setScore] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [questionStartTimes, setQuestionStartTimes] = useState<{[key: number]: Date}>({});

  const navigate = useNavigate();
  const { user } = useAuthStore();

  logger.debug('Quiz component rendered', {
    questionsCount: questions.length,
    courseId,
    unitId,
    currentAttempt,
    passingScore
  });

  // Initialize timer only when quiz starts
  useEffect(() => {
    if (enableTimer && hasStarted && !startTime) {
      const now = new Date();
      setStartTime(now);
      setQuestionStartTimes({0: now});
    }
  }, [enableTimer, hasStarted, startTime]);

  // Update timer - stop when quiz is finished
  useEffect(() => {
    if (!enableTimer || !startTime || showResult) return;

    const interval = setInterval(() => {
      setTimeElapsed(Math.floor((Date.now() - startTime.getTime()) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [enableTimer, startTime, showResult]);

  // Format time display
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Handle answer selection
  const handleAnswerChange = useCallback((questionIndex: number, optionIndex: number) => {
    setAnswers(prev => ({...prev, [questionIndex]: optionIndex}));
    
    // Track time spent on previous question
    if (enableTimer && questionStartTimes[questionIndex]) {
      const timeSpent = Date.now() - questionStartTimes[questionIndex].getTime();
      logger.debug('Time spent on question', { questionIndex, timeSpent });
    }
    
    // Set start time for next question
    if (enableTimer) {
      setQuestionStartTimes(prev => ({
        ...prev,
        [questionIndex + 1]: new Date()
      }));
    }
  }, [enableTimer, questionStartTimes]);

  // Handle text answer for short answer questions
  const handleTextAnswer = useCallback((questionIndex: number, text: string) => {
    setAnswers(prev => ({...prev, [questionIndex]: text}));
  }, []);

  // Sanitize text for comparison
  const sanitizeText = useCallback((text: string): string => {
    if (typeof text !== 'string') return '';
    return text
      .toLowerCase()
      .trim()
      .replace(/[.,!?;:"""''`()[\]{}]/g, '') // Remove punctuation
      .replace(/\s+/g, ' ') // Multiple spaces to single space
      .trim(); // Final trim
  }, []);

  // Calculate quiz analytics
  const calculateAnalytics = useCallback((answersMap: {[key: number]: number | string | null}): QuizAnalytics => {
    const correctAnswers = questions.reduce((count, question, index) => {
      const userAnswer = answersMap[index];
      
      // Check for short answer questions (when answer is a string)
      if (typeof question.answer === 'string' && typeof userAnswer === 'string') {
        const sanitizedUser = sanitizeText(userAnswer);
        const sanitizedCorrect = sanitizeText(question.answer);
        return count + (sanitizedUser === sanitizedCorrect ? 1 : 0);
      }
      
      // Normal multiple choice/true-false
      return count + (userAnswer === question.answer ? 1 : 0);
    }, 0);

    const scorePercentage = (correctAnswers / questions.length) * 100;
    
    // Analyze performance by category
    const categoryPerformance: {[key: string]: {correct: number, total: number}} = {};
    questions.forEach((question, index) => {
      const category = question.category || 'General';
      if (!categoryPerformance[category]) {
        categoryPerformance[category] = {correct: 0, total: 0};
      }
      categoryPerformance[category].total++;
      const userAnswer = answersMap[index];
      
      // Check for short answer questions
      if (typeof question.answer === 'string' && typeof userAnswer === 'string') {
        if (sanitizeText(userAnswer) === sanitizeText(question.answer)) {
          categoryPerformance[category].correct++;
        }
      } else if (userAnswer === question.answer) {
        categoryPerformance[category].correct++;
      }
    });

    const strongAreas: string[] = [];
    const weakAreas: string[] = [];
    
    Object.entries(categoryPerformance).forEach(([category, performance]) => {
      const percentage = (performance.correct / performance.total) * 100;
      if (percentage >= 80) {
        strongAreas.push(category);
      } else if (percentage < 60) {
        weakAreas.push(category);
      }
    });

    return {
      totalAttempts: currentAttempt,
      averageScore: scorePercentage,
      timeSpent: timeElapsed,
      strongAreas,
      weakAreas
    };
  }, [questions, currentAttempt, timeElapsed]);

  // Submit quiz
  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    logger.info('Quiz submission started', { currentAttempt, timeElapsed });

    try {
      // Capture final time when quiz is submitted
      const finalTime = startTime ? Math.floor((Date.now() - startTime.getTime()) / 1000) : timeElapsed;
      setTimeElapsed(finalTime);
      
      const analytics = calculateAnalytics(answers);
      const currentScore = analytics.averageScore;
      
      setScore(currentScore);
      setShowResult(true);

      // Record attempt
      const newAttempts = questions.map((question, index) => {
        const userAnswer = answers[index];
        let isCorrect = false;
        
        // Check for short answer questions
        if (typeof question.answer === 'string' && typeof userAnswer === 'string') {
          isCorrect = sanitizeText(userAnswer) === sanitizeText(question.answer);
        } else {
          isCorrect = userAnswer === question.answer;
        }
        
        return {
          questionId: question.id || `q${index}`,
          selectedAnswer: userAnswer || 0,
          isCorrect,
          timeSpent: questionStartTimes[index] ? 
            Date.now() - questionStartTimes[index].getTime() : 0,
          timestamp: new Date()
        };
      });

      setAttempts(prev => [...prev, ...newAttempts]);

      if (currentScore >= passingScore) {
        logger.success('Quiz passed', { score: currentScore, attempts: currentAttempt });
        onComplete?.(currentScore, analytics);
      } else {
        logger.warn('Quiz failed', { score: currentScore, attempts: currentAttempt });
      }

    } catch (error) {
      logger.error('Quiz submission error', { error });
    } finally {
      setIsSubmitting(false);
    }
  }, [
    isSubmitting, 
    calculateAnalytics, 
    answers, 
    questions, 
    questionStartTimes, 
    currentAttempt, 
    passingScore, 
    onComplete,
    timeElapsed
  ]);

  // Start quiz
  const startQuiz = useCallback(() => {
    setHasStarted(true);
    if (enableTimer) {
      const now = new Date();
      setStartTime(now);
      setQuestionStartTimes({0: now});
    }
    logger.info('Quiz started', { attempt: currentAttempt });
  }, [enableTimer, currentAttempt]);

  // Reset quiz for retry
  const resetQuiz = useCallback(() => {
    setAnswers(questions.reduce((acc, _, index) => ({...acc, [index]: null}), {}));
    setScore(null);
    setShowResult(false);
    setShowReview(false);
    setHasStarted(false);
    setCurrentAttempt(prev => prev + 1);
    setStartTime(null);
    setTimeElapsed(0);
    setQuestionStartTimes({});
    logger.info('Quiz reset for retry', { attempt: currentAttempt + 1 });
  }, [questions, currentAttempt]);

  // Navigation
  const handleContinue = useCallback(() => {
    const nextLink = nextUnitUrl || '/student/dashboard';
    navigate(nextLink);
  }, [nextUnitUrl, navigate]);

  // Computed values
  const allQuestionsAnswered = useMemo(() => 
    Object.values(answers).every(answer => {
      if (answer === null || answer === undefined) return false;
      if (typeof answer === 'string') return answer.trim() !== '';
      return true;
    }),
    [answers]
  );

  const passed = useMemo(() => 
    score !== null && score >= passingScore,
    [score, passingScore]
  );

  const canRetry = useMemo(() => 
    !passed && currentAttempt < maxAttempts,
    [passed, currentAttempt, maxAttempts]
  );

  const correctAnswersCount = useMemo(() => 
    questions.reduce((count, question, index) => {
      const userAnswer = answers[index];
      
      // Check for short answer questions
      if (typeof question.answer === 'string' && typeof userAnswer === 'string') {
        return count + (sanitizeText(userAnswer) === sanitizeText(question.answer) ? 1 : 0);
      }
      
      return count + (userAnswer === question.answer ? 1 : 0);
    }, 0),
    [questions, answers, sanitizeText]
  );

  return (
    <div className={`md:my-20 bg-gray-50 dark:bg-gray-900 md:px-20 py-8 ${className}`}>
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-700 dark:to-primary-800 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Cuestionario{courseTitle ? ` - ${courseTitle}` : ''}
              </h1>
              <p className="opacity-90">
                {questions.length} preguntas • {passingScore}% para aprobar
              </p>
            </div>
            
            {enableTimer && startTime && (
              <div className="text-right">
                <div className="flex items-center gap-2 text-xl font-mono">
                  <Clock className="w-5 h-5" />
                  {formatTime(timeElapsed)}
                </div>
                <p className="text-sm opacity-75">Tiempo transcurrido</p>
              </div>
            )}
          </div>

          {/* Progress bar - only show when started */}
          {!showResult && hasStarted && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Progreso: {correctAnswersCount}/{questions.length}</span>
                <span>Intento {currentAttempt}/{maxAttempts}</span>
              </div>
              <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
                <div 
                  className="bg-white h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(Object.values(answers).filter(a => a !== null).length / questions.length) * 100}%`
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="p-8">
          {/* Start Quiz Button */}
          {!hasStarted && !showResult && !showReview && (
            <div className="text-center py-12">
              <div className="mb-8">
                <div className="w-20 h-20 mx-auto mb-6 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                  <Play className="w-10 h-10 text-primary-600 dark:text-primary-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  ¿Listo para comenzar?
                </h2>
                <div className="max-w-md mx-auto space-y-3 text-gray-600 dark:text-gray-400">
                  <div className="flex items-center justify-center gap-2">
                    <HelpCircle className="w-4 h-4" />
                    <span>{questions.length} preguntas</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Target className="w-4 h-4" />
                    <span>Necesitas {passingScore}% para aprobar</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <RotateCcw className="w-4 h-4" />
                    <span>Máximo {maxAttempts} intentos</span>
                  </div>
                  {enableTimer && (
                    <div className="flex items-center justify-center gap-2 text-orange-600 dark:text-orange-400">
                      <Clock className="w-4 h-4" />
                      <span>¡El cronómetro comenzará al iniciar!</span>
                    </div>
                  )}
                </div>
              </div>
              
              <Button
                onClick={startQuiz}
                size="lg"
                className="px-8 py-3"
              >
                <Play className="w-5 h-5 mr-2" />
                Comenzar Test
              </Button>
            </div>
          )}

          {/* Questions */}
          {hasStarted && !showResult && !showReview && (
            <>
              {questions.map((question, index) => (
                <div key={index} className="mb-8 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {index + 1}. {question.question}
                    </h3>
                    {question.points && (
                      <span className="text-sm bg-primary-100 dark:bg-primary-800 text-primary-800 dark:text-primary-200 px-2 py-1 rounded">
                        {question.points} pts
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    {question.options && question.options.length > 0 ? (
                      // Multiple choice or true/false questions
                      question.options.map((option, optionIndex) => (
                        <label
                          key={optionIndex}
                          className={`flex items-center space-x-3 p-4 rounded-lg cursor-pointer transition-colors
                            ${answers[index] === optionIndex 
                              ? 'bg-primary-50 dark:bg-primary-900 border-primary-200 dark:border-primary-700 border-2'
                              : 'bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-500'
                            }`}
                        >
                          <input
                            type="radio"
                            name={`question-${index}`}
                            value={optionIndex}
                            checked={answers[index] === optionIndex}
                            onChange={() => handleAnswerChange(index, optionIndex)}
                            className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-gray-900 dark:text-white">
                            {option}
                          </span>
                        </label>
                      ))
                    ) : (
                      // Short answer question
                      <div className="space-y-3">
                        <div className="bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg p-4">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Tu respuesta:
                          </label>
                          <textarea
                            value={typeof answers[index] === 'string' ? answers[index] as string : ''}
                            onChange={(e) => handleTextAnswer(index, e.target.value)}
                            placeholder="Escribe tu respuesta aquí..."
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                            rows={3}
                            maxLength={500}
                          />
                          <div className="flex justify-between items-center mt-2">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Máximo 500 caracteres
                            </p>
                            <span className="text-xs text-gray-400">
                              {typeof answers[index] === 'string' ? (answers[index] as string).length : 0}/500
                            </span>
                          </div>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
                          <p className="text-sm text-blue-800 dark:text-blue-200">
                            💡 <strong>Consejo:</strong> No te preocupes por mayúsculas, espacios extra o puntuación. 
                            El sistema comparará tu respuesta de forma inteligente.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Submit button */}
              <div className="flex justify-center">
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !allQuestionsAnswered}
                  loading={isSubmitting}
                  size="lg"
                  className="px-8"
                >
                  {isSubmitting ? 'Evaluando...' : 'Enviar Respuestas'}
                </Button>
              </div>
            </>
          )}

          {/* Results */}
          {showResult && (
            <div className="text-center">
              <div className="mb-6">
                {passed ? (
                  <div className="text-green-600 dark:text-green-400">
                    <CheckCircle className="w-20 h-20 mx-auto mb-4" />
                    <h2 className="text-3xl font-bold mb-2">¡Excelente trabajo!</h2>
                  </div>
                ) : (
                  <div className="text-red-600 dark:text-red-400">
                    <XCircle className="w-20 h-20 mx-auto mb-4" />
                    <h2 className="text-3xl font-bold mb-2">Sigue practicando</h2>
                  </div>
                )}
              </div>

              {/* Score display */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                  <Target className="w-8 h-8 mx-auto mb-2 text-primary-600" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {score?.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Puntuación Final
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                  <Award className="w-8 h-8 mx-auto mb-2 text-primary-600" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {correctAnswersCount}/{questions.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Respuestas Correctas
                  </div>
                </div>

                {enableTimer && (
                  <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                    <Clock className="w-8 h-8 mx-auto mb-2 text-primary-600" />
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatTime(timeElapsed)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Tiempo Total
                    </div>
                  </div>
                )}
              </div>

              {/* Result message */}
              <div className="mb-8">
                {passed ? (
                  <p className="text-lg text-green-600 dark:text-green-400">
                    ¡Has aprobado el cuestionario! Puedes continuar al siguiente módulo.
                  </p>
                ) : (
                  <p className="text-lg text-red-600 dark:text-red-400">
                    Necesitas {passingScore}% para aprobar. 
                    {canRetry && ` Te quedan ${maxAttempts - currentAttempt} intentos.`}
                  </p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {passed && (
                  <Button
                    onClick={handleContinue}
                    size="lg"
                    className="flex items-center gap-2"
                  >
                    {nextUnitUrl ? (
                      <>
                        <ArrowRight className="w-4 h-4" />
                        Continuar Curso
                      </>
                    ) : (
                      <>
                        <Home className="w-4 h-4" />
                        Ir al Dashboard
                      </>
                    )}
                  </Button>
                )}

                {enableReview && showExplanations && (
                  <Button
                    onClick={() => setShowReview(true)}
                    variant="outline"
                    size="lg"
                    className="flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Revisar Respuestas
                  </Button>
                )}
                
                {canRetry && (
                  <Button
                    onClick={resetQuiz}
                    variant="outline"
                    size="lg"
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Intentar de Nuevo
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Review mode */}
          {showReview && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Revisión de Respuestas
                </h2>
                <Button
                  onClick={() => setShowReview(false)}
                  variant="outline"
                  size="sm"
                >
                  <EyeOff className="w-4 h-4 mr-2" />
                  Ocultar Revisión
                </Button>
              </div>

              {questions.map((question, index) => {
                const userAnswer = answers[index];
                const correctAnswer = question.answer;
                let isCorrect = false;
                
                // Check for short answer questions
                if (typeof correctAnswer === 'string' && typeof userAnswer === 'string') {
                  isCorrect = sanitizeText(userAnswer) === sanitizeText(correctAnswer);
                } else {
                  isCorrect = userAnswer === correctAnswer;
                }

                return (
                  <div key={index} className="mb-6 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      {index + 1}. {question.question}
                    </h3>
                    
                    {question.options && question.options.length > 0 ? (
                      // Multiple choice / True-False questions
                      <div className="space-y-2 mb-4">
                        {question.options.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className={`p-3 rounded-lg flex items-center justify-between
                              ${optionIndex === correctAnswer 
                                ? 'bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700'
                                : optionIndex === userAnswer && !isCorrect
                                ? 'bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700'
                                : 'bg-white dark:bg-gray-600'
                              }`}
                          >
                            <span className="text-gray-900 dark:text-white">
                              {option}
                            </span>
                            
                            <div className="flex items-center gap-2">
                              {optionIndex === correctAnswer && (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              )}
                              {optionIndex === userAnswer && !isCorrect && (
                                <XCircle className="w-5 h-5 text-red-600" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      // Short answer question
                      <div className="space-y-4 mb-4">
                        <div className={`p-4 rounded-lg border-2 ${
                          isCorrect 
                            ? 'bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700'
                            : 'bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700'
                        }`}>
                          <div className="flex items-center gap-2 mb-2">
                            {isCorrect ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-600" />
                            )}
                            <h4 className={`font-semibold ${
                              isCorrect ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                            }`}>
                              Tu respuesta:
                            </h4>
                          </div>
                          <p className={`${
                            isCorrect ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                          }`}>
                            "{typeof userAnswer === 'string' ? userAnswer : 'Sin respuesta'}"
                          </p>
                        </div>
                        
                        {!isCorrect && (
                          <div className="p-4 bg-green-50 dark:bg-green-900 border-2 border-green-200 dark:border-green-700 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                              <h4 className="font-semibold text-green-800 dark:text-green-200">
                                Respuesta correcta:
                              </h4>
                            </div>
                            <p className="text-green-700 dark:text-green-300">
                              "{typeof correctAnswer === 'string' ? correctAnswer : 'N/A'}"
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {question.explanation && (
                      <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                          Explicación:
                        </h4>
                        <p className="text-blue-800 dark:text-blue-200">
                          {question.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Quiz;