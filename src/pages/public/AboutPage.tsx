import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/Button/Button';
import { Card } from '../../components/ui/Card/Card';
import { MediaImage } from '../../shared/components/media/MediaImage';

// About content configurations
export type AboutVariant = 'edtech' | 'corporate' | 'custom';

export interface AboutFeature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export interface AboutStat {
  label: string;
  value: string;
}

export interface AboutSection {
  title: string;
  description: string;
}

export interface AboutProps {
  variant?: AboutVariant;
  customTitle?: string;
  customSubtitle?: string;
  customDescription?: string;
  customFeatures?: AboutFeature[];
  customStats?: AboutStat[];
  customSections?: {
    mission?: AboutSection;
    vision?: AboutSection;
  };
  customImage?: string;
  showHeader?: boolean;
  onGetStarted?: () => void;
  onLearnMore?: () => void;
  className?: string;
}

const About: React.FC<AboutProps> = ({
  variant = 'edtech',
  customTitle,
  customSubtitle,
  customDescription,
  customFeatures,
  customStats,
  customSections,
  customImage,
  showHeader = false,
  onGetStarted,
  onLearnMore,
  className = '',
}) => {
  // Default configurations
  const configs = {
    edtech: {
      title: 'El futuro es tecnológico',
      subtitle: 'tecnológico',
      description: 'En VanguardIA transformamos la educación con tecnología de vanguardia. Nuestra plataforma utiliza IA, realidad virtual y metodologías innovadoras para crear la experiencia de aprendizaje más efectiva del mercado.',
      features: [
        {
          icon: (
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          ),
          title: 'Certificación Internacional',
          description: 'Programas acreditados internacionalmente que validan tus competencias en el mercado global.'
        },
        {
          icon: (
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          ),
          title: 'IA y Personalización',
          description: 'Utilizamos inteligencia artificial para personalizar tu experiencia de aprendizaje según tu ritmo y estilo.'
        },
        {
          icon: (
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          ),
          title: 'Red Global de Talentos',
          description: 'Conéctate con profesionales de todo el mundo y construye tu red de contactos en la industria tech.'
        }
      ],
      stats: [
        { label: 'Estudiantes Globales', value: '25,000+' },
        { label: 'Cursos Especializados', value: '150+' },
        { label: 'Horas de Contenido', value: '5,000+' },
        { label: 'Tasa de Éxito', value: '96%' }
      ],
      sections: {
        mission: {
          title: 'Nuestra Visión Tecnológica',
          description: 'Democratizar el acceso a educación tecnológica de clase mundial, empoderando a profesionales de todo el mundo para que lideren la transformación digital en sus industrias.'
        },
        vision: {
          title: 'Nuestro Impacto Global',
          description: 'Ser la plataforma educativa más innovadora y efectiva a nivel global, formando a la próxima generación de líderes tecnológicos que transformarán el mundo.'
        }
      },
      ctaTitle: '¿Listo para liderar el futuro?',
      ctaSubtitle: 'Únete a más de 25,000 profesionales que ya están construyendo el futuro tecnológico',
      image: 'team.jpeg'
    },
    corporate: {
      title: 'Tu desarrollo es nuestro éxito',
      subtitle: 'nuestro éxito',
      description: 'En VanguardIA, creemos que el crecimiento profesional de nuestro equipo es fundamental para brindar un servicio excepcional. Nuestra plataforma educativa está diseñada para potenciar tus habilidades y conocimientos.',
      features: [
        {
          icon: (
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          ),
          title: 'Certificación Profesional',
          description: 'Programas acreditados que impulsan tu desarrollo profesional y crecimiento dentro de la cooperativa.'
        },
        {
          icon: (
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          ),
          title: 'Metodología Innovadora',
          description: 'Combinamos teoría y práctica con tecnología de vanguardia para una experiencia de aprendizaje óptima.'
        },
        {
          icon: (
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          ),
          title: 'Comunidad de Aprendizaje',
          description: 'Forma parte de una red de profesionales comprometidos con la excelencia y el crecimiento mutuo.'
        }
      ],
      stats: [
        { label: 'Cursos terminados', value: '450+' },
        { label: 'Programas Disponibles', value: '15+' },
        { label: 'Horas de Formación', value: '2,000+' },
        { label: 'Índice de Satisfacción', value: '98%' }
      ],
      sections: {
        mission: {
          title: 'Nuestra Misión',
          description: 'Brindar formación integral y especializada a nuestro equipo humano, fortaleciendo sus competencias profesionales y promoviendo una cultura de aprendizaje continuo que se traduzca en un servicio de excelencia para nuestros socios.'
        },
        vision: {
          title: 'Nuestra Visión',
          description: 'Ser reconocidos como la cooperativa líder en desarrollo de talento humano del sector financiero, con un equipo altamente capacitado que inspire confianza y genere valor agregado en cada interacción con nuestros socios.'
        }
      },
      ctaTitle: '¿Listo para impulsar tu carrera?',
      ctaSubtitle: 'Únete a más de 450 colaboradores que ya están transformando su futuro profesional',
      image: 'team.jpeg'
    }
  };

  // Use custom content or default based on variant
  const config = variant === 'custom' ? {} : configs[variant];
  const title = customTitle || config.title || 'Sobre Nosotros';
  const subtitle = customSubtitle || config.subtitle || '';
  const description = customDescription || config.description || '';
  const features = customFeatures || config.features || [];
  const stats = customStats || config.stats || [];
  const sections = customSections || config.sections || {};
  const image = customImage || config.image || 'team.jpeg';
  const ctaTitle = config.ctaTitle || '¿Listo para comenzar?';
  const ctaSubtitle = config.ctaSubtitle || 'Únete a nuestra comunidad';

  return (
    <div className={`min-h-screen bg-white dark:bg-gray-900 ${className}`}>
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-primary-500 via-secondary-800 to-primary-900 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ scale: [1.2, 1, 1.2], rotate: [360, 180, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-acent-500/20 rounded-full blur-3xl"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                {title.split(' ').slice(0, -1).join(' ')}{' '}
                <span className="text-acent-500">{subtitle}</span>
              </h1>
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                {description}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  variant="primary" 
                  size="lg" 
                  className="text-lg px-8 py-4"
                  onClick={onGetStarted}
                >
                  Explora Nuestros Programas
                </Button>
              </div>
            </motion.div>

            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={image} 
                  alt="Equipo VanguardIA" 
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-900/50 to-transparent"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {stats.length > 0 && (
        <section className="py-16 bg-gray-50 dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`grid md:grid-cols-${Math.min(stats.length, 4)} gap-8`}>
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="text-3xl md:text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 font-medium">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      {features.length > 0 && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                {variant === 'edtech' ? '¿Por qué somos líderes en EdTech?' : '¿Por qué elegir nuestra plataforma?'}
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                {variant === 'edtech' 
                  ? 'Innovamos constantemente para ofrecer la experiencia educativa más avanzada y efectiva del mercado'
                  : 'Ofrecemos una experiencia educativa integral diseñada especialmente para el éxito de nuestro equipo VanguardIA'
                }
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  className="group"
                >
                  <Card padding="lg" hover className="h-full text-center">
                    <div className="inline-flex p-4 rounded-2xl bg-gradient-to-bl from-primary-500 to-secondary-600 text-white mb-6 group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Mission & Vision Section */}
      {sections.mission || sections.vision ? (
        <section className="py-20 bg-gray-50 dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {sections.mission && (
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  <Card variant="primary" padding="lg">
                    <h3 className="text-2xl font-bold text-primary-900 dark:text-primary-100 mb-4">
                      {sections.mission.title}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {sections.mission.description}
                    </p>
                  </Card>
                </motion.div>
              )}

              {sections.vision && (
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <Card variant="primary" padding="lg">
                    <h3 className="text-2xl font-bold text-acent-900 dark:text-acent-100 mb-4">
                      {sections.vision.title}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {sections.vision.description}
                    </p>
                  </Card>
                </motion.div>
              )}
            </div>
          </div>
        </section>
      ) : null}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-800">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              {ctaTitle}
            </h2>
            <p className="text-xl text-white/90 mb-8">
              {ctaSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button 
                variant="primary" 
                size="lg" 
                className="text-lg px-8 py-4"
                onClick={onGetStarted}
              >
                Comenzar Ahora
              </Button>
              <Button 
                variant="secondary" 
                size="lg" 
                className="text-lg px-8 py-4"
                onClick={onLearnMore}
              >
                Conoce Más
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;