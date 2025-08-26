// Course content components with clean architecture
export { default as Banner } from './Banner';
export { default as Video, VideoProvider } from './Video';
export { default as Paragraph } from './Paragraph';
export { default as Image } from './Image';
export { default as Quiz } from './Quiz';

// Re-export component types from domain
export type { CourseComponent, QuizQuestion, ComponentType } from '../../../domain/entities/Course';