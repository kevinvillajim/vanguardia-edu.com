import React from 'react';

interface PreviewSectionProps {
  title?: string;
  className?: string;
  children: React.ReactNode;
}

export const PreviewSection: React.FC<PreviewSectionProps> = ({
  title = 'Vista previa',
  className = '',
  children
}) => {
  return (
    <div className={`bg-gray-50 p-4 rounded-lg ${className}`}>
      <h4 className="text-sm font-medium text-gray-700 mb-3">{title}</h4>
      {children}
    </div>
  );
};

interface PreviewContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const PreviewContainer: React.FC<PreviewContainerProps> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`relative bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 ${className}`}>
      {children}
    </div>
  );
};