import React from 'react';
import { Outlet } from 'react-router-dom';

interface BaseLayoutProps {
  children?: React.ReactNode;
}

export const BaseLayout: React.FC<BaseLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="flex-1">
        {children || <Outlet />}
      </main>
    </div>
  );
};